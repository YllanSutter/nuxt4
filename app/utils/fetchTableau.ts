// Cache pour éviter les appels multiples
const pendingRequests = new Set<string>();

export const useTableauData = (models?: string[] | string) => {
  const requestedModels = models ? 
    (Array.isArray(models) ? models : [models]) : 
    null;
  
  const cacheKey = requestedModels ? 
    `allOptions-${requestedModels.sort().join(',')}` : 
    'allOptions';
  
  // Vérifier si une requête est déjà en cours
  if (pendingRequests.has(cacheKey)) {
    // console.log(`⏳ [useTableauData] Requête déjà en cours pour: ${cacheKey}`);
  } else {
    console.log(`🚀 [useTableauData] Nouvelle requête pour: ${cacheKey}`);
    pendingRequests.add(cacheKey);
  }
  
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
    server: false, // Désactiver le SSR pour éviter les problèmes d'hydratation
    default: () => ({}),
    dedupe: 'defer',
    timeout: 10000, // 10 secondes de timeout
    onRequestError({ error }) {
      console.error('Erreur de requête getAllOptions:', error);
      pendingRequests.delete(cacheKey);
    },
    onResponseError({ response }) {
      console.error('Erreur de réponse getAllOptions:', response.status, response.statusText);
      pendingRequests.delete(cacheKey);
    },
    onResponse() {
      // Retirer de la liste des requêtes en cours quand terminé
      pendingRequests.delete(cacheKey);
    }
  })

  const roles = computed(() => allOptions.value?.role || [])
  const months = computed(() => allOptions.value?.month || [])
  const years = computed(() => allOptions.value?.year || [])
  const labels = computed(() => allOptions.value?.label || [])
  const emplacements = computed(() => allOptions.value?.emplacement || [])

  const tags = computed(() => allOptions.value?.tag || [])
  const ratings = computed(() => allOptions.value?.rating || [])
  const platforms = computed(() => allOptions.value?.platform || [])
  const bundles = computed(() => allOptions.value?.bundle || [])
  const bundleGames = computed(() => allOptions.value?.bundleGame || [])
  const userGames = computed(() => allOptions.value?.userGame || [])
  const baseGames = computed(() => allOptions.value?.baseGame || [])
  const userLabelVisibility = computed(() => allOptions.value?.userLabelVisibility || [])
  const states = computed(() => allOptions.value?.state || [])
  const priceHistories = computed(() => allOptions.value?.priceHistory || [])
  const gameStats = computed(() => allOptions.value?.gameStat || [])
  const users = computed(() => allOptions.value?.user || [])

  const optionsTags = computed(() => {
    return tags.value.map((tag: any) => ({ 
      id: tag.id, 
      name: tag.name, 
      color: tag.color, 
      image: tag.image 
    }))
  })

  const optionsRatings = computed(() => {
    return ratings.value.map((rating: any) => ({ 
      id: rating.id, 
      name: rating.name, 
      value: rating.value,
      color: rating.color, 
      image: rating.image 
    }))
  })
  
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
  const optionsPlatforms = computed(() => {
    return platforms.value.map((platform: any) => ({ 
      id: platform.id, 
      name: platform.name, 
      color: platform.color, 
      image: platform.image 
    }))
  })
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

    if(labelKey == 'rating_id' || labelKey == 'rating') {
      if (userGame['rating_ref']) {
        value = userGame['rating_ref'].name;
      } else if (userGame['rating_id']) {
        const rating = optionsRatings.value.find((r: { id: any; }) => r.id === userGame['rating_id']);
        value = rating ? rating.name : userGame['rating_id'];
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
      case 'rating_id':
      case 'ratingId':
      case 'rating':
        return optionsRatings.value
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

  const getLabelsByEmplacement = (empName: string) => {
    if (!emplacements.value || !labels.value) return [];
    const emplacement = emplacements.value.find((emp: any) => emp.name === empName);
    if (!emplacement) return [];
    return labels.value.filter((label: any) => {
      const isInEmplacement = label.label_emplacements?.some((le: any) => le.emplacement_id === emplacement.id);
      if (!isInEmplacement) return false;
      // Filtrer sur la visibilité utilisateur
      if (Array.isArray(label.user_label_visibility) && label.user_label_visibility.length > 0) {
        return label.user_label_visibility.some((vis: any) => vis.visible === true);
      }
      // Si pas de visibilité renseignée, on peut choisir de ne pas afficher (false) ou afficher (true)
      return false;
    }).sort((a: any, b: any) => {
      const aPos = a.label_emplacements?.find((le: any) => le.emplacement_id === emplacement.id)?.position || 0;
      const bPos = b.label_emplacements?.find((le: any) => le.emplacement_id === emplacement.id)?.position || 0;
      return aPos - bPos;
    });
  }

  const updateLocalData = (elemId: string, field: string, value: any, table: string) => {
    // Muter directement la source (allOptions.value[...]) car les computed sont readonly
    const tablePropMap: Record<string, string> = {
      'UserGame': 'userGame',
      'Bundle': 'bundle',
      'User': 'user',
      'Platform': 'platform',
      'Tag': 'tag',
      'Rating': 'rating',
    }
    const prop = tablePropMap[table]
    if (!prop) return
    const sourceArray = allOptions.value ? (allOptions.value as any)[prop] : undefined
    if (Array.isArray(sourceArray)) {
      const idx = sourceArray.findIndex((item: any) => item.id === elemId)
      if (idx !== -1) {
        const item = sourceArray[idx]
        const oldValue = item[field]
        item[field] = value
        // Si on modifie rating_id, mettre à jour rating_ref aussi
        if (field === 'rating_id' && item.rating_ref) {
          const ratingObj = optionsRatings.value.find((r: any) => r.id === value)
          if (ratingObj) {
            item.rating_ref.value = ratingObj.value
            item.rating_ref.name = ratingObj.name
            item.rating_ref.color = ratingObj.color
            item.rating_ref.image = ratingObj.image
          }
        }
        console.log(`✅ ${table}.${elemId}.${field}: "${oldValue}" → "${value}"`)
        // Forcer la réactivité: réassigner l'array dans allOptions
        ;(allOptions.value as any)[prop] = [...sourceArray]
      }
    }
  }

  // Computed pour mainLabels (rétrocompatibilité)
  const mainLabels = computed(() => getLabelsByEmplacement('main'))

  const clearCacheAndRefresh = async () => {
    console.log('🔄 [fetchTableau] Vidage du cache et rafraîchissement des données...');
    console.trace('🔍 [fetchTableau] Appelé depuis:');
    // Vider le cache Nuxt
    if (existingData) {
      existingData.value = null;
    }
    // Rafraîchir les données depuis l'API
    await refresh();
    console.log('✅ [fetchTableau] Cache vidé et données rafraîchies');
  }

  const filtres = computed(() => getLabelsByEmplacement('filtres'));
  const calcLabels = computed(() => getLabelsByEmplacement('calculs'));

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
    ratings,
    platforms,
    bundles,
    bundleGames,
    userGames,
    baseGames,
    userLabelVisibility,
    states,
    priceHistories,
    gameStats,
    users,
    // Options préenregistrées optimisées
    optionsTags,
    optionsRatings,
    optionsMonths,
    optionsYears,
    optionsPlatforms,
    optionsBundles,
    filtres,
    calcLabels,
    getUserGameValue,
    getOptionsForLabel,
    getLabelsByEmplacement,
    updateLocalData
  };
}

// Supprimer l'ancien mainLabels qui était en dehors