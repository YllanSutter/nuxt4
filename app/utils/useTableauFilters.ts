// Store global réactif pour les filtres
const globalFilters = ref<Record<string, any>>({})

// Store global pour la performance des filtres avec cache
const cachedFilterResults = ref<{
  lastFilters: Record<string, any>
  lastDataSignature: string
  filteredBundles: any[]
  bundleGameMap: Map<string, any[]>
  filteredUserGames: any[]
}>({
  lastFilters: {},
  lastDataSignature: '',
  filteredBundles: [],
  bundleGameMap: new Map(),
  filteredUserGames: []
})

export const useTableauFilters = () => {
  // Fonction pour mettre à jour un filtre
  const setFilter = (labelKey: string, value: any) => {
    if (!value || value === '' || value === labelKey || value.startsWith('Tout')) {
      delete globalFilters.value[labelKey]
    } else {
      globalFilters.value[labelKey] = value
    }
    globalFilters.value = { ...globalFilters.value }
  }

  // Fonction optimisée pour filtrer TOUTES les données d'un coup
  const filterAllData = (bundles: any[], userGames: any[], bundleGames: any[]) => {
    if (!bundles || !userGames || !bundleGames) {
      return {
        filteredBundles: [],
        bundleGameMap: new Map(),
        filteredUserGames: []
      }
    }

    // Vérifier si le cache est encore valide
    const filtersChanged = JSON.stringify(globalFilters.value) !== JSON.stringify(cachedFilterResults.value.lastFilters)
    const dataSignature = `${bundles.length}-${userGames.length}-${bundleGames.length}`
    const cachedDataSignature = cachedFilterResults.value.lastDataSignature || ''
    const dataChanged = dataSignature !== cachedDataSignature
    
    // console.log('🔍 Cache check:', { 
    //   filtersChanged, 
    //   dataChanged, 
    //   dataSignature, 
    //   cachedDataSignature 
    // })
    
    if (!filtersChanged && !dataChanged && 
        cachedFilterResults.value.filteredBundles.length > 0) {
      // Retourner le cache si ni les filtres ni les données n'ont changé
      // console.log('📦 Cache utilisé')
      return {
        filteredBundles: cachedFilterResults.value.filteredBundles,
        bundleGameMap: cachedFilterResults.value.bundleGameMap,
        filteredUserGames: cachedFilterResults.value.filteredUserGames
      }
    }
    
    // console.log('🔄 Recalcul complet des filtres...')

    // Séparer les filtres de bundles et de jeux
    const allFilters = Object.entries(globalFilters.value)
    const bundleFilters = allFilters.filter(([labelKey]) => 
      labelKey === 'bundle_id' || labelKey === 'bundleId' || 
      labelKey === 'month_id' || labelKey === 'monthId' || 
      labelKey === 'year_id' || labelKey === 'yearId' || 
      labelKey === 'platform_id' || labelKey === 'plateformeId'
    )
    const gameFilters = allFilters.filter(([labelKey]) => 
      labelKey === 'tag_id' || labelKey === 'tagId' || 
      labelKey === 'name' || labelKey === 'order_in_list' || labelKey === 'order' ||
      labelKey === 'search' || labelKey === 'recherche'
    )

    // Étape 1: Filtrer les bundles
    let filteredBundles = bundles
    if (bundleFilters.length > 0) {
      filteredBundles = bundles.filter((bundle) => {
        return bundleFilters.every(([labelKey, filterValue]) => {
          let bundleValue
          switch (labelKey) {
            case 'month_id':
            case 'monthId':
              bundleValue = bundle.month?.name || ''
              break
            case 'year_id':
            case 'yearId':
              bundleValue = bundle.year?.name || ''
              break
            case 'platform_id':
            case 'plateformeId':
              bundleValue = bundle.platform?.name || ''
              break
            case 'bundle_id':
            case 'bundleId':
              bundleValue = bundle.name || ''
              break
              
            default:
              bundleValue = bundle[labelKey]
          }
          
          if (typeof bundleValue === 'string' && typeof filterValue === 'string') {
            return bundleValue.toLowerCase().includes(filterValue.toLowerCase())
          }
          return bundleValue == filterValue
        })
      })
    }

    // Étape 2: Filtrer les userGames
    let filteredUserGames = userGames
    if (gameFilters.length > 0) {
      filteredUserGames = userGames.filter((userGame) => {
        return gameFilters.every(([labelKey, filterValue]) => {
          let gameValue
          
          if (labelKey === 'tag_id' || labelKey === 'tagId') {
            gameValue = userGame.tag?.name || ''
          } else if (labelKey === 'order_in_list' || labelKey === 'order') {
            gameValue = userGame.order_in_list
          } else if (labelKey === 'search' || labelKey === 'recherche') {
            // Recherche dans le nom du jeu pour le filtre search
            gameValue = userGame.name || ''
          } else {
            gameValue = userGame[labelKey]
          }
          
          // Pour les tags, faire une comparaison exacte (insensible à la casse)
          if (labelKey === 'tag_id' || labelKey === 'tagId') {
            if (typeof gameValue === 'string' && typeof filterValue === 'string') {
              return gameValue.toLowerCase() === filterValue.toLowerCase()
            }
            return gameValue == filterValue
          }
          
          // Pour les autres champs, garder la recherche par sous-chaîne
          if (typeof gameValue === 'string' && typeof filterValue === 'string') {
            return gameValue.toLowerCase().includes(filterValue.toLowerCase())
          }
          return gameValue == filterValue
        })
      })
    }

    // Étape 3: Créer une map optimisée bundle -> jeux
    const bundleGameMap = new Map<string, any[]>()
    
    // Créer d'abord une map user_game_id -> userGame pour un accès O(1)
    const userGameMap = new Map()
    filteredUserGames.forEach(ug => userGameMap.set(ug.id, ug))
    
    // Puis regrouper par bundle en une seule passe
    bundleGames.forEach(bg => {
      const userGame = userGameMap.get(bg.user_game_id)
      if (userGame) {
        if (!bundleGameMap.has(bg.bundle_id)) {
          bundleGameMap.set(bg.bundle_id, [])
        }
        bundleGameMap.get(bg.bundle_id)!.push(userGame)
      }
    })

    // Trier les jeux dans chaque bundle par ordre
    bundleGameMap.forEach(games => {
      games.sort((a, b) => (a.order_in_list || 0) - (b.order_in_list || 0))
    })

    // Mettre à jour le cache
    cachedFilterResults.value = {
      lastFilters: { ...globalFilters.value },
      lastDataSignature: dataSignature,
      filteredBundles,
      bundleGameMap,
      filteredUserGames
    }

    return {
      filteredBundles,
      bundleGameMap,
      filteredUserGames
    }
  }

  // Computed pour avoir un état réactif des filtres
  const activeFilters = computed(() => globalFilters.value)
  const hasActiveFilters = computed(() => Object.keys(globalFilters.value).length > 0)
  
  // Fonction pour réinitialiser tous les filtres
  const clearAllFilters = () => {
    globalFilters.value = {}
    // Vider le cache quand on reset
    cachedFilterResults.value = {
      lastFilters: {},
      lastDataSignature: '',
      filteredBundles: [],
      bundleGameMap: new Map(),
      filteredUserGames: []
    }
  }

  return {
    filters: activeFilters,
    setFilter,
    filterAllData, // Fonction optimisée
    hasActiveFilters,
    clearAllFilters
  }
}
