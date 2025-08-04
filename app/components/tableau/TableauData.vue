<script setup lang="ts">
import { getUserGamesForBundle, handleValueUpdate, handleModelUpdate, type TableauDataProps } from '@/utils/tableauHelpers'

const props = defineProps<{
  mode: 'showAll' | 'singleBundle'
  filteredBundles: any[]
  mainLabels: any[]
  calcLabels: any[]
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
</script>

<template>
  <div v-if="props.mode === 'showAll'">
    <!-- Mode showAll : Une seule table pour tous les bundles -->
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
              class="font-medium"
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
              <UiTableauAddLine 
                :activeBundleId="undefined"
                @linesAdded="handleLinesAdded"
              />
              <span class="text-muted-foreground text-sm">Mode "All bundle" - Select a bundle to delete it</span>
            </div>
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  </div>
  
  <div v-else>
    <!-- Mode normal : Une table par bundle -->
    <div v-for="(bundle, index) in bundlesToDisplay" :key="bundle.id" class="bundle-display">
      <Table :key="`table-${bundle.id}-${props.userGamesLength}-${props.mainLabels.length}-${props.forceUpdateKey}`">
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
          <TableRow 
            v-for="userGame in getGamesForBundle(bundle)" 
            :key="userGame.id"
          >
            <TableCell 
              v-for="label in props.mainLabels" 
              :key="label.id" 
              class="font-medium"
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
                <UiTableauAddLine 
                  :activeBundleId="bundle.id"
                  @linesAdded="handleLinesAdded"
                />
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
