<script setup lang="ts">
  const props = defineProps<{
    mainLabels: any;
    bundles: any;
  }>();

  const {
    filters,
    hasActiveFilters,
    getFilterValue,
    handleFilterChange,
    getPrecomputedOptions,
    setInitialFilters,
    resetToDefaultFilters,
    clearAllFilters
  } = useFilterHelpers()

  const { 
    labels,
    optionsTags,
    optionsMonths,
    optionsYears,
    optionsPlatforms,
    optionsRatings,
    optionsBundles,
  } = useTableauData(['tag', 'month', 'year', 'platform', 'rating', 'bundle'])

  // Appliquer les filtres initiaux dès que les mainLabels sont disponibles
  watch(() => props.mainLabels, (newLabels) => {
    if (newLabels && newLabels.length > 0 && Object.keys(filters.value).length === 0) {
      setInitialFilters(newLabels)
    }
  }, { immediate: true })

  const precomputedOptions = computed(() => {
    return getPrecomputedOptions(props.mainLabels, props.bundles)
  })

  const handleResetToDefault = () => {
    resetToDefaultFilters(props.mainLabels)
  }
</script>

<template>
    <div class="relative w-full overflow-auto max-w-[1000px] mx-auto z-10">
      <div class="flex items-center justify-end mb-3">
        <div class="flex gap-2">
          <Button 
            @click="handleResetToDefault()" 
            size="sm"
          >
            Mois/Année actuels
          </Button>
          <Button 
            v-if="hasActiveFilters" 
            @click="clearAllFilters()" 
            variant="outline" 
            size="sm"
          >
            Effacer tous les filtres
          </Button>
        </div>
      </div>
      
      <Table :key="`table-${labels.length}-${props.mainLabels.length}`">
        <TableHeader>
          <tr style="border:none!important">
            <TableHead v-for="label in props.mainLabels" :key="label.id">
              <div class="flex items-center gap-1">
                <Icon :name="label.image"></Icon>{{ label.name }}
              </div>
            </TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          <tr>
            <TableCell 
              v-for="label in props.mainLabels" 
              :key="label.id" 
              class="font-medium"
            >
             
              <div class="flex items-center gap-1 bg-background rounded-md overflow-hidden border border-[#ffffff20]">   
                  <UiTableauRadioGroup 
                    :model-value="getFilterValue(label.key)"
                    v-if="label.type == 'select'"
                    :label="'Tout'"
                    :options="precomputedOptions[label.key] || []"
                    @update:model-value="(newValue) => handleFilterChange(label.key, newValue)"
                  />
                  
                  <Input 
                    v-else
                    :model-value="getFilterValue(label.key)"
                    :placeholder="'Filter ' + label.name"
                    @update:model-value="(newValue) => handleFilterChange(label.key, newValue)"
                  >
                  </Input>
                <UiTableauSuffix v-if="label.type !== 'select'" :label="label"></UiTableauSuffix>
              </div>
            </TableCell>
          </tr>
        </TableBody>
      </Table>
    </div>
</template>