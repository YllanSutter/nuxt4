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

      if (!bundleData || !bundleData.name) {
        return {
          statusCode: 400,
          body: { error: 'Les données du bundle sont requises avec un nom' },
        };
      }

      // Créer d'abord le bundle
      const createdBundle = await prisma.bundle.create({
        data: {
          name: bundleData.name,
          price: parseFloat(bundleData.price) || 0,
          user_id: bundleData.user_id,
          link: '',
          image: '',
          platform_id: 'platform-1',
          state_id: 'private-state-id',
          month_id: 'month-8',
          year_id: 'year-3',
          is_public: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

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
        // Calculer le prix réparti pour chaque élément
        const pricePerElem = parseFloat(bundleData.price) / elems.length;

        return {
          user_id: elem.user_id,
          base_game_id: baseGames[index].id,
          name: '',
          price: pricePerElem,
          black_market_price: 0,
          sale_price: 0,
          initial_price: 0,
          playtime_hours: 0,
          rating: 0,
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
          user_id: bundleData.user_id,
          created_at: {
            gte: new Date(Date.now() - 5000) // Créés dans les dernières 5 secondes
          }
        },
        take: elems.length,
        orderBy: {
          created_at: 'desc'
        }
      });

      // Créer les relations BundleGame
      const bundleGameData = createdUserGameRecords.map((userGame, index) => ({
        bundle_id: createdBundle.id,
        user_game_id: userGame.id,
        order_in_bundle: index + 1,
      }));

      await prisma.bundleGame.createMany({
        data: bundleGameData,
      });

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