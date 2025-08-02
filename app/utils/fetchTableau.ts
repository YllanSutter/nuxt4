export const useTableauData = (models?: string[] | string) => {

  const requestedModels = models ? 
    (Array.isArray(models) ? models : [models]) : 
    null;
  
  const cacheKey = requestedModels ? 
    `allOptions-${requestedModels.sort().join(',')}` : 
    'allOptions';
  
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

  const optionsTags = computed(() => tags.value.map((tag: any) => ({ 
    id: tag.id, 
    name: tag.name, 
    color: tag.color, 
    image: tag.image 
  })))
  
  const monthOrder = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ]
  
  const optionsMonths = computed(() => {
    return months.value
      .map((month: any) => ({ id: month.id, name: month.name }))
      .sort((a: any, b: any) => {
        const aIndex = monthOrder.findIndex(m => m.toLowerCase() === a.name.toLowerCase())
        const bIndex = monthOrder.findIndex(m => m.toLowerCase() === b.name.toLowerCase())
        return aIndex - bIndex
      })
  })
  
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
    // Toujours retourner le nom pour l'affichage, jamais l'ID
    if(labelKey == 'tag_id') {
      if (userGame['tag']) {
        value = userGame['tag'].name;
      } else if (userGame['tag_id']) {
        // Trouver le nom du tag à partir de l'ID
        const tag = optionsTags.value.find((t: { id: any; }) => t.id === userGame['tag_id']);
        value = tag ? tag.name : userGame['tag_id'];
      }
    }
    
    if(labelKey == 'month_id') {
      if (userGame['month']) {
        value = userGame['month'].name;
      } else if (userGame['month_id']) {
        // Trouver le nom du mois à partir de l'ID
        const month = optionsMonths.value.find((m: { id: any; }) => m.id === userGame['month_id']);
        value = month ? month.name : userGame['month_id'];
      }
    }
    
    if(labelKey == 'year_id') {
      if (userGame['year']) {
        value = userGame['year'].name;
      } else if (userGame['year_id']) {
        const year = optionsYears.value.find((y: { id: any; }) => y.id === userGame['year_id']);
        value = year ? year.name : userGame['year_id'];
      }
    }
    
    if(labelKey == 'platform_id') {
      if (userGame['platform']) {
        value = userGame['platform'].name;
      } else if (userGame['platform_id']) {
        const platform = optionsPlatforms.value.find((p: { id: any; }) => p.id === userGame['platform_id']);
        value = platform ? platform.name : userGame['platform_id'];
      }
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
    
    return labels.value.filter((label: any) => 
      label.label_emplacements?.some((le: any) => le.emplacement_id === emplacement.id)
    ).sort((a: any, b: any) => {
      const aPos = a.label_emplacements?.find((le: any) => le.emplacement_id === emplacement.id)?.position || 0
      const bPos = b.label_emplacements?.find((le: any) => le.emplacement_id === emplacement.id)?.position || 0
      return aPos - bPos
    })
  }

  const updateLocalData = (elemId: string, field: string, value: string, table: string) => {
    console.log(`🔄 Mise à jour locale: ${table}.${elemId}.${field} = "${value}"`);
    
    const tableMap: Record<string, any> = {
      'UserGame': userGames,
      'Bundle': bundles,
      'User': users,
      'Platform': platforms,
      'Tag': tags,
    };
    
    const targetArray = tableMap[table];
    if (targetArray?.value) {
      const item = targetArray.value.find((item: any) => item.id === elemId);
      if (item) {
        const oldValue = item[field];
        item[field] = value;
        console.log(`✅ ${table}.${elemId}.${field}: "${oldValue}" → "${value}"`);
      }
    }
  }

  // Computed pour mainLabels (rétrocompatibilité)
  const mainLabels = computed(() => getLabelsByEmplacement('main'))

  const clearCacheAndRefresh = async () => {
    console.log('🔄 Vidage du cache et rafraîchissement des données...');
    // Vider le cache Nuxt
    if (existingData) {
      existingData.value = null;
    }
    // Rafraîchir les données depuis l'API
    await refresh();
    console.log('✅ Cache vidé et données rafraîchies');
  }

  return {
    allOptions,
    pending,
    error,
    refresh,
    clearCacheAndRefresh,
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
    getLabelsByEmplacement,
    updateLocalData
  }
}

// Supprimer l'ancien mainLabels qui était en dehors