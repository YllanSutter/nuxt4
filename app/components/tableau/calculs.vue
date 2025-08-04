<script setup lang="ts">

const props= defineProps<{
    labels:any;
    activeBundle:any;
    userGamesBundle:any;
    listClass:string;
}>();

const elems = computed(() => {
  if (!props.labels || !props.userGamesBundle) {
    return [];
  }

  const result = props.labels.map((label: any) => ({
    label: label.name,
    elems: [0]
  }));

  for (let i = 0; i < props.userGamesBundle.length; i++) {
    for (let j = 0; j < props.labels.length; j++) {
      const key = props.labels[j].key;
      const value = props.userGamesBundle[i][key];
      if (typeof value === 'number') {
        result[j].elems[0] += value;
      } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
        result[j].elems[0] += parseFloat(value);
      }
       else if (key == "name") {
        result[j].elems[0] += 1;
      }
      else {
        if(i == 0) { result[j].elems[0] = value;}
        else{result[j].elems[0] += value;}
      }
    }
  }

  const ratingIndex = props.labels.findIndex((label: any) => label.key === "rating");
  if (ratingIndex !== -1 && props.userGamesBundle.length > 0) {
    result[ratingIndex].elems[0] = Math.round((result[ratingIndex].elems[0] / props.userGamesBundle.length) * 100) / 100;
  }


  result.forEach((item: any) => {
    if (typeof item.elems[0] === 'number') {
      item.elems[0] = Math.round(item.elems[0] * 100) / 100;
    }
  });

  return result;
});

// Calculs des ratios
const ratios = computed(() => {
  if (!props.labels || !props.userGamesBundle) {
    return [];
  }

  const result = props.labels.map((label: any) => ({
    label: label.name,
    elems: [0]
  }));

  // Récupérer les totaux directement depuis elems
  const getTotalByKey = (key: string) => {
    const index = props.labels.findIndex((l: any) => l.key === key);
    return index !== -1 ? elems.value[index]?.elems[0] || 0 : 0;
  };

  const totalPrice = getTotalByKey('price');
  const totalInitialPrice = getTotalByKey('initial_price');
  const totalPlaytimeHours = getTotalByKey('playtime_hours');
  const totalNumberGames = getTotalByKey('name');

  for (let j = 0; j < props.labels.length; j++) {
    const key = props.labels[j].key;
    
    const excludedFields = ['name', 'delete', 'order_in_list', 'tag_id', 'rating'];
    if (excludedFields.includes(key)) {
      result[j].elems[0] = null;
      continue;
    }
    
    if (key === 'playtime_hours') {
      if (totalPlaytimeHours > 0) {
        result[j].elems[0] = Math.round((totalPrice / totalPlaytimeHours) * 100) / 100;
      } else {
        result[j].elems[0] = 'Aucune heure';
      }
      continue;
    }

       if (key === 'price') {
      if (totalNumberGames > 0) {
        result[j].elems[0] = Math.round((totalPrice / totalNumberGames) * 100) / 100;
      } else {
        result[j].elems[0] = 'Aucun jeu';
      }
      continue;
    }
    
    const priceFields = ['price', 'black_market_price', 'sale_price', 'initial_price'];
    if (priceFields.includes(key)) {
      const currentTotal = getTotalByKey(key);
      
      if (totalInitialPrice > 0) {
        result[j].elems[0] = Math.round((currentTotal / totalPrice) * 100) / 100;
      } else if (currentTotal > 0 && totalPrice > 0 && key !== 'price') {
        result[j].elems[0] = Math.round((currentTotal / totalPrice) * 100) / 100;
      } else if (key === 'initial_price') {
        result[j].elems[0] = 'N/A';
      } else {
        result[j].elems[0] = null;
      }
    } else {
      // Autres champs
      result[j].elems[0] = null;
    }
  }

  // console.log('Ratios calculés:', result);

  return result;
});

</script>

<template>
    
    <TableRow :class="props.listClass">
        <TableCell v-for="(label, index) in labels" :key="index" class="text-right">
            <div v-if="label.key !== 'delete' && label.key !== 'order_in_list' && label.key !== 'tag_id'"  >
                {{ elems[index]?.elems[0] }}
                <UiTableauSuffix :label=label :emplacement="'footer'"/>
            </div>
        </TableCell>
   </TableRow> 
   <TableRow :class="props.listClass">
        <TableCell v-for="(label, index) in labels" :key="index" class="text-right " >
            <div v-if="ratios[index]?.elems[0] !== null" class=" border-t pt-2 -mt-2 border-[#ffffff20]">
                <span class="text-sm text-muted-foreground">
                  <template v-if="label.key === 'playtime_hours' && typeof ratios[index]?.elems[0] === 'number'">
                    {{ ratios[index]?.elems[0] }}€/<UiTableauSuffix :label=label></UiTableauSuffix>
                  </template>
                   <template v-else-if="label.key === 'price' && typeof ratios[index]?.elems[0] === 'number'">
                    {{ ratios[index]?.elems[0] }}<UiTableauSuffix :label=label></UiTableauSuffix>/jeu
                  </template>
                  <template v-else-if="typeof ratios[index]?.elems[0] === 'number'">
                    x{{ ratios[index]?.elems[0] }}<UiTableauSuffix :label=label></UiTableauSuffix>
                  </template>
                  <template v-else>
                    {{ ratios[index]?.elems[0] }}
                  </template>
                </span>
            </div>
        </TableCell>
    </TableRow>
</template>