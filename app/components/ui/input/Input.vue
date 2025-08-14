<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '~/lib/utils'

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  label?: string
  class?: HTMLAttributes['class']
  type?: string
}>()

const minSize = 8;
const labelLength = props.label ? (props.label.length < minSize ? minSize : props.label.length) : minSize;


const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

// Utiliser un ref local pour le contrôle complet de l'affichage
// const localValue = ref('')

// Affichage tronqué à 2 décimales si type number/decimal
// function truncate2Decimals(val: string | number) {
//   const num = parseFloat(String(val));
//   if (Number.isNaN(num)) return '';
//   // Correction flottant : arrondi à l'entier le plus proche avant division
//   return (Math.floor(num * 100 + 1e-8) / 100).toFixed(2);
// }

// const displayValue = computed({
//   get() {
//     return localValue.value;
//   },
//   set(val: string) {
//     localValue.value = val;
//   }
// });

// function formatOnBlur() {
//   if ((props.type === 'number' || props.type === 'decimal') && localValue.value !== '') {
//     const num = parseFloat(localValue.value);
//     if (!Number.isNaN(num)) {
//       // Si la valeur est entière, pas de décimales
//       localValue.value = Number.isInteger(num) ? String(num) : (Math.floor(num * 100 + 1e-8) / 100).toString();
//     }
//   }
// }

// Watcher pour synchroniser avec modelValue externe
// watch(() => props.modelValue, (newValue) => {
//   // Convertir 0 en chaîne vide pour l'affichage
//   let displayValue = (newValue === 0 || newValue === '0') ? '' : String(newValue || '');
//   if (
//     (props.type === 'number' || props.type === 'decimal') &&
//     typeof newValue === 'number'
//   ) {
//     displayValue = newValue.toFixed(2);
//   }
//   localValue.value = displayValue;
// }, { immediate: true })

// // Watcher pour émettre les changements
// watch(localValue, (newValue) => {
//   let formattedValue = newValue;
//   if (
//     (props.type === 'number' || props.type === 'decimal') &&
//     typeof newValue === 'string' &&
//     newValue !== ''
//   ) {
//     // Tronque la valeur émise à 2 décimales
//     const num = parseFloat(newValue);
//     formattedValue = Number.isNaN(num) ? '0' : num.toFixed(2);
//   }
//   emits('update:modelValue', newValue === '' ? 0 : formattedValue);
// })

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLSelectElement;
  let value: string | number = target.value;

  if (
    target.type === 'number' ||
    (props.type === 'select' && props.label && props.label.endsWith('Id'))
  ) {
    value = Number(target.value);
  }
 
  emits('update:modelValue', value === '' ? 0 : value);
};
</script>

<template>
  <input
    :value="modelValue === 0 || 0.00 || '' ? '' : modelValue"
    @change="handleInput"
    data-slot="input"
    :type="type"
    :placeholder="label === 'recherche' || label === 'name' ? '...':'0'"
    :style="label === 'name' ? { minWidth: ((modelValue?.toString().length ?? 2) * 1.1) + 'ch' } : { minWidth: labelLength + 'ch' }"
    :class="cn(
      'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 border-l dark:border-[#ffffff20] border-[#00000050] bg-transparent px-3 py-1 shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
      'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
      'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
      '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [appearance:textfield] bg-transparent focus:outline-none focus:ring-0 focus:border-none w-full py-2',
      props.class,
      label,
      label=='name' ? '  ' : ' text-right '
    )"
  >
</template>
