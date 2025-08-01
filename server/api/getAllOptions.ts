export default defineEventHandler(async (event) => {
  const prisma = event.context.prisma;
  
  try {
    const modelsConfig: Record<string, any> = {
      role: { name: 'asc' },
      month: { id: 'asc' },
      year: { id: 'asc' },
      label: { position: 'asc' },
      emplacement: { name: 'asc' },
      tag: { name: 'asc' },
      platform: { name: 'asc' },
      bundle: { created_at: 'desc' },
      bundleGame: { order_in_bundle: 'asc' },
      userGame: { 
        orderBy: { order_in_list: 'asc' },
        include: {
          user: true,
          base_game: true,
          tag: true
        }
      },
      baseGame: { name: 'asc' },
      userLabelVisibility: { id: 'asc' },
      state: { name: 'asc' },
      priceHistory: { date: 'desc' },
      gameStat: { date: 'desc' },
      user: { 
        orderBy: { name: 'asc' },
        include: {
          role: true
        }
      }
    };
    
    const results = await Promise.all(
      Object.entries(modelsConfig).map(async ([modelKey, config]) => {
        try {
          const ModelName = modelKey.charAt(0).toUpperCase() + modelKey.slice(1);
          const model = (prisma as any)[ModelName];
          
          if (!model) {
            console.warn(`Modèle ${ModelName} non trouvé`);
            return { [modelKey]: [] };
          }
          
          // Si la config a un orderBy et include séparés, les utiliser
          if (config.orderBy && config.include) {
            const data = await model.findMany({ 
              orderBy: config.orderBy,
              include: config.include
            });
            return { [modelKey]: data };
          }
          // Sinon, utiliser la config comme orderBy direct
          else {
            const data = await model.findMany({ orderBy: config });
            return { [modelKey]: data };
          }
        } catch (err) {
          console.warn(`Erreur pour le modèle ${modelKey}:`, err);
          return { [modelKey]: [] };
        }
      })
    );
    
    // Fusion des résultats
    const finalResult = results.reduce((acc, result) => ({ ...acc, ...result }), {});
    
    // Debug pour voir ce qui est retourné
    // console.log('Clés retournées par getAllOptions:', Object.keys(finalResult));
    // console.log('Nombre de rôles:', finalResult.role?.length || 0);
    // console.log('Nombre d\'utilisateurs:', finalResult.user?.length || 0);
    
    return finalResult;
  } catch (error) {
    console.error('Erreur lors de la récupération des options:', error);
    throw createError({ statusCode: 500, message: 'Erreur lors de la récupération des options' });
  }
});