<script setup lang="ts">
import { getUserGamesForBundle, handleValueUpdate, handleModelUpdate, type TableauDataProps } from '@/utils/tableauHelpers'
import TableBodyFull from '../ui/table/TableBodyFull.vue';


const props = defineProps<{
  mode: 'showAll' | 'singleBundle'
  filteredBundles: any[]
  mainLabels: any[]
  calcLabels: any[]
  filtres: any[]
  bundleGameMap: Map<string, any[]>
  activeTabIndex?: number
  getUserGameValue: Function
  getOptionsForLabel: Function
  updateElem: Function
  updateLocalData: Function
  forceUpdateKey: number
  userGamesLength: number
}>()

const emit = defineEmits<{
  lineDeleted: []
  bundleDeleted: []
  linesAdded: []
}>()

// Fonction locale pour récupérer les jeux d'un bundle
const getGamesForBundle = (bundle: any) => {
  return getUserGamesForBundle(props.bundleGameMap, bundle)
}

// Fonctions de gestion des événements
const handleLineDeleted = () => emit('lineDeleted')
const handleBundleDeleted = () => emit('bundleDeleted')
const handleLinesAdded = () => emit('linesAdded')

// Logique pour déterminer les bundles à afficher
const bundlesToDisplay = computed(() => {
  if (props.mode === 'showAll') {
    return props.filteredBundles
  } else {
    return props.activeTabIndex !== undefined && props.filteredBundles[props.activeTabIndex] 
      ? [props.filteredBundles[props.activeTabIndex]]
      : []
  }
})

// Données pour les calculs
const calculationData = computed(() => {
  if (props.mode === 'showAll') {
    return {
      activeBundle: null,
      userGamesBundle: getUserGamesForBundle(props.bundleGameMap, props.filteredBundles)
    }
  } else {
    const activeBundle = props.activeTabIndex !== undefined ? props.filteredBundles[props.activeTabIndex] : null
    return {
      activeBundle,
      userGamesBundle: activeBundle ? getUserGamesForBundle(props.bundleGameMap, activeBundle) : []
    }
  }
})

function handleOrderChanged(newOrder : any) {
  newOrder.forEach((userGame : any) => {
    // Appelle ta logique métier pour chaque ligne modifiée
    props.updateElem(
      userGame,
      userGame.order_in_list,
      { key: 'order_in_list', type: 'number' },
      'userGame',
      props.updateLocalData
    )
  })
}
</script>

