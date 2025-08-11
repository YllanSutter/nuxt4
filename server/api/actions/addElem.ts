import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  if (event.req.method === 'POST') {
    try {
      // Récupérer les données du corps de la requête
      const { elems, bundleData } = await readBody(event);
      
      if (!elems || !Array.isArray(elems)) {
        return {
          statusCode: 400,
          body: { error: 'Les données elems sont requises et doivent être un tableau' },
        };
      }

      if (!bundleData) {
        return {
          statusCode: 400,
          body: { error: 'Les données du bundle sont requises' },
        };
      }

      // Vérifier selon le type d'opération
      if (bundleData.isNewBundle && !bundleData.name) {
        return {
          statusCode: 400,
          body: { error: 'Le nom du bundle est requis pour créer un nouveau bundle' },
        };
      }

      if (!bundleData.isNewBundle && !bundleData.existingBundleId) {
        return {
          statusCode: 400,
          body: { error: 'L\'ID du bundle existant est requis pour ajouter à un bundle' },
        };
      }

      let createdBundle = null;
      let targetBundleId = null;
      let state = bundleData.role_id == "user-role-id" ? 'private-state-id': 'public-state-id';
      let publicState = state == 'public-state-id' ? true : false;
      console.log(bundleData);

      if(bundleData.isNewBundle) {
        // Créer un nouveau bundle
        createdBundle = await prisma.bundle.create({
          data: {
            name: bundleData.name,
            price: parseFloat(bundleData.price) || 0,
            user_id: bundleData.user_id,
            link: '',
            image: '',
            platform_id: bundleData.platform_id || 'platform-1', // Utiliser la plateforme envoyée
            state_id: state,
            month_id: bundleData.month_id || 'month-1',
            year_id: bundleData.year_id || 'year-1',
            is_public: publicState,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
        targetBundleId = createdBundle.id;
      } else {
        // Utiliser le bundle existant
        targetBundleId = bundleData.existingBundleId;
        
        // Vérifier que le bundle existe
        const existingBundle = await prisma.bundle.findUnique({
          where: { id: targetBundleId }
        });
        
        if (!existingBundle) {
          return {
            statusCode: 404,
            body: { error: 'Bundle non trouvé' },
          };
        }
      }
     

      // Créer d'abord les BaseGame si nécessaire
      const baseGamePromises = elems.map(async (elem: any) => {
        // Chercher ou créer un BaseGame
        let baseGame = await prisma.baseGame.findFirst({
          where: { name: elem.name }
        });
        
        if (!baseGame) {
          baseGame = await prisma.baseGame.create({
            data: { name: elem.name }
          });
        }
        
        return baseGame;
      });

      const baseGames = await Promise.all(baseGamePromises);

      // Créer les données formatées pour Prisma
      const userGamesData = elems.map((elem: any, index: number) => {
        const price = bundleData.isNewBundle ? 
          (parseFloat(bundleData.price) / elems.length) : 
          (parseFloat(elem.price) || 0);

        return {
          user_id: elem.user_id,
          base_game_id: baseGames[index].id,
          name: '',
          price: price,
          black_market_price: 0,
          sale_price: 0,
          initial_price: price,
          playtime_hours: 0,
          rating: 0, // legacy, à supprimer du schéma plus tard
          rating_id: elem.rating_id || elem.rating_ref?.id || null,
          tag_id: elem.tag_id || 'tag-1',
          order_in_list: index + 1,
          created_at: new Date(elem.created_at) || new Date(),
          updated_at: new Date(elem.updated_at) || new Date(),
        };
      });

      // Créer les UserGame en une seule requête
      const createdUserGames = await prisma.userGame.createMany({
        data: userGamesData,
      });

      // Récupérer les UserGame créés pour les lier au bundle
      const createdUserGameRecords = await prisma.userGame.findMany({
        where: {
          user_id: bundleData.isNewBundle ? bundleData.user_id : elems[0]?.user_id,
          created_at: {
            gte: new Date(Date.now() - 5000) // Créés dans les dernières 5 secondes
          }
        },
        take: elems.length,
        orderBy: {
          created_at: 'desc'
        }
      });

      // Obtenir le prochain order_in_bundle pour le bundle cible
      const maxOrder = await prisma.bundleGame.aggregate({
        where: { bundle_id: targetBundleId },
        _max: { order_in_bundle: true }
      });
      
      const nextOrderStart = (maxOrder._max.order_in_bundle || 0) + 1;

      // Créer les relations BundleGame
      const bundleGameData = createdUserGameRecords.map((userGame, index) => ({
        bundle_id: targetBundleId,
        user_game_id: userGame.id,
        order_in_bundle: nextOrderStart + index,
      }));

      await prisma.bundleGame.createMany({
        data: bundleGameData,
      });

      if(bundleData.isNewBundle && createdBundle) {
        return {
          statusCode: 201,
          body: {
            success: true,
            bundle: createdBundle,
            userGamesCount: createdUserGames.count,
            bundleGamesCount: bundleGameData.length,
            message: `Bundle "${createdBundle.name}" créé avec ${createdUserGames.count} jeux`
          },
        };
      } else {
        return {
          statusCode: 201,
          body: {
            success: true,
            userGamesCount: createdUserGames.count,
            bundleGamesCount: bundleGameData.length,
            message: `${createdUserGames.count} jeux ajoutés au bundle existant`
          },
        };
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création des éléments:', error);
      return {
        statusCode: 500,
        body: { 
          error: 'Erreur lors de la création des éléments',
          details: error instanceof Error ? error.message : 'Erreur inconnue'
        },
      };
    }
  }

  return {
    statusCode: 405,
    body: { error: 'Méthode non autorisée' },
  };
});