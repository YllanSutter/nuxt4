<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { useTableauFilters } from '@/utils/useTableauFilters'
import { updateValue } from '@/utils/updateValue'

const props = defineProps<{
  userGameIds?: string[]
  bundleId?: string
}>()

const emit = defineEmits<{
  pricesUpdated: []
}>()

const { clearCacheAndRefresh, updateLocalData } = useTableauData(['userGame'])
const { invalidateCache } = useTableauFilters()
const isUpdating = ref(false)
const result = ref<any>(null)

const updatePrices = async () => {
  if (isUpdating.value) return
  
  let gameIds = props.userGameIds
  
  // Si un bundleId est fourni, récupérer tous les jeux du bundle
  if (!gameIds && props.bundleId) {
    try {
      const bundleGames = await $fetch(`/api/bundles/${props.bundleId}/games`)
      gameIds = (bundleGames as any[]).map((bg: any) => bg.user_game_id)
    } catch (error) {
      console.error('❌ Erreur récupération jeux du bundle:', error)
      return
    }
  }
  
  if (!gameIds || gameIds.length === 0) {
    console.warn('⚠️ Aucun jeu à mettre à jour')
    return
  }

  isUpdating.value = true
  result.value = null

  try {
    console.log(`🔄 Mise à jour des prix pour ${gameIds.length} jeux...`)
    
    const response = await $fetch('/api/prices/updateFromItad', {
      method: 'POST',
      body: { userGameIds: gameIds, country: 'FR', shops: [61], capacity: 3 },
      timeout: 60000 // 1 minute max
    })

    result.value = response
    console.log('✅ Prix mis à jour:', response)
    
    // Optimistic update: appliquer les nouveaux prix localement sans rechargement
    const updates = (response as any)?.body?.details?.updates || []
    if (Array.isArray(updates) && updates.length) {
      for (const u of updates) {
        const id = String(u.gameId)
        const prices = u.prices || {}
        if (prices) {
          // Enregistrer dans le système de modifications
          if (prices.sale !== undefined) {
            updateValue(
              { id, name: u.gameName },
              prices.sale,
              { table: 'UserGame', field: 'sale_price', type: 'decimal' },
              'UserGame',
              updateLocalData
            )
          }
          if (prices.initial !== undefined) {
            updateValue(
              { id, name: u.gameName },
              prices.initial,
              { table: 'UserGame', field: 'initial_price', type: 'decimal' },
              'UserGame',
              updateLocalData
            )
          }
          if (prices.blackMarket !== undefined) {
            updateValue(
              { id, name: u.gameName },
              prices.blackMarket,
              { table: 'UserGame', field: 'black_market_price', type: 'decimal' },
              'UserGame',
              updateLocalData
            )
          }
          // Mettre à jour aussi localement pour cohérence immédiate
          updateLocalData(id, 'sale_price', prices.sale as any, 'UserGame')
          updateLocalData(id, 'initial_price', prices.initial as any, 'UserGame')
          if (prices.blackMarket !== undefined) {
            updateLocalData(id, 'black_market_price', prices.blackMarket as any, 'UserGame')
          }
        }
      }
    }
    
    // Émettre l'événement pour que le tableau puisse réagir si nécessaire
    emit('pricesUpdated')
    // Invalider le cache des filtres pour forcer le recalcul des maps
    invalidateCache()
    // Assurer la cohérence finale: rafraîchir la source pour forcer les vues dérivées
    await clearCacheAndRefresh()
    
  } catch (error: any) {
    console.error('❌ Erreur mise à jour prix:', error)
    result.value = {
      body: {
        success: false,
        error: error.message || 'Erreur lors de la mise à jour'
      }
    }
  } finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <div class="inline-flex flex-col gap-2">
    <Button 
      variant="outline"
      @click="updatePrices"
      :disabled="isUpdating"
      class="gap-2"
    >
      <Icon v-if="isUpdating" name="eos-icons:loading" />
      <Icon v-else name="lucide:refresh-cw" />
      {{ isUpdating ? 'Mise à jour...' : 'MAJ Prix ITAD' }}
    </Button>
    
    <div v-if="result" class="text-xs">
      <div v-if="result.body?.success" class="text-green-500">
        ✅ {{ result.body.updated }} prix mis à jour
        <span v-if="result.body.errors > 0" class="text-orange-500">
          ({{ result.body.errors }} erreurs)
        </span>
      </div>
      <div v-else class="text-red-500">
        ❌ {{ result.body?.error || 'Erreur' }}
      </div>
    </div>
  </div>
</template>
