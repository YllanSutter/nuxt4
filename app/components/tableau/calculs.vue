<script setup lang="ts">

const props= defineProps<{
    labels:any;
    activeBundle:any;
    userGamesBundle:any;
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

</script>

<template>
    <TableCell v-for="(label, index) in labels" :key="index" class="text-right">
        <div v-if="label.key !== 'delete' && label.key !== 'order_in_list' && label.key !== 'tag_id'">
            {{ elems[index]?.elems[0] }}
            <UiTableauSuffix :label=label :emplacement="'footer'"/>
        </div>
    </TableCell>
</template>