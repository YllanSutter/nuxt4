<script setup lang="ts">
  import { exportDatabase, exportGamesCSV } from '~/utils/export';

  
const userCookie = useCookie('user');
const user = computed(() => userCookie.value);
  
  const forceRefresh = () => {
    window.location.reload()
  }
</script>

<template>

    <header class="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mb-4">
      <div class=" flex gap-2 h-14 items-center px-4">
        <ColorModeToggle />
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline"> <Icon name="lucide:settings-2" /></Button>
          </PopoverTrigger>
          <PopoverContent class="w-[500px] flex gap-2">
              <Button 
                @click="exportDatabase()" 
                variant="outline" 
                size="sm"
                class="flex items-center gap-2"
              >
                <Icon name="lucide:circle-arrow-out-down-right" :size="16"></Icon>
                Export BDD
              </Button>
              <Button 
                @click="exportGamesCSV()" 
                variant="outline" 
                size="sm"
                class="flex items-center gap-2"
              >
                <Icon name="lucide:file-chart-pie" :size="16"></Icon>
                Export CSV
              </Button>
              <Button 
                @click="forceRefresh()" 
                variant="outline" 
                size="sm"
                class="flex items-center gap-2"
              >
                <Icon name="lucide:history" :size="16"></Icon>
                Actualiser
              </Button>
          </PopoverContent>
        </Popover>
         <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline"> <Icon name="lucide:eye" /></Button>
          </PopoverTrigger>
          <PopoverContent class="w-[500px] flex gap-2">
            {{ user }}
             <!-- {{ user?.map((ug:any) => ug.id).join(', ') }} -->
          </PopoverContent>
        </Popover>
         
      </div>
    </header>
</template>