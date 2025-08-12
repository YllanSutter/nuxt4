
<script setup lang="ts">
import { ref } from 'vue'
import { useVModel } from '@vueuse/core'
import type { HTMLAttributes } from 'vue'

const open = ref(false)
const position = ref('bottom')

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  label?: string
  options?: any[]
  class?: HTMLAttributes['class']
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

// Valeur stable pour l'hydration (côté serveur, on utilise toujours la prop)
const stableValue = computed(() => {
  return props.modelValue || props.label || 'Sélectionner'
})

// Computed pour éviter la répétition de calcul et assurer la cohérence
const selectedOption = computed(() => {
  if (!props.options || !modelValue.value) return null;
  return props.options.find(opt => opt.name === modelValue.value || opt.id === modelValue.value) || null;
})

// Options réactives avec deep watching pour forcer la réactivité
const reactiveOptions = computed(() => {
  if (!props.options) return []
  // Force la création d'un nouvel array pour éviter les problèmes de cache
  return props.options.map(opt => ({
    id: opt.id,
    name: opt.name,
    color: opt.color,
    image: opt.image
  }))
})

// Signature des données pour forcer le re-rendu quand les options changent
const dataSignature = computed(() => {
  if (!reactiveOptions.value.length) return 'empty'
  return reactiveOptions.value.map(opt => `${opt.id}-${opt.name}-${opt.image}-${opt.color}`).join('|')
})

// Force re-render key qui change quand l'icône ou la couleur de l'option sélectionnée change
const forceRenderKey = computed(() => {
  return `${selectedOption.value?.id || 'none'}-${selectedOption.value?.image || 'none'}-${selectedOption.value?.color || 'none'}`
})
</script>

<template>
  <ClientOnly>
    <DropdownMenu :key="dataSignature">
      <DropdownMenuTrigger asChild>
        <Button :class="['w-full justify-start pt-1 ']" variant="shadow" :style="{ borderBottom: `1px solid ${selectedOption?.color || ''}` }">
          <Icon
            v-if="selectedOption?.image"
            :key="forceRenderKey"
            :name="selectedOption?.image"
            :size="16"
            :color="selectedOption?.color"
            mode="svg"
          ></Icon>
          {{ selectedOption ? selectedOption.name : (modelValue || props.label || 'Sélectionner') }}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent class="w-56 max-h-96 overflow-y-auto" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem @click="modelValue = ''">
            <div class="flex items-center gap-2 w-full">
              <span class="text-gray-500 italic">Aucun</span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            v-for="option in reactiveOptions" 
            :key="`${option.id}-${dataSignature}`"
            @click="modelValue = option.name"
          >
            <div class="flex items-center gap-2 w-full">
              <Icon
                v-if="option.image"
                :key="`option-icon-${option.id}-${dataSignature}`"
                :style="{ color: option.color || '' }"
                :name="option.image"
                :size="16"
                mode="svg"
              ></Icon>
              <span>{{ option.name }}</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </ClientOnly>
</template>
