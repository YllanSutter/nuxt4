<script setup lang="ts">
import { Button } from '~/components/ui/button'

const emit = defineEmits<{
  lineDeleted: []
}>()

const { deleteLine } = useBundleActions()
const { clearCacheAndRefresh } = useTableauData(['userGame', 'bundleGame', 'bundle'])

const props = defineProps<{
  userGameId: string
}>()

const isDeleting = ref(false)

const handleDeleteLine = async () => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette ligne ?')) {
    return
  }

  isDeleting.value = true

  try {
    await deleteLine(props.userGameId)
    await clearCacheAndRefresh()
    emit('lineDeleted')
    console.log('✅ Ligne supprimée avec succès!')
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error)
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
  >
    <Icon v-if="isDeleting" name="eos-icons:loading" />
    <Icon v-else name="mdi:delete" />
  </Button>
</template>
