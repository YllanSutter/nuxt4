<template>
    <!-- <span v-if="label.name == 'Nom'" class="suffix inline-block"> jeux</span> -->
    <span v-if="label.name == 'Heures jouées'" class="suffix inline-block">h</span>
    <span v-else-if="label.type != 'select' && label.name !== 'Nom' && label.name !== 'Ordre'" class="suffix inline-block">€</span>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: { name: string,type: string }; // Assurez-vous que 'label' est un objet avec une propriété 'name'
}>();
</script>