<script setup lang="ts">
  import { exportDatabase, exportGamesCSV } from '~/utils/export';
  const { 
  userLabelVisibility,
} = useTableauData(['userLabelVisibility']);

interface UserLabelVisibilityItem {
  id: string;
  label_id: string;
  visible: boolean;
}

const props = defineProps<{
  mainLabels: any[]
}>()

const userLabelVisibilityRef = ref<UserLabelVisibilityItem[]>([]);
watch(
  () => userLabelVisibility.value,
  (newVal) => {
    userLabelVisibilityRef.value = Array.isArray(newVal) ? [...newVal] : [];
  },
  { immediate: true, deep: true }
);
  
interface User {
  role_id?: string;
}

const userCookie = useCookie<User | null>('user');
const user = computed(() => userCookie.value);
  
const forceRefresh = () => {
  window.location.reload()
}
const UserLabelVisibilityCheck = async (item:any) => 
{
   await $fetch('/api/updateUserLabelVisibility', {
    method: 'POST',
    body: { id: item.id, visible: item.visible }
  });
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
                Refresh
              </Button>
          </PopoverContent>
        </Popover>
         <Popover v-if="user && typeof user === 'object' && user.role_id === 'admin-role-id'">
          <PopoverTrigger as-child>
            <Button variant="outline"> <Icon name="lucide:eye" /></Button>
          </PopoverTrigger>
          <PopoverContent class="w-[400px] grid gap-x-10 gap-y-2 grid-cols-2">
            <Button 
              @click="forceRefresh()" 
              variant="outline" 
              size="sm"
              class="flex items-center gap-2"
            >
              <Icon name="lucide:history" :size="16"></Icon>
              Refresh
            </Button>
            <div class="vide"></div>
              <label @click="UserLabelVisibilityCheck(item)" v-for="(item, index) in userLabelVisibilityRef" :key="index" :for="item.id" class="flex gap-2 items-center justify-between">
                {{ mainLabels.find((label: any) => label.id === item.label_id)?.name }}
                <Checkbox v-model="item.visible" :id="item.id"/>
              </label>
          </PopoverContent>
        </Popover>
      </div>
         
      <Account v-if="user" />
    </header>
</template>