<template>
  <div v-if="props.mode === 'showAll'">
    <Table :key="`table-all-${props.userGamesLength}-${props.mainLabels.length}-${props.forceUpdateKey}`">
      <TableHeader>
        <TableRow>
          <TableHead v-for="label in props.mainLabels" :key="label.id">
            <div class="flex items-center gap-1">
              <Icon :name="label.image"></Icon>
              {{ label.name }}
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-for="bundle in bundlesToDisplay" :key="bundle.id">
          <TableRow 
            v-for="userGame in getGamesForBundle(bundle)" 
            :key="userGame.id"
          >
            <TableCell 
              v-for="label in props.mainLabels" 
              :key="label.id" 
              :class="['', userGame.tag.name == 'traded' && (label.key !== 'price' && label.key !== 'delete') || userGame.tag.name == 'tradedWith' && label.key == 'price' ?'opacity-[0.3]':'']"
            >
              <div class="flex items-center">
                <UiTableauRadioGroup 
                  v-if="label.type == 'select'"
                  :model-value="props.getUserGameValue(userGame, label.key) || ''"
                  :label="label.name"
                  :options="props.getOptionsForLabel(label.key)"
                  @update:model-value="(newValue) => handleValueUpdate(
                    userGame, 
                    newValue, 
                    label, 
                    props.updateElem, 
                    props.updateLocalData, 
                    props.getOptionsForLabel
                  )"
                />
                <UiTableauDeleteLine
                  v-else-if="label.key === 'delete'"
                  :userGameId="userGame.id"
                  :bundleId="bundle.id"
                  @lineDeleted="handleLineDeleted"
                  @bundleDeleted="handleBundleDeleted"
                />
                <Input 
                  v-else
                  :model-value="props.getUserGameValue(userGame, label.key) || ''"
                  :label="label.key"
                  :type="label.type"
                  @change="props.updateElem(userGame, props.getUserGameValue(userGame, label.key), label, 'userGame', props.updateLocalData)"
                  @update:model-value="(newValue) => handleModelUpdate(userGame, newValue, label.key)"
                />
                <UiTableauSuffix v-if="label.type !== 'select' && label.key !== 'delete'" :label="label"></UiTableauSuffix>
              </div>
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
      <TableFooter>
        <TableauCalculs
          :activeBundle="calculationData.activeBundle"
          :userGamesBundle="calculationData.userGamesBundle"
          :labels="props.mainLabels"
          listClass="bg-muted/50"
        />
        <TableRow>
          <TableCell colspan="100%">
            <div class="flex gap-2 justify-between items-center">
              <span class="text-muted-foreground text-sm">Mode "All bundle" - Select a bundle to add or delete</span>
            </div>
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  </div>
  
  <div v-else>
    <div v-for="(bundle, index) in bundlesToDisplay" :key="bundle.id" class="bundle-display">
      <div v-if="bundle.image && bundle.image != ''" class="fixed top-0 left-0 w-svw h-svh">
        <img :src="bundle.image" alt="" class="absolute top-0 left-0 w-full h-full object-cover  z-[-2]">
        <div class="absolute top-0 left-0 w-full h-full bg-background/98 z-[-1]"></div>
      </div>
      <Table :key="`table-${bundle.id}-${props.userGamesLength}-${props.mainLabels.length}-${props.forceUpdateKey}`">
        <TableHeader>
          <TableRow>
            <td></td>
            <TableHead v-for="label in props.mainLabels" :key="label.id">
              <div class="flex items-center gap-1">
                <Icon :name="label.image"></Icon>
                {{ label.name }}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBodyFull :games="getGamesForBundle(bundle)"  @orderChanged="handleOrderChanged">
          <template #default="{ userGame, index }">

              <TableCell 
                v-for="label in props.mainLabels" 
                :key="label.id" 
                class="font-medium"
              >
                <div :class="['flex items-center', userGame.tag.name == 'traded' && (label.key !== 'price' && label.key !== 'delete') || userGame.tag.name == 'tradedWith' && label.key == 'price' ?'opacity-[0.3]':'']">
                  <UiTableauRadioGroup 
                    v-if="label.type == 'select'"
                    :model-value="props.getUserGameValue(userGame, label.key) || ''"
                    :label="label.name"
                    :options="props.getOptionsForLabel(label.key)"
                    @update:model-value="(newValue) => handleValueUpdate(
                      userGame, 
                      newValue, 
                      label, 
                      props.updateElem, 
                      props.updateLocalData, 
                      props.getOptionsForLabel
                    )"
                  />
                  <UiTableauDeleteLine
                    v-else-if="label.key === 'delete'"
                    :userGameId="userGame.id"
                    :bundleId="bundle.id"
                    @lineDeleted="handleLineDeleted"
                    @bundleDeleted="handleBundleDeleted"
                  />
                  <Input 
                    v-else
                    :model-value="props.getUserGameValue(userGame, label.key) || ''"
                    :label="label.key"
                    :type="label.type"
                    @change="props.updateElem(userGame, props.getUserGameValue(userGame, label.key), label, 'userGame', props.updateLocalData)"
                    @update:model-value="(newValue) => handleModelUpdate(userGame, newValue, label.key)"
                  />
                  <UiTableauSuffix v-if="label.type !== 'select' && label.key !== 'delete'" :label="label"></UiTableauSuffix>
                </div>
              </TableCell>
          </template>
        </TableBodyFull>
        <TableFooter>
          <TableauCalculs
            :activeBundle="calculationData.activeBundle"
            :userGamesBundle="calculationData.userGamesBundle"
            :labels="props.mainLabels"
            :emplacement="'footer'"
            listClass="bg-muted/50"
          />
          <TableRow>
            <TableCell colspan="100%">
              <div class="flex gap-2 justify-between items-center">
                <div class="left flex gap-2 items-center">
                  <UiTableauAddLine 
                    :activeBundleId="bundle.id"
                    @linesAdded="handleLinesAdded"
                  />
                 <UiTableauUpdateBundle
                    :bundle="bundle"
                    :filtres="props.filtres"
                    :getOptionsForLabel="props.getOptionsForLabel"
                  />
                  <a v-if="bundle.link != ''" :href="bundle.link" target="_blank" rel="noopener noreferrer" class="btn"><Icon name="solar:link-bold-duotone"></Icon></a>
                </div>
                <UiTableauDeleteBundle
                  :bundleId="bundle.id"
                  :bundleName="bundle.name"
                  @bundleDeleted="handleBundleDeleted"
                />
              </div>
            </TableCell>
          </TableRow>
          
        </TableFooter>
      </Table>
    </div>
  </div>
</template>
