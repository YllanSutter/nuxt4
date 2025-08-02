<script setup lang="ts">
  const { 
    getOptionsForLabel, 
    labels,
    // Options préenregistrées pour performance optimale
    optionsTags,
    optionsMonths,
    optionsYears,
    optionsPlatforms,
    optionsBundles,
  } = useTableauData(['tag', 'month', 'year', 'platform', 'bundle'])

  console.log('optionsTags:', optionsTags.value)
  console.log('optionsPlatforms:', optionsPlatforms.value)


  const { setFilter, clearAllFilters, hasActiveFilters, filters } = useTableauFilters()

  const props = defineProps<{
    mainLabels: any;
  }>();

  const precomputedOptions = computed(() => {
    const cache: Record<string, any[]> = {}
    
    props.mainLabels?.forEach((label: any) => {
      const baseOptions = getOptionsForLabel(label.key)
      cache[label.key] = [
        { id: '', name: 'Tous les ' + label.name }, 
        ...baseOptions
      ]
    })
    
    return cache
  })

  const handleFilterChange = (labelKey: string, newValue: any) => {
    setFilter(labelKey, newValue)
  }

  const getFilterValue = (labelKey: string) => {
    return filters.value[labelKey] || ''
  }
</script>

<template>
    <div class="relative w-full overflow-auto max-w-[1200px] mx-auto">
      <!-- {{ optionsTags }} test -->
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold">Filtres</h3>
        <Button 
          v-if="hasActiveFilters" 
          @click="clearAllFilters()" 
          variant="outline" 
          size="sm"
        >
          Effacer tous les filtres
        </Button>
      </div>
      
      <Table :key="`table-${labels.length}-${props.mainLabels.length}`">
        <TableHeader>
          <TableRow>
            <TableHead v-for="label in props.mainLabels" :key="label.id">
              <div class="flex items-center gap-1">
                <Icon :name="label.image"></Icon>{{ label.name }}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell 
              v-for="label in props.mainLabels" 
              :key="label.id" 
              class="font-medium"
            >
             
              <div class="flex items-center gap-1">   
                  <TableauRadioGroup 
                    :model-value="getFilterValue(label.key)"
                    v-if="label.type == 'select'"
                    :label="'Tous les ' + label.name"
                    :options="precomputedOptions[label.key] || []"
                    @update:model-value="(newValue) => handleFilterChange(label.key, newValue)"
                  />             
                  
                  <Input 
                    v-else
                    :model-value="getFilterValue(label.key)"
                    :placeholder="'Filtrer par ' + label.name"
                    @update:model-value="(newValue) => handleFilterChange(label.key, newValue)"
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