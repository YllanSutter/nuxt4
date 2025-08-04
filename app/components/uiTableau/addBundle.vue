<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

const emit = defineEmits<{
  bundleCreated: []
}>()

const {
  nameBundle,
  numberGames,
  priceBundle,
  selectBundle,
  createElem,
  validateBundleData,
  resetForm
} = useBundleActions()

const { bundles, userGames, bundleGames, allOptions, filtres, optionsPlatforms } = useTableauData(['userGame', 'label', 'emplacement', 'bundleGame', 'bundle', 'tag', 'month', 'year', 'platform', 'rating'])

const {
  filters,
  getFilterValue,
  handleFilterChange,
  getPrecomputedOptions
} = useFilterHelpers()

const isCreating = ref(false)
const selectedPlatform = ref('')

const precomputedOptions = computed(() => {
  return getPrecomputedOptions(filtres.value, bundles.value)
})

watch(filters, (newFilters) => {
  const platformFilter = newFilters['platform_id']
  const monthFilter = newFilters['month_id'] 
  const yearFilter = newFilters['year_id']
  
  if (platformFilter && platformFilter !== '') {
    const platformOption = (precomputedOptions.value['platform_id'] || []).find((opt: any) => opt.name === platformFilter)
    if (platformOption) {
      selectBundle.find(s => s.key === 'platform_id')!.ref.value = platformOption.id
    }
  }
  
  if (monthFilter && monthFilter !== '') {
    const monthOption = (precomputedOptions.value['month_id'] || []).find((opt: any) => opt.name === monthFilter)
    if (monthOption) {
      selectBundle.find(s => s.key === 'month_id')!.ref.value = monthOption.id
    }
  }
  
  if (yearFilter && yearFilter !== '') {
    const yearOption = (precomputedOptions.value['year_id'] || []).find((opt: any) => opt.name === yearFilter)
    if (yearOption) {
      selectBundle.find(s => s.key === 'year_id')!.ref.value = yearOption.id
    }
  }
}, { deep: true, immediate: true })

const handleCreateElem = async (cible: string) => {
  const validation = validateBundleData()
  
  if (!validation.isValid) {
    console.warn('⚠️ Erreurs de validation:', validation.errors)
    return
  }

  isCreating.value = true

  try {
    console.log('🎯 Création bundle optimiste...')
    
    const result = await createElem(cible)
    console.log('✅ API result:', result)
    
    if (!result || result.statusCode !== 201) {
      throw new Error('Erreur API: réponse invalide')
    }
    
    await refreshCookie('allOptions')
    
    emit('bundleCreated')
    resetForm()
    console.log('✅ Bundle créé avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error)
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline"> <Icon name="stash:list-add" /> Add a bundle</Button>
    </PopoverTrigger>
    <PopoverContent class="w-[500px]">
      <div class="grid gap-4">
        <div class="space-y-2">
          <h4 class="font-medium leading-none">Add a bundle</h4>
          <p class="text-sm text-muted-foreground">
            Or you can import one (WIP)
          </p>
        </div>
        <div class="grid gap-2">
          <div class="grid grid-cols-3 items-center gap-4">
            <label class="text-sm font-medium">Name</label>
            <Input
              type="text"
              v-model="nameBundle"
              placeholder="Bundle Name"
              class="col-span-2"
            />
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
          <div class="grid grid-cols-3 items-center gap-4">
            <label class="text-sm font-medium">Price</label>
            <Input
              type="number"
              placeholder="5"
              class="col-span-2"
              v-model="priceBundle"
            />
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div v-for="label in filtres.filter((l: { type: string; name: string; }) => l.type === 'select' && l.name !== 'Bundle' && l.name !== 'Tag')" :key="label.id" class="grid items-center gap-4">
              <label class="text-sm font-medium">{{ label.name }}</label>
              <UiTableauRadioGroup 
                v-if="selectBundle.find(s => s.key === label.key)"
                v-model="selectBundle.find(s => s.key === label.key)!.ref.value"
                :label="'Tout'"
                :options="precomputedOptions[label.key] || []"
                @update:model-value="(newValue) => {
                  const bundleItem = selectBundle.find(s => s.key === label.key)!
                  const option = (precomputedOptions[label.key] || []).find((opt: any) => opt.name === newValue)
                  const selectedId = option ? option.id : String(newValue)
                  
                  // Mettre à jour la sélection du bundle avec l'ID
                  bundleItem.ref.value = selectedId
                }"
              />
              <UiTableauRadioGroup 
                v-else
                :label="'Tout'"
                :options="precomputedOptions[label.key] || []"
              />      
            </div>
          </div>
          <Button @click="handleCreateElem('bundle')" :disabled="isCreating">
            <Icon v-if="isCreating" name="eos-icons:loading" class="mr-2" />
            {{ isCreating ? 'Création...' : 'Create' }}
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
