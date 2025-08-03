<script setup lang="ts">
import { Button } from '~/components/ui/button'

const emit = defineEmits<{
  bundleDeleted: []
}>()

const { deleteBundle } = useBundleActions()
const { bundles, userGames, bundleGames, refresh } = useTableauData(['userGame', 'label', 'emplacement', 'bundleGame', 'bundle', 'tag', 'month', 'year', 'platform'])

const props = defineProps<{
  bundleId: string
  bundleName: string
}>()

const isDeleting = ref(false)

const handleDeleteBundle = async () => {
  isDeleting.value = true

  try {
    console.log('🗑️ AVANT suppression bundle:')
    console.log('📦 Bundles total:', bundles.value?.length || 0)
    console.log('📊 UserGames total:', userGames.value?.length || 0)
    console.log('🔗 BundleGames total:', bundleGames.value?.length || 0)
    console.log('🎯 Bundle à supprimer:', props.bundleId)
    
    const result = await deleteBundle(props.bundleId)
    console.log('✅ API result:', result)
    
    if (result.statusCode !== 200) {
      throw new Error(`Erreur API: ${result.statusCode} - ${JSON.stringify(result.body)}`)
    }
    
    await clearNuxtData('allOptions-bundle,bundleGame,emplacement,label,month,platform,tag,userGame,year')
    await refresh()
    
    emit('bundleDeleted')
    console.log('✅ Bundle supprimé avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error)
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
    <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline" class="text-red-400 cursor-pointer"> <Icon name="solar:close-circle-broken" /> Delete {{props.bundleName}}</Button>
    </PopoverTrigger>
    <PopoverContent class="w-80">
      <Button 
        variant="destructive" 
        size="sm"
        @click="handleDeleteBundle()" 
        :disabled="isDeleting"
    >
        <Icon v-if="isDeleting" name="eos-icons:loading" class="mr-2" />
        <Icon v-else name="solar:close-circle-broken" class="mr-2" />
        {{ isDeleting ? 'Suppression...' : 'yes, i want to delete' }}
    </Button>
    </PopoverContent>
  </Popover>
  
</template>
