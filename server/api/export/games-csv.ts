export default defineEventHandler(async (event) => {
  const prisma = event.context.prisma;
  
  // Récupérer l'utilisateur connecté depuis les cookies
  const userCookie = getCookie(event, 'user');
  let userId = null;
  
  try {
    if (userCookie) {
      const userData = JSON.parse(userCookie);
      userId = userData.id;
    }
  } catch (error) {
    console.warn('Erreur lors du parsing du cookie utilisateur:', error);
  }

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Non autorisé' });
  }

  try {
    // Exporter seulement les jeux de l'utilisateur au format CSV
    const userGames = await prisma.userGame.findMany({
      where: { user_id: userId },
      include: {
        base_game: true,
        tag: true
      },
      orderBy: { order_in_list: 'asc' }
    });

    // Convertir en format CSV
    const csvHeaders = [
      'Nom',
      'Prix',
      'Prix marché noir',
      'Prix en solde',
      'Prix initial',
      'Heures jouées',
      'Note',
      'Tag',
      'Ordre dans la liste',
      'Date création'
    ];

    const csvRows = userGames.map((game: any) => [
      `"${game.name.replace(/"/g, '""')}"`,
      game.price.toString(),
      game.black_market_price.toString(),
      game.sale_price.toString(),
      game.initial_price.toString(),
      game.playtime_hours.toString(),
      game.rating.toString(),
      `"${game.tag?.name || ''}"`,
      game.order_in_list.toString(),
      game.created_at.toISOString()
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row: string[]) => row.join(','))
    ].join('\n');

    // Définir les headers pour le téléchargement CSV
    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8');
    setHeader(event, 'Content-Disposition', `attachment; filename="mes_jeux_${new Date().toISOString().split('T')[0]}.csv"`);
    
    return csvContent;

  } catch (error) {
    console.error('Erreur lors de l\'export CSV:', error);
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Erreur lors de l\'export des jeux' 
    });
  }
});
