<script setup lang="ts">
import { Button } from '~/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'



const props = defineProps<{
    bundle : any,
    filtres:any,
    getOptionsForLabel: Function
}>()

const {
  nameBundle,
  linkBundle,
  imageBundle,
  numberGames,
  priceBundle,
  selectBundle,
  createElem,
  validateBundleData,
  resetForm
} = useBundleActions()

const {
  filters,
  getFilterValue,
  handleFilterChange,
} = useFilterHelpers()
const { bundles, userGames, bundleGames, allOptions, filtres, optionsPlatforms,getOptionsForLabel } = useTableauData(['userGame', 'label', 'emplacement', 'bundleGame', 'bundle', 'tag', 'month', 'year', 'platform', 'rating'])




const isLoading = ref(false)

</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline"> <Icon name="solar:folder-open-bold-duotone" /> Infos Bundle</Button>
    </PopoverTrigger>
    <PopoverContent class="w-80">
        <div class="grid grid-cols-3 gap-2 mt-">
            <div v-for="label in filtres.filter((l: { type: string; name: string; }) => l.name !== 'Bundle' && l.name !== 'Tag' && l.name !== 'Rating' && l.name !== 'Search')" :key="label.id" :class="[label.type !== 'select'? 'col-span-3':'','grid items-center gap-4']">
                <small>{{ label.name }}</small>
                <UiTableauRadioGroup
                    v-if="label.type === 'select'"
                    v-model="props.bundle[label.key]"
                    :label="label.name"
                    :options="getOptionsForLabel(label.key) || []"
                />
                <Input
                    v-else
                    v-model="props.bundle[label.key]"
                    :label="label.name"
                    :type="label.type"
                    
                />
            </div>
        </div>
    </PopoverContent>
  </Popover>
</template>
