<script setup lang="ts">
import { Button } from '~/components/ui/button'

const emit = defineEmits<{
  lineDeleted: []
  bundleDeleted: []
}>()

const { deleteLine, deleteBundle } = useBundleActions()
const { userGames, bundleGames, bundles, allOptions } = useTableauData(['userGame', 'label', 'emplacement', 'bundleGame', 'bundle', 'tag', 'month', 'year', 'platform', 'rating'])

const props = defineProps<{
  userGameId: string
  bundleId?: string
}>()

const isDeleting = ref(false)

const handleDeleteLine = async () => {
  isDeleting.value = true

  // Sauvegarder pour rollback
  const originalUserGames = [...(userGames.value || [])]
  const originalBundleGames = [...(bundleGames.value || [])]

  try {
    // console.log('🗑️ AVANT suppression ligne:')
    // console.log('📊 UserGames total:', userGames.value?.length || 0)
    // console.log('🔗 BundleGames total:', bundleGames.value?.length || 0)
    // console.log('🎯 UserGame à supprimer:', props.userGameId)
    
    // Suppression optimiste dans le cache
    if (allOptions.value) {
      // Supprimer les BundleGames liés
      allOptions.value.bundleGame = bundleGames.value?.filter(
        (bg: any) => bg.user_game_id !== props.userGameId
      ) || []
      
      // Supprimer le UserGame
      allOptions.value.userGame = userGames.value?.filter(
        (userGame: any) => userGame.id !== props.userGameId
      ) || []
    }
    
    // console.log('📊 APRÈS suppression optimiste:', userGames.value?.length || 0)
    
    // Appeler l'API
    const result = await deleteLine(props.userGameId)
    // console.log('✅ API result:', result)
    
    // Vérifier si l'API a réussi
    if (result.statusCode !== 200) {
      throw new Error(`Erreur API: ${result.statusCode} - ${JSON.stringify(result.body)}`)
    }
    
    // Vérifier s'il reste des UserGames dans le bundle après suppression
    if (props.bundleId) {
      const remainingUserGamesInBundle = bundleGames.value?.filter(
        (bg: any) => bg.bundle_id === props.bundleId
      ) || []
      
      console.log(`🔍 UserGames restants dans bundle ${props.bundleId}:`, remainingUserGamesInBundle.length)
      
      // Si plus aucun UserGame dans le bundle, supprimer le bundle
      if (remainingUserGamesInBundle.length === 0) {
        console.log('🗑️ Suppression du bundle vide:', props.bundleId)
        
        try {
          const bundleResult = await deleteBundle(props.bundleId)
          if (bundleResult.statusCode === 200) {
            // Supprimer le bundle du cache
            if (allOptions.value) {
              allOptions.value.bundle = bundles.value?.filter(
                (bundle: any) => bundle.id !== props.bundleId
              ) || []
            }
            emit('bundleDeleted')
            console.log('✅ Bundle vide supprimé avec succès!')
          }
        } catch (bundleError) {
          console.error('❌ Erreur lors de la suppression du bundle:', bundleError)
        }
      }
    }
    
    emit('lineDeleted')
    console.log('✅ Ligne supprimée avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error)
    
    // Rollback en cas d'erreur
    if (allOptions.value) {
      allOptions.value.userGame = originalUserGames
      allOptions.value.bundleGame = originalBundleGames
    }
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <Button 
    variant="ghost" 
    size="sm"
    @click="handleDeleteLine()" 
    :disabled="isDeleting"
    class="cursor-pointer"
  >
    <Icon v-if="isDeleting" name="eos-icons:loading" style='color:green' :size="20" />
    <Icon v-else name="solar:close-circle-broken" style='color:#f00' :size="20" />
  </Button>
</template>
