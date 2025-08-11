<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'
import draggable from 'vuedraggable'

const props = defineProps<{
  class?: HTMLAttributes['class'],
  games: any[],
}>()

const emit = defineEmits(['orderChanged'])
const onDragEnd = async (event:any,gamesDrag:any) =>{
    for(let i = 0 ; i < gamesDrag.length;i++) {
        gamesDrag[i].order_in_list = i;
    }
    emit('orderChanged', gamesDrag)
}
</script>

<template>
  <draggable
    tag="tbody"
    :list="props.games"
    handle=".row-handle"
    item-key="id"
    :class="cn('[&_tr:last-child]:border-0', props.class)"
    @end="($event:any) => onDragEnd($event, props.games)"
  >
    <template #item="{ element, index }">
  <tr>
    <td class="row-handle">
      <Icon name="solar:sort-vertical-line-duotone" />
    </td>
    <slot :userGame="element" :index="index" />
  </tr>
</template>
  </draggable>
</template>
