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
  
  <!-- Utiliser ClientOnly pour éviter les problèmes d'hydratation -->
  <ClientOnly>
    <div v-if="pending" class="p-4">
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span class="ml-2">Chargement des données du tableau...</span>
      </div>
    </div>
    
    <div v-else-if="error" class="p-4 text-red-500">
      <h3 class="font-bold text-lg mb-2">Erreur lors du chargement :</h3>
      <p class="mb-4">{{ error }}</p>
      <div class="space-x-2">
        <button @click="refresh()" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
          Réessayer
        </button>
        <button @click="forceRefresh()" class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
          Forcer le refresh
        </button>
      </div>
    </div>
    
    <div v-else class="pt-20">
      <TableauFiltres
        :main-labels=filtres
        :bundles=bundles
      />
      <TableauGroup
        :main-labels=mainLabels
        :calc-labels=calcLabels
        :filtres-labels="filtres"
        :bundles=bundles
      />
    </div>
    
    <template #fallback>
      <div class="p-4">
        <div class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span class="ml-2">Chargement des données du tableau...</span>
        </div>
      </div>
    </template>
  </ClientOnly>
</template>