import { Platform } from '../../generated/prisma/index';
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
    updateLocalData,
    clearCacheAndRefresh
  } = useTableauData(['userGame', 'bundleGame', 'tag', 'month', 'year', 'platform', 'bundle']);

  const { filterAllData } = useTableauFilters()

  const props = defineProps<{
    mainLabels: any;
    bundles: any;
  }>();

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

  const filteredBundles = computed(() => filteredData.value.filteredBundles)

  const getUserGamesForBundle = (bundleId: string) => {
    return filteredData.value.bundleGameMap.get(bundleId) || []
  }
  const activeTabIndex = ref(0);
  const setActiveTab = (index: number, event: MouseEvent) => {
    activeTabIndex.value = index
  }
 
   import { updateElem,hasPendingModifications,saveAllModifications } from '@/utils/updateValue';

   onBeforeRouteLeave(async () => {
    if (hasPendingModifications()) {
      await saveAllModifications();
    }
    // Vider le cache avant de quitter la page
    await clearCacheAndRefresh();
  });

  // Vider le cache avant le rafraîchissement/fermeture de la page
  onMounted(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (hasPendingModifications()) {
        await saveAllModifications();
      }
      await clearCacheAndRefresh();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    onUnmounted(() => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    });
  });
</script>

<template>

  <div v-if="filteredBundles.length !== 0" class="relative justify-start gap-10 overflow-auto max-w-[1200px] mx-auto mt-6 mb-2 font-semibold text-xs">
    <div @click="setActiveTab(index, $event)" v-for="(bundle, index) in filteredBundles" :key="bundle.id" :class="['cursor-pointer mr-2 mb-1 uppercase p-2 inline-flex text-[8px] lg:text-[11px] tracking-widest border-1 border-[#ffffff20] hover:bg-[#ffffff20] transition-all duration-400 rounded-md items-center', 'bundle-' + index, activeTabIndex === index ? 'bg-[#ffffff20]' : '']" :style="{ borderBottom: '1px solid ' + (optionsPlatforms?.find((opt: any) => opt.id === bundle.platform_id)?.color || '#ffffff20') }">
      <Icon v-if="optionsPlatforms?.find((opt: any) => opt.id === bundle.platform_id)?.image" size="13" class="mr-1" :name="optionsPlatforms?.find((opt: any) => opt.id === bundle.platform_id)?.image" :style="{ color: optionsPlatforms?.find((opt: any) => opt.id === bundle.platform_id)?.color }" />{{ bundle.name }}
      <Icon size="13" class="mr-1" v-if="activeTabIndex === index" name="tdesign:arrow-left-down"/>
    </div>
  </div>

  <div v-if="filteredBundles.length !== 0" v-for="(bundle, index) in filteredBundles" :key="bundle.id" :class="['relative w-full overflow-auto max-w-[1200px] mx-auto mt-6', activeTabIndex === index ? '' : 'hidden', 'bundle-' + index]">
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
                  :model-value="getUserGameValue(userGame, label.key) || ''"
                  :label="label.name"
                  :options="getOptionsForLabel(label.key)"
                  @update:model-value="(newValue) => {
                    if (newValue !== null && newValue !== undefined) {
                      // Pour les clés étrangères, il faut utiliser l'ID, pas le name
                      let valueToSave = newValue;
                      if (label.key.includes('_id') || label.key.includes('Id')) {
                        const option = getOptionsForLabel(label.key).find((opt: any) => opt.name === newValue);
                        valueToSave = option ? option.id : newValue;
                      }
                      userGame[label.key] = valueToSave;
                      updateElem(userGame, String(valueToSave), label, 'userGame', updateLocalData);
                    }
                  }"
                />
                <Input 
                  v-else
                  :model-value="getUserGameValue(userGame, label.key) || ''"
                  :label="label.key"
                  @change="updateElem(userGame,getUserGameValue(userGame, label.key),label, 'userGame', updateLocalData)"
                  @update:model-value="(newValue) => {
                    if (newValue !== null && newValue !== undefined) {
                      userGame[label.key] = newValue;
                    }
                  }"
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