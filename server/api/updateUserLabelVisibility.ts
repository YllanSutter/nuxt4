import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  if (event.req.method !== 'POST') {
    return {
      statusCode: 405,
      body: { error: 'Méthode non autorisée' },
    };
  }

  try {
    const { id, visible } = await readBody(event);
    if (!id || typeof visible !== 'boolean') {
      return {
        statusCode: 400,
        body: { error: 'id et visible sont requis' },
      };
    }
    const updated = await prisma.userLabelVisibility.update({
      where: { id },
      data: { visible },
    });
    return {
      statusCode: 200,
      body: { success: true, updated },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: error instanceof Error ? error.message : 'Erreur inconnue' },
    };
  }
});
