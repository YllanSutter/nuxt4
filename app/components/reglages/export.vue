<script setup lang="ts">
  import { exportDatabase, exportGamesCSV } from '~/utils/export'
  
  const forceRefresh = () => {
    window.location.reload()
  }
</script>

<template>

    <header class="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mb-4">
      <div class=" flex gap-2 h-14 items-center px-4">
        <ColorModeToggle />
         <Button 
          @click="exportDatabase()" 
          variant="outline" 
          size="sm"
          class="flex items-center gap-2"
        >
          <Icon name="mingcute:download-line" :size="16"></Icon>
          Export BDD
        </Button>
        <Button 
          @click="exportGamesCSV()" 
          variant="outline" 
          size="sm"
          class="flex items-center gap-2"
        >
          <Icon name="mingcute:file-line" :size="16"></Icon>
          Export CSV
        </Button>
        <Button 
          @click="forceRefresh()" 
          variant="outline" 
          size="sm"
          class="flex items-center gap-2"
        >
          <Icon name="ion:reload-outline" :size="16"></Icon>
          Actualiser
        </Button>
      </div>
    </header>
</template>