import { DropdownMenu, TableauRadioGroup } from '../../../.nuxt/components';
<script setup lang="ts">
  const { 
    data: allOptions, 
    pending,
    error,
    refresh,
  } = await useFetch<any>('/api/getAllOptions', {
    key: 'allOptions',
    server: true,
    default: () => ({})
  })

  const roles = computed(() => allOptions.value?.role || [])
  const months = computed(() => allOptions.value?.month || [])
  const years = computed(() => allOptions.value?.year || [])
  const labels = computed(() => allOptions.value?.label || [])
  const emplacements = computed(() => allOptions.value?.emplacement || [])
  const mainLabels = computed(() => {
    const mainEmplacement = emplacements.value.find((emp: any) => emp.name === 'main')
    if (!mainEmplacement) return []
    return labels.value.filter((label: any) => label.emplacement_id === mainEmplacement.id)
  })
  const tags = computed(() => allOptions.value?.tag || [])
  const platforms = computed(() => allOptions.value?.platform || [])
  const bundles = computed(() => allOptions.value?.bundle || [])
  const bundleGames = computed(() => allOptions.value?.bundleGame || [])
  const userGames = computed(() => allOptions.value?.userGame || [])
  const baseGames = computed(() => allOptions.value?.baseGame || [])
  const userLabelVisibilities = computed(() => allOptions.value?.userLabelVisibility || [])
  const states = computed(() => allOptions.value?.state || [])
  const priceHistories = computed(() => allOptions.value?.priceHistory || [])
  const gameStats = computed(() => allOptions.value?.gameStat || [])
  const users = computed(() => allOptions.value?.user || [])

  const getUserGameValue = (userGame: any, labelKey: string) => {
    let value = userGame[labelKey];
    
    if(labelKey == 'tagId')
    {
      value = userGame['tag'] ? userGame['tag'].name : '';
    }

    if(labelKey == 'order')
    {
      value = userGame['order_in_list'];
    }
    if (value === null || value === undefined) {
      return ''
    }
  
    
    return value.toString()
  }

  const getOptionsForLabel = (labelKey: string) => {
    switch(labelKey) {
      case 'tagId':
        return tags.value
      case 'monthId':
        return months.value
      case 'yearId':
        return years.value
      case 'plateformeId':
        return platforms.value
      case 'bundleId':
        return bundles.value
      default:
        return []
    }
  }
</script>

<template>
  <div v-if="pending" class="p-4">
    Chargement des utilisateurs...
  </div>
  
  <div v-else-if="error" class="p-4 text-red-500">
    Erreur lors du chargement : {{ error }}
    <button @click="refresh()" class="ml-2 px-3 py-1 bg-blue-500 text-white rounded">
      Réessayer
    </button>
  </div>
  
  <div v-else-if="!userGames.length || !mainLabels.length" class="p-4">
    Chargement des données du tableau...
  </div>
  
  <div v-else>
    <Table :key="`table-${userGames.length}-${mainLabels.length}`">
      <TableHeader>
        <TableRow>
          <TableHead v-for="label in mainLabels" :key="label.id">{{ label.name }}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="userGame in userGames" :key="userGame.id">
          <TableCell 
            v-for="label in mainLabels" 
            :key="label.id" 
            class="font-medium"
          >
           
            <div class="flex items-center gap-1">                
                <TableauRadioGroup 
                  v-if="label.type == 'select'"
                  :model-value="getUserGameValue(userGame, label.key)"
                  :label="label.name"
                  :options="getOptionsForLabel(label.key)"
                  @update:model-value="(newValue) => userGame[label.key] = newValue"
                />
                <Input 
                  v-else
                  :model-value="getUserGameValue(userGame, label.key)"
                  :label="label.key"
                  @update:model-value="(newValue) => userGame[label.key] = newValue"
                >
                </Input>
              <TableauSuffix v-if="label.type !== 'select'" :label="label"></TableauSuffix>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>