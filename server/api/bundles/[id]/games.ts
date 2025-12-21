import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const bundleId = event.context.params?.id

  if (!bundleId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bundle ID requis'
    })
  }

  try {
    const bundleGames = await prisma.bundleGame.findMany({
      where: { bundle_id: bundleId },
      include: {
        user_game: {
          include: {
            base_game: true,
            tag: true,
            rating_ref: true
          }
        }
      },
      orderBy: { order_in_bundle: 'asc' }
    })

    return bundleGames
  } catch (error) {
    console.error('❌ Erreur récupération jeux du bundle:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur serveur'
    })
  }
})
