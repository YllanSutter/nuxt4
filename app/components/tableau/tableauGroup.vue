<script setup lang="ts">
  const { 
    getUserGameValue, 
    getOptionsForLabel, 
    userGames,
    bundleGames, // Récupérer les bundleGames pour faire la liaison
    // Options préenregistrées pour performance optimale
    optionsTags,
    optionsMonths,
    optionsYears,
    optionsPlatforms,
    optionsBundles,
  } = useTableauData(['userGame', 'bundleGame', 'tag', 'month', 'year', 'platform', 'bundle']);

  const { filterBundles, filterUserGames, filterAllData, filters } = useTableauFilters()

  const props = defineProps<{
    mainLabels: any;
    bundles: any;
  }>();

  // 🚀 OPTIMISATION: Utiliser le cache intelligent au lieu du filtrage en temps réel
  const filteredData = computed(() => {
    if (!props.bundles || !userGames.value || !bundleGames.value) {
      return {
        filteredBundles: [],
        bundleGameMap: new Map(),
        filteredUserGames: []
      }
    }
    
    return filterAllData(props.bundles, userGames.value, bundleGames.value)
  })

  // Extraire les bundles filtrés du cache intelligent
  const filteredBundles = computed(() => filteredData.value.filteredBundles)

  // 🚀 OPTIMISATION: Utiliser la map pré-calculée du cache au lieu de refiltrer
  const getUserGamesForBundle = (bundleId: string) => {
    return filteredData.value.bundleGameMap.get(bundleId) || []
  }
</script>

<template>
  
  <div v-if="filteredBundles.length !== 0" class="relative w-full overflow-auto max-w-[1200px] mx-auto mt-6" v-for="(bundle, index) in filteredBundles" :key="bundle.id" :class="'bundle-' + index">
    <div class="mb-2 font-semibold">{{ bundle.name }}</div>
    
    <div v-if="getUserGamesForBundle(bundle.id).length === 0" class="p-4 text-center">
      Aucun jeu trouvé pour ce bundle avec les filtres actuels
    </div>
    
    <Table v-else :key="`table-${userGames.length}-${props.mainLabels.length}`">
      <TableHeader>
        <TableRow>
          <TableHead v-for="label in props.mainLabels" :key="label.id">
            <div class="flex items-center gap-1">
              <!-- <Icon :name="label.image"></Icon> -->
              {{ label.name }}
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="userGame in getUserGamesForBundle(bundle.id)" :key="userGame.id">
          <TableCell 
            v-for="label in props.mainLabels" 
            :key="label.id" 
            class="font-medium"
          >
           
            <div class="flex items-center gap-1">
                <TableauRadioGroup 
                  v-if="label.type == 'select'"
                  :model-value="getUserGameValue(userGame, label.key)"
                  :label="label.name"
                  :options="getOptionsForLabel(label.key)"
                  @update:model-value="(newValue) => userGame[label.key] = newValue"
                />
                <Input 
                  v-else
                  :model-value="getUserGameValue(userGame, label.key)"
                  :label="label.key"
                  @update:model-value="(newValue) => userGame[label.key] = newValue"
                >
                </Input>
              <TableauSuffix v-if="label.type !== 'select'" :label="label"></TableauSuffix>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>