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
    // Exporter toutes les données de l'utilisateur
    const exportData = {
      exportDate: new Date().toISOString(),
      userId: userId,
      
      // Données utilisateur
      userGames: await prisma.userGame.findMany({
        where: { user_id: userId },
        include: {
          base_game: true,
          tag: true,
          bundle_games: {
            include: {
              bundle: true
            }
          },
          price_history: true,
          game_stats: true
        },
        orderBy: { order_in_list: 'asc' }
      }),

      bundles: await prisma.bundle.findMany({
        where: { user_id: userId },
        include: {
          platform: true,
          state: true,
          month: true,
          year: true,
          bundle_games: {
            include: {
              user_game: {
                include: {
                  base_game: true,
                  tag: true
                }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' }
      }),

      // Données de référence (partagées)
      tags: await prisma.tag.findMany({
        orderBy: { name: 'asc' }
      }),

      platforms: await prisma.platform.findMany({
        orderBy: { name: 'asc' }
      }),

      months: await prisma.month.findMany({
        orderBy: { id: 'asc' }
      }),

      years: await prisma.year.findMany({
        orderBy: { name: 'asc' }
      }),

      states: await prisma.state.findMany({
        orderBy: { name: 'asc' }
      }),

      labels: await prisma.label.findMany({
        include: {
          label_emplacements: {
            include: {
              emplacement: true
            }
          }
        },
        orderBy: { position: 'asc' }
      }),

      emplacements: await prisma.emplacement.findMany({
        include: {
          label_emplacements: {
            include: {
              label: true
            }
          }
        },
        orderBy: { name: 'asc' }
      }),

      userLabelVisibilities: await prisma.userLabelVisibility.findMany({
        where: { user_id: userId },
        include: {
          label: true
        }
      })
    };

    // Définir les headers pour le téléchargement
    setHeader(event, 'Content-Type', 'application/json');
    setHeader(event, 'Content-Disposition', `attachment; filename="backup_${userId}_${new Date().toISOString().split('T')[0]}.json"`);
    
    return exportData;

  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Erreur lors de l\'export de la base de données' 
    });
  }
});
