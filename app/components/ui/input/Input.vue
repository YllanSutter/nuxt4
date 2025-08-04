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
const localValue = ref('')

// Watcher pour synchroniser avec modelValue externe
watch(() => props.modelValue, (newValue) => {
  // Convertir 0 en chaîne vide pour l'affichage
  localValue.value = (newValue === 0 || newValue === '0') ? '' : String(newValue || '')
}, { immediate: true })

// Watcher pour émettre les changements
watch(localValue, (newValue) => {
  // Convertir chaîne vide en 0 pour le stockage
  const numericValue = newValue === '' ? 0 : newValue
  emits('update:modelValue', numericValue)
})
</script>

<template>
  <input
    v-model="localValue"
    data-slot="input"
    :placeholder="label === 'recherche' || label === 'name' ? '...':'0'"
    :style="label === 'name' ? { minWidth: ((localValue?.length ?? 2) * 1) + 'ch' } : { minWidth: labelLength + 'ch' }"
    :class="cn(
      'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 border-l dark:border-[#ffffff20] border-[#00000050] bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
      'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
      '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [appearance:textfield] bg-transparent focus:outline-none focus:ring-0 focus:border-none w-full py-2',
      props.class,
      label,
      label=='name' ? '  ' : ' text-right '
    )"
  >
</template>
