<script setup lang="ts">
  const { 
    pending, 
    error, 
    userGames, 
    getLabelsByEmplacement,
    refresh 
  } = useTableauData(['userGame', 'label', 'emplacement', 'bundleGame']) // Ajouter bundleGame 
  
  const mainLabels = computed(() => getLabelsByEmplacement('main'));
  const filtres = computed(() => getLabelsByEmplacement('filtres'));
  const { bundles, refresh: refreshBundles } = useTableauData(['bundle'])
  
  // Fonction pour forcer le refresh de toutes les données
  const forceRefresh = async () => {
    await Promise.all([refresh(), refreshBundles()])
    console.log('Données rafraîchies')
  }

  
</script>

<template>
  <div v-if="pending" class="p-4">
    Chargement des données du tableau...
  </div>
  
  <div v-else-if="error" class="p-4 text-red-500">
    Erreur lors du chargement : {{ error }}
    <button @click="refresh()" class="ml-2 px-3 py-1 bg-blue-500 text-white rounded">
      Réessayer
    </button>
    <button @click="forceRefresh()" class="ml-2 px-3 py-1 bg-green-500 text-white rounded">
      Forcer le refresh
    </button>
  </div>
  
  <div v-else-if="!userGames || !userGames.length || !mainLabels || !mainLabels.length" class="p-4">
    Chargement des données du tableau...
  </div>
  
  <div v-else>
    
    <TableauFiltres
    :main-labels=filtres
    :bundles=bundles
    />
    <TableauGroup
    :main-labels=mainLabels
    :bundles=bundles
    />
  </div>
</template>