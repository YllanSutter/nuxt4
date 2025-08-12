<script setup lang="ts">
  const { 
    pending, 
    error, 
    userGames, 
    bundles,
    getLabelsByEmplacement,
    mainLabels,
    labels,
    filtres,
    calcLabels,
    refresh 
  } = useTableauData(['userGame', 'label', 'emplacement', 'bundleGame', 'bundle', 'rating']) 
  

  

  const forceRefresh = async () => {
    await refresh()
    console.log('Données rafraîchies')
  }

  
</script>

<template>
  
  <ReglagesExport :main-labels="labels"/>
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
  
  
  <div v-else>
    
    <TableauFiltres
    :main-labels=filtres
    :bundles=bundles
    />
    <TableauGroup
    :main-labels=mainLabels
    :calc-labels=calcLabels
    :bundles=bundles
    />
  </div>
</template>