export default defineEventHandler(async (event) => {
  const prisma = event.context.prisma;
  const query = getQuery(event);
  
  // Récupérer l'utilisateur connecté depuis les cookies
  const userCookie = getCookie(event, 'user');
  let userId = null;
  let userEmail = null;
  
  try {
    // Le cookie contient un objet JSON, il faut le parser
    if (userCookie) {
      const userData = JSON.parse(userCookie);
      userId = userData.id;
      userEmail = userData.email;
    }
  } catch (error) {
    console.warn('Erreur lors du parsing du cookie utilisateur:', error);
  }
  
  // Paramètres pour filtrer les modèles à récupérer
  const requestedModels = query.models ? 
    (Array.isArray(query.models) ? query.models : [query.models]) : 
    null; // Si null, on récupère tout
  
  try {
    const modelsConfig: Record<string, any> = {
      role: { name: 'asc' },
      month: { 
        orderBy: { id: 'asc' },
      },
      year: { name: 'asc' },
      label: { 
        orderBy: { position: 'asc' },
        include: {
          label_emplacements: {
            include: {
              emplacement: true
            }
          },
          
          user_label_visibility: userId ? { where: { user_id: userId } } : true
        }
      },
      emplacement: { 
        orderBy: { name: 'asc' },
        include: {
          label_emplacements: {
            include: {
              label: true
            }
          }
        }
      },
      tag: { name: 'asc' },
      rating: { value: 'asc' },
      platform: { name: 'asc' },
      bundle: { 
        orderBy: { created_at: 'desc' },
        include: {
          month: true,
          year: true,
          platform: true
        },
        where: userId ? {
          user_id: userId
        } : undefined
      },
      bundleGame: { 
        orderBy: { order_in_bundle: 'asc' },
        include: {
          bundle: true,
          user_game: true
        },
        where: userId ? {
          user_game: {
            user_id: userId
          }
        } : undefined
      },
      userGame: { 
        orderBy: { order_in_list: 'asc' },
        include: {
          user: true,
          base_game: true,
          rating_ref: true,
          tag: true
        },
        where: userId ? {
          user_id: userId
        } : undefined
      },
      baseGame: { name: 'asc' },
      userLabelVisibility: { 
        id: 'asc',
        where: userId ? { user_id: userId } : undefined,
        orderBy: { visible: 'desc' },
      },
      state: { name: 'asc' },
      priceHistory: { date: 'desc' },
      gameStat: { date: 'desc' },
      user: { 
        orderBy: { name: 'asc' },
        include: {
          role: true,
          userLabelVisibility: true,
        }
      }
    };
    
    const modelsToFetch = requestedModels ? 
      Object.fromEntries(
        Object.entries(modelsConfig).filter(([key]) => requestedModels.includes(key))
      ) : 
      modelsConfig;
    
    const results = await Promise.all(
      Object.entries(modelsToFetch).map(async ([modelKey, config]) => {
        try {
          const ModelName = modelKey.charAt(0).toUpperCase() + modelKey.slice(1);
          const model = (prisma as any)[ModelName];
          
          if (!model) {
            console.warn(`Modèle ${ModelName} non trouvé`);
            return { [modelKey]: [] };
          }
          
          if (config.orderBy || config.include || config.where) {
            const queryOptions: any = {};
            
            if (config.orderBy) queryOptions.orderBy = config.orderBy;
            if (config.include) queryOptions.include = config.include;
            if (config.where) queryOptions.where = config.where;
            
            const data = await model.findMany(queryOptions);
            return { [modelKey]: data };
          }
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
    
    const finalResult = results.reduce((acc, result) => ({ ...acc, ...result }), {});
    
    return finalResult;
  } catch (error) {
    console.error('Erreur lors de la récupération des options:', error);
    throw createError({ statusCode: 500, message: 'Erreur lors de la récupération des options' });
  }
});