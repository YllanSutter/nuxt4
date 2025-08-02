<script setup lang="ts">
  const { setFilter, clearAllFilters, hasActiveFilters, filters } = useTableauFilters()

  const props = defineProps<{
    mainLabels: any;
    bundles: any; // Ajout des bundles en props
  }>();

  // Définir les filtres par défaut AVANT de charger les données
  const setInitialFilters = () => {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear().toString()
    const currentMonth = currentDate.toLocaleDateString('fr-FR', { month: 'long' })

    // Définir les filtres par défaut si les labels existent dans mainLabels
    const yearLabel = props.mainLabels?.find((label: any) => label.key === 'year_id')
    const monthLabel = props.mainLabels?.find((label: any) => label.key === 'month_id')

    if (yearLabel) {
      setFilter('year_id', currentYear)
    }
    if (monthLabel) {
      setFilter('month_id', currentMonth)
    }
  }

  // Appliquer les filtres initiaux dès que les mainLabels sont disponibles
  watch(() => props.mainLabels, (newLabels) => {
    if (newLabels && newLabels.length > 0 && Object.keys(filters.value).length === 0) {
      setInitialFilters()
    }
  }, { immediate: true })

  // MAINTENANT charger les données avec les filtres déjà appliqués
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

  // Calculer les bundles disponibles selon les filtres (sauf le filtre bundle)
  const getAvailableBundles = computed(() => {
    if (!props.bundles) {
      return []
    }
    
    // Filtrer les bundles basé sur les autres filtres (pas le bundle_id)
    const activeFilters = Object.entries(filters.value).filter(([key]) => key !== 'bundle_id')
    
    if (activeFilters.length === 0) {
      return props.bundles // Tous les bundles si pas d'autres filtres
    }
    
    // Filtrer les bundles selon les critères actifs
    return props.bundles.filter((bundle: any) => {
      return activeFilters.every(([filterKey, filterValue]) => {
        if (!filterValue || filterValue === '' || filterValue.startsWith('Tout')) {
          return true
        }
        
        switch(filterKey) {
          case 'month_id':
            return bundle.month?.name === filterValue
          case 'year_id':
            return bundle.year?.name === filterValue
          case 'platform_id':
            return bundle.platform?.name === filterValue
          default:
            return true
        }
      })
    })
  })

  const getFilteredOptionsForLabel = (labelKey: string) => {
    switch(labelKey) {
      case 'bundle_id':
      case 'bundleId':
        // Utiliser les bundles disponibles (filtrés par les autres critères, pas par bundle_id)
        return getAvailableBundles.value.map((bundle: any) => ({ 
          id: bundle.id, 
          name: bundle.name 
        }))
      default:
        return getOptionsForLabel(labelKey)
    }
  }

  const precomputedOptions = computed(() => {
    const cache: Record<string, any[]> = {}
    
    props.mainLabels?.forEach((label: any) => {
      const baseOptions = getFilteredOptionsForLabel(label.key)
      // Ajouter seulement l'option "Tous les ..." une seule fois, pas de doublon
      cache[label.key] = baseOptions.length > 0 ? [
        { id: '', name: 'Tout'}, 
        ...baseOptions
      ] : baseOptions
    })
    
    return cache
  })

  const handleFilterChange = (labelKey: string, newValue: any) => {
    setFilter(labelKey, newValue)
  }

  const getFilterValue = (labelKey: string) => {
    return filters.value[labelKey] || ''
  }

  // Fonction pour remettre les filtres par défaut
  const resetToDefaultFilters = () => {
    clearAllFilters()
    setInitialFilters()
  }
</script>

<template>
    <div class="relative w-full overflow-auto max-w-[1200px] mx-auto">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold">Filtres</h3>
        <div class="flex gap-2">
          <Button 
            @click="resetToDefaultFilters()" 
            variant="outline" 
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
                    :label="'Tout'"
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