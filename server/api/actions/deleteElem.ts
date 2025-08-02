import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    if (event.req.method === 'POST') {
        try {
            // Récupérer les données du corps de la requête
            const { ids } = await readBody(event);

            // Vérifier si les IDs sont fournis
            if (!ids || !Array.isArray(ids)) {
                return {
                    statusCode: 400,
                    body: { error: 'IDs requis' },
                };
            }

            // Supprimer les jeux
            const deleteGames = await prisma.game.deleteMany({
                where: {
                    id: {
                        in: ids,
                    },
                },
            });

            return {
                statusCode: 200, // 200 OK est plus approprié pour une suppression réussie
                body: { message: 'Lignes supprimées avec succès', count: deleteGames.count }, // Optionnel
            };
        } catch (error) {
            console.error(error); // Afficher l'erreur dans la console pour le débogage
            return {
                statusCode: 500,
                body: { error: 'Erreur lors de la suppression des lignes' }, // Message d'erreur clarifié
            };
        }
    }

    return {
        statusCode: 405,
        body: { error: 'Méthode non autorisée' },
    };
});