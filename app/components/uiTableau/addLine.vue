<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'

const emit = defineEmits<{
  linesAdded: []
}>()

const {
  nameBundle,
  numberGames,
  priceBundle,
  createElem,
  validateBundleData,
  resetForm
} = useBundleActions()

const { clearCacheAndRefresh } = useTableauData(['userGame', 'bundleGame', 'bundle'])

const props = defineProps<{
  activeBundleId?: string
}>()

const isLoading = ref(false)

const handleAddLine = async () => {
  if (!numberGames.value || numberGames.value <= 0) {
    console.warn('⚠️ Le nombre de jeux doit être supérieur à 0')
    return
  }

  isLoading.value = true

  try {
    const response = await createElem("line", props.activeBundleId)
    
    console.log('✅ Lignes ajoutées avec succès!', response)
    
    // Refresh immédiat sans délai
    await clearCacheAndRefresh()
    
    emit('linesAdded')
    
    // Reset le formulaire
    numberGames.value = 1
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline"> <Icon name="stash:list-add" /> Add Lines</Button>
    </PopoverTrigger>
    <PopoverContent class="w-80">
      <div class="grid gap-4">
        <div class="space-y-2">
          <h4 class="font-medium leading-none">Add Line</h4>
        </div>
          <div class="grid grid-cols-3 items-center gap-4">
            <label class="text-sm font-medium">Games</label>
            <Input
              type="number"
              placeholder="5"
              class="col-span-2"
              v-model="numberGames"
            />
          </div>
          <Button 
            @click="handleAddLine()" 
            :disabled="isLoading"
          >
            <Icon v-if="isLoading" name="eos-icons:loading" class="mr-2" />
            {{ isLoading ? 'Création...' : 'Create' }}
          </Button>
        </div>
    </PopoverContent>
  </Popover>
</template>
