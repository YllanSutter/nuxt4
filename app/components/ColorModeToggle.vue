<template>
  <Button
    variant="outline"
    size="icon"
    @click="toggleColorMode"
    class="h-9 w-9"
  >
    <Sun 
      v-if="colorMode.preference === 'dark'"
      class="h-4 w-4" 
    />
    <Moon 
      v-else-if="colorMode.preference === 'light'"
      class="h-4 w-4" 
    />
    <span class="sr-only">Basculer le mode couleur</span>
  </Button>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'

const colorMode = useColorMode()

const toggleColorMode = () => {
  if (colorMode.preference === 'light') {
    colorMode.preference = 'dark'
  } else {
    colorMode.preference = 'light'
  }
}
</script>
