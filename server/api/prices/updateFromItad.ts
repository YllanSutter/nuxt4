import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ITAD API via Nuxt runtime config (API Key seulement)
const getCreds = () => {
  const config = useRuntimeConfig()
  return {
    apiKey: String(config.ITAD_API_KEY || '')
  }
}

export default defineEventHandler(async (event): Promise<{ statusCode: number; body: any }> => {
  if (event.req.method !== 'POST') {
    return {
      statusCode: 405,
      body: { error: 'Méthode non autorisée' }
    }
  }

  try {
    const { userGameIds, country = 'FR', shops = [61], capacity = 3 } = await readBody(event)

    if (!userGameIds || !Array.isArray(userGameIds)) {
      return {
        statusCode: 400,
        body: { error: 'userGameIds requis (tableau)' }
      }
    }
    const { apiKey } = getCreds()
    if (!apiKey) {
      return {
        statusCode: 500,
        body: { error: 'ITAD_API_KEY manquant. Définir ITAD_API_KEY dans .env' }
      }
    }

    console.log(`🔄 Mise à jour des prix pour ${userGameIds.length} jeux depuis ITAD...`)

    const userGames = await prisma.userGame.findMany({
      where: { id: { in: userGameIds } },
      include: { base_game: true }
    })

    const updates: any[] = []
    const errors: any[] = []

    // Étape 1: Lookup ITAD IDs via appid
    const itadMap: Record<string, { userGameId: number; steamId: number; title: string }> = {}
    for (const game of userGames) {
      const steamId = Number(game.base_game_id)
      if (!steamId || Number.isNaN(steamId)) {
        errors.push({ gameId: game.id, gameName: game.name, error: 'base_game_id manquant ou invalide' })
        continue
      }

      try {
        const lookup = await $fetch<any>('https://api.isthereanydeal.com/games/lookup/v1', {
          method: 'GET',
          params: { key: apiKey, appid: steamId },
          timeout: 10000
        })

        if (!lookup?.found || !lookup?.game?.id) {
          errors.push({ gameId: game.id, gameName: game.name, error: 'ITAD ID introuvable via lookup' })
          continue
        }
        itadMap[String(lookup.game.id)] = { userGameId: String(game.id) as unknown as any, steamId, title: game.name }
        // léger délai pour rester polis avec l'API
        await new Promise(r => setTimeout(r, 120))
      } catch (e: any) {
        errors.push({ gameId: game.id, gameName: game.name, error: `Lookup échoué: ${e?.message || String(e)}` })
      }
    }

    const itadIds = Object.keys(itadMap)
    if (itadIds.length === 0) {
      return {
        statusCode: 200,
        body: { success: false, updated: 0, errors: errors.length, details: { updates, errors }, note: 'Aucun ITAD ID résolu' }
      }
    }

    // Étape 2: Récupérer prix v3 pour les IDs ITAD (POST body = tableau)
    let pricesResponse: any
    try {
      pricesResponse = await $fetch<any>('https://api.isthereanydeal.com/games/prices/v3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        params: {
          key: apiKey,
          country: country,
          shops: Array.isArray(shops) ? shops.join(',') : String(shops),
          capacity
        },
        body: JSON.stringify(itadIds),
        timeout: 15000
      })
    } catch (e: any) {
      console.error('❌ Erreur appel games/prices/v3:', e?.message || String(e))
      return {
        statusCode: 500,
        body: { error: 'Erreur ITAD v3', details: e?.message || String(e) }
      }
    }

    const items: any[] = Array.isArray(pricesResponse) ? pricesResponse : []
    for (const item of items) {
      const itadId: string = String(item?.id || '')
      const mapEntry = itadMap[itadId]
      if (!mapEntry) continue

      // Unifier extraction prix (prices ou deals)
      const candidates: any[] = Array.isArray(item?.prices) ? item.prices
        : Array.isArray(item?.deals) ? item.deals
        : []

      if (!candidates.length) {
        errors.push({ gameId: mapEntry.userGameId, gameName: mapEntry.title, error: 'Aucun prix/deal retourné' })
        continue
      }

      // Prioriser Steam (shop id 61) si présent
      const isSteam = (s: any) => (String(s?.shop?.id) === '61' || String(s?.shop) === '61' || String(s?.shop?.name || '').toLowerCase().includes('steam'))
      const steamEntry = candidates.find((c: any) => isSteam(c)) || candidates[0]

      // Normaliser `price` et `regular` (v3 peut exposer `price.value`/`regular.value` ou `amount`)
      const getAmount = (obj: any) => {
        if (!obj) return undefined
        const v = obj.value ?? obj.amount ?? obj.price_new ?? obj.price
        return v !== undefined ? Number(v) : undefined
      }

      const sale = getAmount(steamEntry?.price)
      const regular = getAmount(steamEntry?.regular)

      // Fallback: si `regular` absent, chercher le max parmi les candidats comme prix "initial"
      const amounts = candidates
        .map((c: any) => getAmount(c?.regular) ?? getAmount(c?.price))
        .filter((n: any) => typeof n === 'number')

      const salePrice = typeof sale === 'number' ? sale : (amounts.length ? amounts[0] : 0)
      const initialPrice = typeof regular === 'number' ? regular : (amounts.length ? Math.max(...amounts) : salePrice)
      const blackMarketPrice = amounts.length ? Math.max(...amounts) : initialPrice

      // Mise à jour DB
      await prisma.userGame.update({
        where: { id: String(mapEntry.userGameId) as unknown as any },
        data: {
          sale_price: salePrice,
          initial_price: initialPrice,
          black_market_price: blackMarketPrice,
          price: salePrice > 0 ? salePrice : initialPrice,
          updated_at: new Date()
        }
      })

      updates.push({
        gameId: mapEntry.userGameId,
        gameName: mapEntry.title,
        steamId: mapEntry.steamId,
        itadId,
        prices: { sale: salePrice, initial: initialPrice, blackMarket: blackMarketPrice }
      })
    }

    return {
      statusCode: 200,
      body: {
        success: true,
        updated: updates.length,
        errors: errors.length,
        details: { updates, errors }
      }
    }
  } catch (error: any) {
    console.error('❌ Erreur updateFromItad:', error)
    return {
      statusCode: 500,
      body: {
        error: 'Erreur lors de la mise à jour des prix',
        details: error.message
      }
    }
  }
})
