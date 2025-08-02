
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
</script>

<template>
 <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button :class="['w-full justify-start pt-1 ']" variant="outline" :style="{ borderBottom: `1px solid ${props.options?.find(opt => opt.name === modelValue)?.color || ''}` }">
          <Icon
            :style="{ color: props.options?.find((opt: any) => opt.name === modelValue)?.color || '' }"
            :name="props.options?.find((opt: any) => opt.name === modelValue)?.image || ''"
            :size="16"
          ></Icon>
          {{ modelValue || props.label || 'Sélectionner' }}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent class="w-56 max-h-96 overflow-y-auto" align="start">
        <DropdownMenuGroup>
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
