
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

// Computed pour éviter la répétition de calcul et assurer la cohérence
const selectedOption = computed(() => {
  if (!props.options || !modelValue.value) return null;
  return props.options.find(opt => opt.name === modelValue.value || opt.id === modelValue.value) || null;
})
</script>

<template>
 <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button :class="['w-full justify-start pt-1 ']" variant="outline" :style="{ borderBottom: `1px solid ${selectedOption?.color || ''}` }">
          <Icon
            v-if="selectedOption?.image"
            :style="{ color: selectedOption?.color || '' }"
            :name="selectedOption?.image"
            :size="16"
          ></Icon>
          {{ selectedOption ? selectedOption.name : (modelValue || props.label || 'Sélectionner') }}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent class="w-56 max-h-96 overflow-y-auto" align="start">
        <DropdownMenuGroup>
          <!-- Option pour vider la sélection -->
          <DropdownMenuItem @click="modelValue = ''">
            <div class="flex items-center gap-2 w-full">
              <span class="text-gray-500 italic">Aucun</span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            v-for="option in props.options" 
            :key="option.id"
            @click="modelValue = option.name"
          >
            <div class="flex items-center gap-2 w-full">
              <Icon
                v-if="option.image"
                :style="{ color: option.color || '' }"
                :name="option.image"
                :size="16"
              ></Icon>
              <span>{{ option.name }}</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
</template>
