
<script setup lang="ts">
import { getUserGamesForBundle } from '@/utils/tableauHelpers'
import { updateElem, hasPendingModifications, saveAllModifications } from '@/utils/updateValue'

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
  optionsRatings,
  optionsBundles,
  updateLocalData,
  clearCacheAndRefresh
} = useTableauData(['userGame', 'label', 'emplacement', 'bundleGame', 'bundle', 'tag', 'month', 'year', 'platform', 'rating']);

const { filterAllData } = useTableauFilters()

const props = defineProps<{
  mainLabels: any;
  calcLabels: any;
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

const activeTabIndex = ref(0);
const forceUpdateKey = ref(0);
const showAll = ref(false);

const setActiveTab = (index: number, event: MouseEvent) => {
  activeTabIndex.value = index
  showAll.value = false;
}

const removeHidden = async() => {
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

// Données pour les calculs du header
const headerCalculationData = computed(() => {
  if (showAll.value) {
    return {
      activeBundle: null,
      userGamesBundle: getUserGamesForBundle(filteredData.value.bundleGameMap, filteredBundles.value)
    }
  } else {
    const activeBundle = filteredBundles.value[activeTabIndex.value]
    return {
      activeBundle,
      userGamesBundle: activeBundle ? getUserGamesForBundle(filteredData.value.bundleGameMap, activeBundle) : []
    }
  }
})

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
  
  <div class="z-[1] relative gap-2 overflow-auto max-w-[1200px] mx-auto mb-10 font-semibold text-xs border border-[#ffffff20] p-10 pt-12 -mt-6 rounded-md">
    <Table class="max-w-[1000px] mx-auto ">
      <TableHeader>
        <TableRow>
          <TableHead v-for="label in props.calcLabels" :key="label.id">
            <div class="flex items-center gap-1 justify-end" v-if="label.name !== 'Name'">
              <Icon :name="label.image"></Icon>
              {{ label.name }}
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableauCalculs
          :activeBundle="headerCalculationData.activeBundle"
          :userGamesBundle="headerCalculationData.userGamesBundle"
          listClass="border-none"
          :labels="calcLabels"
        />
      </TableBody>
    </Table>
  </div>

  <div  class="max-w-[1200px] mx-auto mb-20 overflow-auto z-[1]" v-if="filteredBundles.length == 0"> 
    <UiTableauAddBundle :refresh="true" @bundle-created="handleBundleCreated"  />
  </div>
  <div class="max-w-[1200px] mx-auto mb-20 overflow-auto z-[1]" v-else>
    <div class="relative z-[1] w-full overflow-auto max-w-[1200px] mx-auto flex flex-wrap items-center gap-1">
      <UiTableauAddBundle @bundle-created="handleBundleCreated" />
      <Button 
        variant="outline" 
        :style="[activeTabIndex == -1 ? 'background:#ffffff20;border:1px solid #ffffff50;' : '']" 
        @click="removeHidden()"
      >
        <Icon name="heroicons:squares-2x2" size="13" class="mr-1" />
        All
      </Button>
      <div 
        @click="setActiveTab(bundleIndex, $event)" 
        v-for="(bundleTab, bundleIndex) in filteredBundles" 
        :key="bundleTab.id" 
        :class="[
          'cursor-pointer uppercase p-2 inline-flex text-[8px] lg:text-[11px] tracking-widest border-1 border-[#ffffff20] hover:bg-[#ffffff20] transition-all duration-400 rounded-md items-center', 
          'bundle-' + bundleIndex, 
          activeTabIndex === bundleIndex ? 'bg-[#ffffff20]' : ''
        ]" 
        :style="{ borderBottom: '1px solid ' + (optionsPlatforms?.find((opt: any) => opt.id === bundleTab.platform_id)?.color || '#ffffff20') }"
      >
        <Icon 
          v-if="optionsPlatforms?.find((opt: any) => opt.id === bundleTab.platform_id)?.image" 
          size="13" 
          class="mr-1" 
          :name="optionsPlatforms?.find((opt: any) => opt.id === bundleTab.platform_id)?.image" 
          :style="{ color: optionsPlatforms?.find((opt: any) => opt.id === bundleTab.platform_id)?.color }" 
        />
        {{ bundleTab.name }}
        <Icon size="13" class="mr-1" v-if="activeTabIndex === bundleIndex" name="tdesign:arrow-left-down"/>
      </div>
    </div>

    <!-- Composant TableauData - gère l'affichage selon le mode -->
    <TableauData
      :mode="showAll ? 'showAll' : 'singleBundle'"
      :filteredBundles="filteredBundles"
      :mainLabels="mainLabels"
      :calcLabels="calcLabels"
      :bundleGameMap="filteredData.bundleGameMap"
      :activeTabIndex="activeTabIndex"
      :getUserGameValue="getUserGameValue"
      :getOptionsForLabel="getOptionsForLabel"
      :updateElem="updateElem"
      :updateLocalData="updateLocalData"
      :forceUpdateKey="forceUpdateKey"
      :userGamesLength="userGames?.length || 0"
      @lineDeleted="handleLineDeleted"
      @bundleDeleted="handleBundleDeleted"
      @linesAdded="handleLinesAdded"
    />
  </div>
</template>