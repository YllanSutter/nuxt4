
<script setup lang="ts">
  const { 
    getUserGameValue, 
    getOptionsForLabel, 
    userGames,
    bundles,
    bundleGames,
    optionsTags,
    optionsMonths,
    optionsYears,
    optionsPlatforms,
    optionsBundles,
    updateLocalData,
    clearCacheAndRefresh
  } = useTableauData(['userGame', 'label', 'emplacement', 'bundleGame', 'bundle', 'tag', 'month', 'year', 'platform']);

  const { filterAllData } = useTableauFilters()

  const props = defineProps<{
    mainLabels: any;
    calcLabels:any
    bundles: any;
  }>();

  const filteredData = computed(() => {
    forceUpdateKey.value;
    
    if (!bundles.value || !userGames.value || !bundleGames.value) {
      return {
        filteredBundles: [],
        bundleGameMap: new Map(),
        filteredUserGames: []
      }
    }
    
    return filterAllData(bundles.value, userGames.value, bundleGames.value)
  })

  const filteredBundles = computed(() => filteredData.value.filteredBundles)
  console.log(filteredBundles);

  const getUserGamesForBundle = (bundle: any) => {
    if(bundle.id)
    {
      return filteredData.value.bundleGameMap.get(bundle.id) || [];
    }
    else
    {
      let AggregateBundleCalc = [];
      for(let i = 0;i<bundle.length;i++)
      {
        AggregateBundleCalc.push(...(filteredData.value.bundleGameMap.get(bundle[i].id) || []));
      }
        return AggregateBundleCalc;
    }
  }

  const activeTabIndex = ref(0);
  const forceUpdateKey = ref(0);
  const showAll = ref(false);
  
  const setActiveTab = (index: number, event: MouseEvent) => {
    activeTabIndex.value = index
    showAll.value = false;
  }
    const removeHidden = async() => 
   {
    activeTabIndex.value = -1;
    showAll.value = true;
   }

  const handleLinesAdded = () => {
    forceUpdateKey.value++
  }

  const handleBundleCreated = () => {
    forceUpdateKey.value++
  }

  const handleBundleDeleted = () => {
    
    forceUpdateKey.value++
    
    nextTick(() => {
      if (filteredBundles.value.length > 0) {
        activeTabIndex.value = 0
      }
    })
  }

  const handleLineDeleted = async () => {
    
    forceUpdateKey.value++
    
    await nextTick()
    
   }


 
import { updateElem,hasPendingModifications,saveAllModifications } from '@/utils/updateValue';

   onBeforeRouteLeave(async (to, from) => {
    if (hasPendingModifications()) {
      await saveAllModifications();
    }
    if (to.path !== from.path) {
      await clearCacheAndRefresh();
    }
  });

  onMounted(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (hasPendingModifications()) {
        await saveAllModifications();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    onUnmounted(() => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    });
  });
</script>

