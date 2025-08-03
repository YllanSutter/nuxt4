import { ClientOnly } from '../../../.nuxt/components';
<template>
    <span v-if="label.name == 'Name' && emplacement == 'footer'" class="suffix inline-block"> jeux</span>
    <span v-else-if="label.name == 'Playtime'" class="suffix inline-block">h</span>
    <span v-else-if="label.name == 'Note'" class="suffix inline-block" style="color:#FFC107"><ClientOnly><Icon name="solar:stars-bold-duotone" size="20"/></ClientOnly></span>
    <span v-else-if="label.type != 'select' && label.type != 'boolean' && label.name !== 'Name' && label.name !== 'Order' && label.name !== 'Search'" class="suffix inline-block">€</span>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: { name: string,type: string }; // Assurez-vous que 'label' est un objet avec une propriété 'name'
  emplacement?:string
}>();
</script>