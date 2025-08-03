import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  if (event.req.method === 'DELETE') {
    try {
      const { type, bundleId, userGameId } = await readBody(event);
      
      if (!type || (type !== 'bundle' && type !== 'line')) {
        return {
          statusCode: 400,
          body: { error: 'Le type doit être "bundle" ou "line"' },
        };
      }

      if (type === 'bundle') {
        if (!bundleId) {
          return {
            statusCode: 400,
            body: { error: 'bundleId est requis pour supprimer un bundle' },
          };
        }

        // Récupérer tous les UserGame liés au bundle
        const bundleGames = await prisma.bundleGame.findMany({
          where: { bundle_id: bundleId },
          include: { user_game: true }
        });

        const userGameIds = bundleGames.map(bg => bg.user_game_id);

        // Supprimer en cascade
        // 1. Supprimer les relations BundleGame
        await prisma.bundleGame.deleteMany({
          where: { bundle_id: bundleId }
        });

        // 2. Supprimer les UserGame liés
        if (userGameIds.length > 0) {
          await prisma.userGame.deleteMany({
            where: { id: { in: userGameIds } }
          });
        }

        // 3. Supprimer le Bundle
        await prisma.bundle.delete({
          where: { id: bundleId }
        });

        return {
          statusCode: 200,
          body: {
            success: true,
            message: `Bundle supprimé avec ${userGameIds.length} jeux`,
            deletedUserGames: userGameIds.length,
            deletedBundle: bundleId
          },
        };

      } else if (type === 'line') {
        if (!userGameId) {
          return {
            statusCode: 400,
            body: { error: 'userGameId est requis pour supprimer une ligne' },
          };
        }

        // Supprimer la relation BundleGame
        await prisma.bundleGame.deleteMany({
          where: { user_game_id: userGameId }
        });

        // Supprimer le UserGame
        await prisma.userGame.delete({
          where: { id: userGameId }
        });

        return {
          statusCode: 200,
          body: {
            success: true,
            message: 'Ligne supprimée avec succès',
            deletedUserGame: userGameId
          },
        };
      }

    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      return {
        statusCode: 500,
        body: { 
          error: 'Erreur lors de la suppression',
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