
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

  const getUserGamesForBundle = (bundleId: string) => {
    return filteredData.value.bundleGameMap.get(bundleId) || []
  }

  const activeTabIndex = ref(0);
  const forceUpdateKey = ref(0);
  
  const setActiveTab = (index: number, event: MouseEvent) => {
    activeTabIndex.value = index
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
    console.log('✅ Ligne supprimée - données actualisées')
    
    forceUpdateKey.value++
    
    await nextTick()
    
   }
 
import { updateElem,hasPendingModifications,saveAllModifications } from '@/utils/updateValue';

   onBeforeRouteLeave(async (to, from) => {
    if (hasPendingModifications()) {
      await saveAllModifications();
    }
    // clearCacheAndRefresh seulement si on quitte vraiment la page (pas un hot reload)
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
  <div v-if="filteredBundles.length !== 0" class="relative gap-2 overflow-auto max-w-[1200px] mx-auto mt-6 mb-2 font-semibold text-xs ">
    
    <UiTableauAddBundle @bundle-created="handleBundleCreated" />
    <p class="inline-block mr-2"></p>
    <div @click="setActiveTab(index, $event)" v-for="(bundle, index) in filteredBundles" :key="bundle.id" :class="['cursor-pointer mr-2 mb-1 uppercase p-2 inline-flex text-[8px] lg:text-[11px] tracking-widest border-1 border-[#ffffff20] hover:bg-[#ffffff20] transition-all duration-400 rounded-md items-center', 'bundle-' + index, activeTabIndex === index ? 'bg-[#ffffff20]' : '']" :style="{ borderBottom: '1px solid ' + (optionsPlatforms?.find((opt: any) => opt.id === bundle.platform_id)?.color || '#ffffff20') }">
      <Icon v-if="optionsPlatforms?.find((opt: any) => opt.id === bundle.platform_id)?.image" size="13" class="mr-1" :name="optionsPlatforms?.find((opt: any) => opt.id === bundle.platform_id)?.image" :style="{ color: optionsPlatforms?.find((opt: any) => opt.id === bundle.platform_id)?.color }" />{{ bundle.name }}
      <Icon size="13" class="mr-1" v-if="activeTabIndex === index" name="tdesign:arrow-left-down"/>
    </div>
  </div>

  <div v-if="filteredBundles.length !== 0" v-for="(bundle, index) in filteredBundles" :key="bundle.id" :class="['relative w-full overflow-auto max-w-[1200px] mx-auto mt-6 pb-20', activeTabIndex === index ? '' : 'hidden', 'bundle-' + index]">

    <Table :key="`table-${userGames.length}-${props.mainLabels.length}-${forceUpdateKey}`">
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
          v-for="userGame in getUserGamesForBundle(bundle.id)" 
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
                  :bundleId="filteredBundles[activeTabIndex]?.id"
                  @lineDeleted="handleLineDeleted"
                  @bundleDeleted="handleBundleDeleted"
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
              <UiTableauSuffix v-if="label.type !== 'select' && label.key !== 'delete'" :label="label"></UiTableauSuffix>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
           <TableauCalculs
              :activeBundle="filteredBundles[activeTabIndex]"
              :userGamesBundle = getUserGamesForBundle(bundle.id)
              :labels="mainLabels"
           />
        </TableRow>
        <TableRow>
          <TableCell colspan="100%">
            <div class="flex gap-2 justify-between items-center">
              <UiTableauAddLine 
                :activeBundleId="filteredBundles[activeTabIndex]?.id"
                @linesAdded="handleLinesAdded"
              />
              <UiTableauDeleteBundle
                :bundleId="filteredBundles[activeTabIndex]?.id"
                :bundleName="filteredBundles[activeTabIndex]?.name"
                @bundleDeleted="handleBundleDeleted"
              />
            </div>
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  </div>
</template>