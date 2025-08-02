<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold">Exemple d'utilisation des labels par emplacement</h1>
    
    <!-- Labels de l'emplacement main -->
    <section>
      <h2 class="text-lg font-semibold mb-2">Labels Main</h2>
      <div v-if="pending">Chargement...</div>
      <div v-else>
        <div class="grid grid-cols-2 gap-2">
          <div v-for="label in mainLabels" :key="label.id" class="p-2 bg-blue-100 rounded">
            {{ label.name }} (pos: {{ label.position }})
          </div>
        </div>
      </div>
    </section>

    <!-- Labels de l'emplacement sidebar -->
    <section>
      <h2 class="text-lg font-semibold mb-2">Labels Sidebar</h2>
      <div v-if="pending">Chargement...</div>
      <div v-else>
        <div class="grid grid-cols-2 gap-2">
          <div v-for="label in sidebarLabels" :key="label.id" class="p-2 bg-green-100 rounded">
            {{ label.name }} (pos: {{ label.position }})
          </div>
        </div>
      </div>
    </section>

    <!-- Labels de l'emplacement footer -->
    <section>
      <h2 class="text-lg font-semibold mb-2">Labels Footer</h2>
      <div v-if="pending">Chargement...</div>
      <div v-else>
        <div class="grid grid-cols-2 gap-2">
          <div v-for="label in footerLabels" :key="label.id" class="p-2 bg-yellow-100 rounded">
            {{ label.name }} (pos: {{ label.position }})
          </div>
        </div>
      </div>
    </section>

    <!-- Sélecteur dynamique d'emplacement -->
    <section>
      <h2 class="text-lg font-semibold mb-2">Sélecteur dynamique</h2>
      <div v-if="pending">Chargement...</div>
      <div v-else>
        <select v-model="selectedEmplacement" class="mb-4 p-2 border rounded">
          <option value="">Choisir un emplacement</option>
          <option v-for="emp in emplacements" :key="emp.id" :value="emp.name">
            {{ emp.name }}
          </option>
        </select>
        
        <div v-if="selectedEmplacement" class="grid grid-cols-2 gap-2">
          <div v-for="label in dynamicLabels" :key="label.id" class="p-2 bg-purple-100 rounded">
            {{ label.name }} (pos: {{ label.position }})
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { 
  pending, 
  emplacements,
  mainLabels,
  getLabelsByEmplacement 
} = useTableauData(['label', 'emplacement'])

// Utilisation directe de la fonction avec différents emplacements
const sidebarLabels = computed(() => getLabelsByEmplacement('sidebar'))
const footerLabels = computed(() => getLabelsByEmplacement('footer'))

// Sélecteur dynamique
const selectedEmplacement = ref('')
const dynamicLabels = computed(() => {
  if (!selectedEmplacement.value) return []
  return getLabelsByEmplacement(selectedEmplacement.value)
})
</script>
