export const useFilterHelpers = () => {
  const { setFilter, clearAllFilters, hasActiveFilters, filters } = useTableauFilters()
  const { getOptionsForLabel } = useTableauData(['tag', 'month', 'year', 'platform', 'bundle'])

  // Calculer les bundles disponibles selon les filtres (sauf le filtre bundle)
  const getAvailableBundles = (bundles: any[]) => {
    if (!bundles) {
      return []
    }
    
    const activeFilters = Object.entries(filters.value).filter(([key]) => key !== 'bundle_id')
    
    if (activeFilters.length === 0) {
      return bundles
    }
    
    return bundles.filter((bundle: any) => {
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
  }

  const getFilteredOptionsForLabel = (labelKey: string, bundles?: any[]) => {
    switch(labelKey) {
      case 'bundle_id':
      case 'bundleId':
        if (bundles) {
          return getAvailableBundles(bundles).map((bundle: any) => ({ 
            id: bundle.id, 
            name: bundle.name 
          }))
        }
        return []
      default:
        return getOptionsForLabel(labelKey)
    }
  }

  const getPrecomputedOptions = (mainLabels: any[], bundles?: any[]) => {
    const cache: Record<string, any[]> = {}
    
    mainLabels?.forEach((label: any) => {
      const baseOptions = getFilteredOptionsForLabel(label.key, bundles)
      cache[label.key] = baseOptions.length > 0 ? [
        { id: '', name: 'Tout'}, 
        ...baseOptions
      ] : baseOptions
    })
    
    return cache
  }

  const handleFilterChange = (labelKey: string, newValue: any) => {
    setFilter(labelKey, newValue)
  }

  const getFilterValue = (labelKey: string) => {
    return filters.value[labelKey] || ''
  }

  // Définir les filtres par défaut
  const setInitialFilters = (mainLabels: any[]) => {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear().toString()
    const currentMonth = currentDate.toLocaleDateString('fr-FR', { month: 'long' })

    const yearLabel = mainLabels?.find((label: any) => label.key === 'year_id')
    const monthLabel = mainLabels?.find((label: any) => label.key === 'month_id')

    if (yearLabel) {
      setFilter('year_id', currentYear)
    }
    if (monthLabel) {
      setFilter('month_id', currentMonth)
    }
  }

  // Fonction pour remettre les filtres par défaut
  const resetToDefaultFilters = (mainLabels: any[]) => {
    clearAllFilters()
    setInitialFilters(mainLabels)
  }

  return {
    // État des filtres
    filters,
    hasActiveFilters,
    
    // Fonctions de base
    setFilter,
    clearAllFilters,
    getFilterValue,
    handleFilterChange,
    
    // Fonctions avancées
    getAvailableBundles,
    getFilteredOptionsForLabel,
    getPrecomputedOptions,
    setInitialFilters,
    resetToDefaultFilters
  }
}
