<script setup lang="ts">
  import { exportDatabase, exportGamesCSV } from '~/utils/export';

  
interface User {
  role_id?: string;
}

const userCookie = useCookie<User | null>('user');
const user = computed(() => userCookie.value);
  
  const forceRefresh = () => {
    window.location.reload()
  }
</script>

<template>

    <header class=" px-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mb-4 z-[1] relative flex justify-between items-center">
      <div class=" flex gap-2 h-14 items-center">
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
         <Popover v-if="user && typeof user === 'object' && user.role_id === 'admin-role-id'">
          <PopoverTrigger as-child>
            <Button variant="outline"> <Icon name="lucide:eye" /></Button>
          </PopoverTrigger>
          <PopoverContent class="w-[500px] flex gap-2">
            {{ user }}
          </PopoverContent>
        </Popover>
      </div>
         
      <Account v-if="user" />
    </header>
</template>