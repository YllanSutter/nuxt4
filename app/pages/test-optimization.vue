<!-- Exemple d'utilisation des nouvelles fonctionnalités -->
<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold">Exemples d'utilisation optimisée</h1>
    
    <!-- Tableau avec données minimales -->
    <section>
      <h2 class="text-lg font-semibold mb-2">Tableau (userGames + labels seulement)</h2>
      <div v-if="tableauPending">Chargement tableau...</div>
      <div v-else>
        <p>UserGames: {{ tableauUserGames.length }}</p>
        <p>Labels: {{ tableauLabels.length }}</p>
      </div>
    </section>

    <!-- Formulaire avec options -->
    <section>
      <h2 class="text-lg font-semibold mb-2">Formulaire (options seulement)</h2>
      <div v-if="formPending">Chargement options...</div>
      <div v-else>
        <p>Rôles: {{ formRoles.length }}</p>
        <p>Plateformes: {{ formPlatforms.length }}</p>
        <p>Tags: {{ formTags.length }}</p>
      </div>
    </section>

    <!-- Admin avec utilisateurs -->
    <section>
      <h2 class="text-lg font-semibold mb-2">Admin (utilisateurs seulement)</h2>
      <div v-if="adminPending">Chargement admin...</div>
      <div v-else>
        <p>Utilisateurs: {{ adminUsers.length }}</p>
        <p>Rôles: {{ adminRoles.length }}</p>
      </div>
    </section>

    <!-- Données spécifiques utilisateur -->
    <section>
      <h2 class="text-lg font-semibold mb-2">Mes données (userGames filtrés)</h2>
      <div v-if="userPending">Chargement...</div>
      <div v-else>
        <p>Mes jeux: {{ userSpecificGames.length }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Import des composables spécialisés
const { userGames: tableauUserGames, labels: tableauLabels, pending: tableauPending } = useTableauSpecificData()
const { roles: formRoles, platforms: formPlatforms, tags: formTags, pending: formPending } = useFormOptionsData()
const { users: adminUsers, roles: adminRoles, pending: adminPending } = useAdminData()
const { userGames: userSpecificGames, pending: userPending } = useUserSpecificData()
</script>
