export const useTableauData = (models?: string[] | string) => {
  // Normaliser les modèles demandés
  const requestedModels = models ? 
    (Array.isArray(models) ? models : [models]) : 
    null;
  
  // Créer une clé unique basée sur les modèles demandés
  const cacheKey = requestedModels ? 
    `allOptions-${requestedModels.sort().join(',')}` : 
    'allOptions';
  
  // Construire l'URL avec les paramètres
  const url = requestedModels ? 
    `/api/getAllOptions?${requestedModels.map(m => `models=${m}`).join('&')}` : 
    '/api/getAllOptions';
  
  const { data: existingData } = useNuxtData<any>(cacheKey)
  
  const { 
    data: allOptions, 
    pending,
    error,
    refresh,
  } = useLazyFetch<any>(url, {
    key: cacheKey,
    server: true,
    default: () => ({}),
    dedupe: 'defer',
  })

  const roles = computed(() => allOptions.value?.role || [])
  const months = computed(() => allOptions.value?.month || [])
  const years = computed(() => allOptions.value?.year || [])
  const labels = computed(() => allOptions.value?.label || [])
  const emplacements = computed(() => allOptions.value?.emplacement || [])

  const tags = computed(() => allOptions.value?.tag || [])
  const platforms = computed(() => allOptions.value?.platform || [])
  const bundles = computed(() => allOptions.value?.bundle || [])
  const bundleGames = computed(() => allOptions.value?.bundleGame || [])
  const userGames = computed(() => allOptions.value?.userGame || [])
  const baseGames = computed(() => allOptions.value?.baseGame || [])
  const userLabelVisibilities = computed(() => allOptions.value?.userLabelVisibility || [])
  const states = computed(() => allOptions.value?.state || [])
  const priceHistories = computed(() => allOptions.value?.priceHistory || [])
  const gameStats = computed(() => allOptions.value?.gameStat || [])
  const users = computed(() => allOptions.value?.user || [])

  // Options préenregistrées pour éviter les recalculs
  const optionsTags = computed(() => tags.value.map((tag: any) => ({ 
    id: tag.id, 
    name: tag.name, 
    color: tag.color, 
    image: tag.image 
  })))
  const optionsMonths = computed(() => months.value.map((month: any) => ({ 
    id: month.id, 
    name: month.name 
  })))
  const optionsYears = computed(() => years.value.map((year: any) => ({ 
    id: year.id, 
    name: year.name 
  })))
  const optionsPlatforms = computed(() => platforms.value.map((platform: any) => ({ 
    id: platform.id, 
    name: platform.name, 
    color: platform.color, 
    image: platform.image 
  })))
  const optionsBundles = computed(() => bundles.value.map((bundle: any) => ({ 
    id: bundle.id, 
    name: bundle.name 
  })))

  const getUserGameValue = (userGame: any, labelKey: string) => {
    let value = userGame[labelKey];
    
    // Gestion spéciale pour les clés qui correspondent aux relations
    if(labelKey == 'tag_id') {
      value = userGame['tag'] ? userGame['tag'].name : userGame['tag_id'];
    }
    
    if(labelKey == 'month_id') {
      value = userGame['month_id'];
    }
    
    if(labelKey == 'year_id') {
      value = userGame['year_id'];
    }
    
    if(labelKey == 'platform_id') {
      value = userGame['platform_id'];
    }

    if(labelKey == 'order_in_list') {
      value = userGame['order_in_list'];
    }
    
    if (value === null || value === undefined) {
      return ''
    }
  
    return value.toString()
  }

  const getOptionsForLabel = (labelKey: string) => {
    switch(labelKey) {
      case 'tag_id':
      case 'tagId':
        return optionsTags.value
      case 'month_id':
      case 'monthId':
        return optionsMonths.value
      case 'year_id':
      case 'yearId':
        return optionsYears.value
      case 'platform_id':
      case 'plateformeId':
        return optionsPlatforms.value
      case 'bundle_id':
      case 'bundleId':
        return optionsBundles.value
      default:
        return []
    }
  }

  // Fonction pour récupérer les labels d'un emplacement spécifique (relation many-to-many)
  const getLabelsByEmplacement = (empName: string) => {
    if (!emplacements.value || !labels.value) return []
    const emplacement = emplacements.value.find((emp: any) => emp.name === empName)
    if (!emplacement) return []
    
    // Utiliser la nouvelle relation many-to-many via LabelEmplacement
    return labels.value.filter((label: any) => 
      label.label_emplacements?.some((le: any) => le.emplacement_id === emplacement.id)
    ).sort((a: any, b: any) => {
      // Trier par position dans l'emplacement
      const aPos = a.label_emplacements?.find((le: any) => le.emplacement_id === emplacement.id)?.position || 0
      const bPos = b.label_emplacements?.find((le: any) => le.emplacement_id === emplacement.id)?.position || 0
      return aPos - bPos
    })
  }

  // Computed pour mainLabels (rétrocompatibilité)
  const mainLabels = computed(() => getLabelsByEmplacement('main'))

  return {
    allOptions,
    pending,
    error,
    refresh,
    roles,
    months,
    years,
    labels,
    emplacements,
    mainLabels,
    tags,
    platforms,
    bundles,
    bundleGames,
    userGames,
    baseGames,
    userLabelVisibilities,
    states,
    priceHistories,
    gameStats,
    users,
    // Options préenregistrées optimisées
    optionsTags,
    optionsMonths,
    optionsYears,
    optionsPlatforms,
    optionsBundles,
    getUserGameValue,
    getOptionsForLabel,
    getLabelsByEmplacement
  }
}

// Supprimer l'ancien mainLabels qui était en dehors