<template>
  <div class="max-w-[1200px] mx-auto mb-20 overflow-auto" v-if="filteredBundles.length !== 0">
    
    <!-- Header de calculs - affiché une fois -->
    <div v-if="(showAll && filteredBundles.length > 0) || (!showAll && filteredBundles[activeTabIndex])" class="relative gap-2 overflow-auto max-w-[1200px] mx-auto mb-10 font-semibold text-xs border border-[#ffffff20] p-10 pt-12 -mt-6 rounded-md">
      <Table class="max-w-[1000px] mx-auto ">
        <TableHead v-for="label in props.calcLabels" :key="label.id">
          <div class="flex items-center gap-1 justify-end" v-if="label.name !== 'Name'">
            <Icon :name=label.image></Icon>
            {{ label.name }}
          </div>
        </TableHead>
        <TableBody>
          <TableauCalculs
            :activeBundle="showAll ? null : filteredBundles[activeTabIndex]"
            :userGamesBundle="showAll ? getUserGamesForBundle(filteredBundles) : getUserGamesForBundle(filteredBundles[activeTabIndex])"
            listClass="border-none"
            :labels="calcLabels"
          />
        </TableBody>
      </Table>
    </div>

    <!-- Navigation des bundles - affichée une fois -->
    <div class="relative w-full overflow-auto max-w-[1200px] mx-auto mt-20 flex flex-wrap items-center gap-1">
      <UiTableauAddBundle @bundle-created="handleBundleCreated" />
      <Button variant="outline" :style="[activeTabIndex == -1 ? 'background:#ffffff20;border:1px solid #ffffff50;' : '']" @click="removeHidden()">All</Button>
      <div @click="setActiveTab(bundleIndex, $event)" v-for="(bundleTab, bundleIndex) in filteredBundles" :key="bundleTab.id" :class="['cursor-pointer uppercase p-2 inline-flex text-[8px] lg:text-[11px] tracking-widest border-1 border-[#ffffff20] hover:bg-[#ffffff20] transition-all duration-400 rounded-md items-center', 'bundle-' + bundleIndex, activeTabIndex === bundleIndex ? 'bg-[#ffffff20]' : '']" :style="{ borderBottom: '1px solid ' + (optionsPlatforms?.find((opt: any) => opt.id === bundleTab.platform_id)?.color || '#ffffff20') }">
        <Icon v-if="optionsPlatforms?.find((opt: any) => opt.id === bundleTab.platform_id)?.image" size="13" class="mr-1" :name="optionsPlatforms?.find((opt: any) => opt.id === bundleTab.platform_id)?.image" :style="{ color: optionsPlatforms?.find((opt: any) => opt.id === bundleTab.platform_id)?.color }" />{{ bundleTab.name }}
        <Icon size="13" class="mr-1" v-if="activeTabIndex === bundleIndex" name="tdesign:arrow-left-down"/>
      </div>
    </div>

    <!-- Table unique pour showAll, ou table par bundle pour mode normal -->
    <div v-if="showAll">
      <!-- Mode showAll : Une seule table pour tous les bundles -->
      <Table :key="`table-all-${userGames.length}-${props.mainLabels.length}-${forceUpdateKey}`">
        <TableHeader>
          <TableRow>
            <TableHead v-for="label in props.mainLabels" :key="label.id">
              <div class="flex items-center gap-1">
                <Icon :name=label.image></Icon>
                {{ label.name }}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- Itération sur tous les bundles -->
          <template v-for="(bundle, index) in filteredBundles" :key="bundle.id">
            <TableRow 
              v-for="userGame in getUserGamesForBundle(bundle)" 
              :key="userGame.id"
            >
              <TableCell 
                v-for="label in props.mainLabels" 
                :key="label.id" 
                class="font-medium"
              >
                <div class="flex items-center gap-1">
                  <UiTableauRadioGroup 
                    v-if="label.type == 'select'"
                    :model-value="getUserGameValue(userGame, label.key) || ''"
                    :label="label.name"
                    :options="getOptionsForLabel(label.key)"
                    @update:model-value="(newValue) => {
                      if (newValue !== null && newValue !== undefined) {
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
                  <UiTableauDeleteLine
                    v-else-if="label.key === 'delete'"
                    :userGameId="userGame.id"
                    :bundleId="bundle.id"
                    @lineDeleted="handleLineDeleted"
                    @bundleDeleted="handleBundleDeleted"
                  />
                  <Input 
                    v-else
                    :model-value="getUserGameValue(userGame, label.key) || ''"
                    :label="label.key"
                    :type="label.type"
                    @change="updateElem(userGame,getUserGameValue(userGame, label.key),label, 'userGame', updateLocalData)"
                    @update:model-value="(newValue) => {
                      if (newValue !== null && newValue !== undefined) {
                        userGame[label.key] = newValue;
                      }
                    }"
                  >
                  </Input>
                  <UiTableauSuffix v-if="label.type !== 'select' && label.key !== 'delete'" :label="label"></UiTableauSuffix>
                </div>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
        <TableFooter>
          <TableauCalculs
            :activeBundle="null"
            :userGamesBundle="getUserGamesForBundle(filteredBundles)"
            :labels="mainLabels"
            listClass="bg-muted/50"
          />
          <TableRow>
            <TableCell colspan="100%">
              <div class="flex gap-2 justify-between items-center">
                <UiTableauAddLine 
                  :activeBundleId="undefined"
                  @linesAdded="handleLinesAdded"
                />
                <span class="text-muted-foreground text-sm">Mode "Tous les bundles" - Sélectionnez un bundle pour le supprimer</span>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
    
    <div v-else>
      <!-- Mode normal : Une table par bundle -->
      <div v-for="(bundle, index) in filteredBundles" :key="bundle.id" :class="[activeTabIndex === index ? '' : 'hidden', 'bundle-' + index]">
        <Table :key="`table-${bundle.id}-${userGames.length}-${props.mainLabels.length}-${forceUpdateKey}`">
          <TableHeader>
            <TableRow>
              <TableHead v-for="label in props.mainLabels" :key="label.id">
                <div class="flex items-center gap-1">
                  <Icon :name=label.image></Icon>
                  {{ label.name }}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow 
              v-for="userGame in getUserGamesForBundle(bundle)" 
              :key="userGame.id"
            >
              <TableCell 
                v-for="label in props.mainLabels" 
                :key="label.id" 
                class="font-medium"
              >
                <div class="flex items-center gap-1">
                  <UiTableauRadioGroup 
                    v-if="label.type == 'select'"
                    :model-value="getUserGameValue(userGame, label.key) || ''"
                    :label="label.name"
                    :options="getOptionsForLabel(label.key)"
                    @update:model-value="(newValue) => {
                      if (newValue !== null && newValue !== undefined) {
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
                  <UiTableauDeleteLine
                    v-else-if="label.key === 'delete'"
                    :userGameId="userGame.id"
                    :bundleId="bundle.id"
                    @lineDeleted="handleLineDeleted"
                    @bundleDeleted="handleBundleDeleted"
                  />
                  <Input 
                    v-else
                    :model-value="getUserGameValue(userGame, label.key) || ''"
                    :label="label.key"
                    :type="label.type"
                    @change="updateElem(userGame,getUserGameValue(userGame, label.key),label, 'userGame', updateLocalData)"
                    @update:model-value="(newValue) => {
                      if (newValue !== null && newValue !== undefined) {
                        userGame[label.key] = newValue;
                      }
                    }"
                  >
                  </Input>
                  <UiTableauSuffix v-if="label.type !== 'select' && label.key !== 'delete'" :label="label"></UiTableauSuffix>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableauCalculs
              :activeBundle="bundle"
              :userGamesBundle="getUserGamesForBundle(bundle)"
              :labels="mainLabels"
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
  </div>
</template>