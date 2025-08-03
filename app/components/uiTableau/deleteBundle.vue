<script setup lang="ts">
import { Button } from '~/components/ui/button'

const emit = defineEmits<{
  bundleDeleted: []
}>()

const { deleteBundle } = useBundleActions()
const { clearCacheAndRefresh } = useTableauData(['userGame', 'bundleGame', 'bundle'])

const props = defineProps<{
  bundleId: string
  bundleName: string
}>()

const isDeleting = ref(false)

const handleDeleteBundle = async () => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le bundle "${props.bundleName}" et tous ses jeux ?`)) {
    return
  }

  isDeleting.value = true

  try {
    await deleteBundle(props.bundleId)
    await clearCacheAndRefresh()
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
  <Button 
    variant="destructive" 
    size="sm"
    @click="handleDeleteBundle()" 
    :disabled="isDeleting"
  >
    <Icon v-if="isDeleting" name="eos-icons:loading" class="mr-2" />
    <Icon v-else name="mdi:delete" class="mr-2" />
    {{ isDeleting ? 'Suppression...' : 'Supprimer Bundle' }}
  </Button>
</template>
