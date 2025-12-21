import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  if (event.req.method !== 'POST') {
    return {
      statusCode: 405,
      body: { error: 'Méthode non autorisée' }
    }
  }

  try {
    const { id, name } = await readBody(event)

    if (!id || !name) {
      return {
        statusCode: 400,
        body: { error: 'Les champs id et name sont requis' }
      }
    }

    const baseGame = await prisma.baseGame.upsert({
      where: { id: String(id) },
      update: { name: String(name) },
      create: { id: String(id), name: String(name) }
    })

    return {
      statusCode: 200,
      body: { success: true, baseGame }
    }
  } catch (error) {
    console.error('❌ Erreur lors du upsert du BaseGame:', error)
    return {
      statusCode: 500,
      body: {
        error: 'Erreur serveur lors de la création du BaseGame',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }
    }
  }
})
