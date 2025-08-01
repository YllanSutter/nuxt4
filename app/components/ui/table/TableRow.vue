<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <tr
    data-slot="table-row"
    :class="cn(
      'hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors',
      'border-[#00000040] dark:border-[#ffffff20]',
      props.class
    )"
  >
    <slot />
  </tr>
</template>
