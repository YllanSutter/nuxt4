// Cache global pour éviter les appels multiples à useTableauData
const globalCache = new Map<string, any>();

export const useGlobalTableauData = () => {
  // Fonction pour obtenir les données avec cache global
  const getTableauData = (models?: string[] | string) => {
    const requestedModels = models ? 
      (Array.isArray(models) ? models : [models]) : 
      null;
    
    const cacheKey = requestedModels ? 
      `allOptions-${requestedModels.sort().join(',')}` : 
      'allOptions';
    
    // Vérifier si les données sont déjà en cache
    if (globalCache.has(cacheKey)) {
      return globalCache.get(cacheKey);
    }
    
    // Si pas en cache, utiliser useTableauData normal
    const data = useTableauData(models);
    
    // Mettre en cache
    globalCache.set(cacheKey, data);
    
    return data;
  };

  // Fonction pour vider le cache
  const clearGlobalCache = () => {
    globalCache.clear();
  };

  // Fonction pour rafraîchir toutes les données
  const refreshAllData = async () => {
    clearGlobalCache();
    // Rafraîchir toutes les clés de cache
    for (const [key, data] of globalCache.entries()) {
      if (data && typeof data.refresh === 'function') {
        await data.refresh();
      }
    }
  };

  return {
    getTableauData,
    clearGlobalCache,
    refreshAllData
  };
};
