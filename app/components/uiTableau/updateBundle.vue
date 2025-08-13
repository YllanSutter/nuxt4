<script setup lang="ts">


// Système de pending modifs
const pendingModifs = ref<{ key: string, value: any }[]>([]);

const updateBundleField = (key: string, value: any) => {
  const label = props.filtres.find((l: any) => l.key === key);
  let sendValue = value;
  if (label && label.type === 'select') {
      // Si l'option sélectionnée est un objet, prendre son id
      if (typeof value === 'object' && value !== null && value.id) {
        sendValue = value.id;
      } else {
        // Si la valeur est un nom, on cherche l'id correspondant dans les options
        const options = props.getOptionsForLabel(key) || [];
        const found = options.find((opt: any) => opt.id === value || opt.name === value);
        if (found) {
          sendValue = found.id;
        }
      }
  }
  // Ajoute ou remplace la modif dans le tableau
  const idx = pendingModifs.value.findIndex(m => m.key === key);
  if (idx !== -1 && pendingModifs.value[idx]) {
    pendingModifs.value[idx].value = sendValue;
    console.log(`[pendingModif] Update ${key}:`, sendValue);
  } else {
    pendingModifs.value.push({ key, value: sendValue });
    console.log(`[pendingModif] Add ${key}:`, sendValue);
  }
}

const savePendingModifs = async () => {
  if (!props.bundle.id || pendingModifs.value.length === 0) return;
  console.log('[savePendingModifs] Envoi des modifs:', pendingModifs.value);
  for (const modif of pendingModifs.value) {
    await $fetch('/api/updateBundleField', {
      method: 'POST',
      body: { id: props.bundle.id, key: modif.key, value: modif.value }
    });
  }
  pendingModifs.value = [];
}
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
          @update:model-value="updateBundleField(label.key, $event)"
        />
        <Input
          v-else
          v-model="props.bundle[label.key]"
          :label="label.name"
          :type="label.type"
          @change="updateBundleField(label.key, props.bundle[label.key])"
        />
            </div>
        </div>
        <div class="flex justify-end mt-4">
          <Button :disabled="pendingModifs.length === 0" @click="savePendingModifs">Enregistrer les modifications</Button>
        </div>
    </PopoverContent>
  </Popover>
</template>
