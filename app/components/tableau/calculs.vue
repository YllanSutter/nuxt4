<script setup lang="ts">
import { useTableauFilters } from '@/utils/useTableauFilters'

const props= defineProps<{
    labels:any;
    activeBundle:any;
    userGamesBundle:any;
    listClass:string;
    emplacement?:string
}>();

const { 
  optionsMonths,
  optionsYears,
} = useTableauData(['month', 'year'])

const { filters } = useTableauFilters()
const selectedMonth = computed(() => filters.value.month_id ?? '')

const priceKeys = ['price', 'black_market_price', 'sale_price', 'initial_price']
const isGiftGame = (game: any) => {
  const tagName = (game?.tag?.name ?? game?.tag)?.toString().toLowerCase()
  const tagId = (game?.tag_id ?? game?.tagId)?.toString().toLowerCase()
  return tagName === 'gift' || tagId === 'gift'
}

const elems = computed(() => {
  if (!props.labels || !props.userGamesBundle) {
    return [];
  }

  const result = props.labels.map((label: any) => ({
    label: label.name,
    elems: [0]
  }));

  for (let i = 0; i < props.userGamesBundle.length; i++) {
    const currentGame = props.userGamesBundle[i];
    const isGift = isGiftGame(currentGame);

    for (let j = 0; j < props.labels.length; j++) {
      const key = props.labels[j].key;

      if (isGift && priceKeys.includes(key)) continue;
      // Sauter la ligne si tag_id === 'tag-3', sauf pour la clé 'price'
      if (currentGame.tag_id === 'tag-3' && key !== 'price') continue;
      let value = currentGame[key];

      // Gestion spéciale pour rating_id : récupérer la valeur numérique depuis la relation
      if (key === 'rating_id' && currentGame.rating_ref) {
        value = currentGame.rating_ref.value;
      }

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

  const ratingIndex = props.labels.findIndex((label: any) => label.key === "rating_id");
  if (ratingIndex !== -1 && props.userGamesBundle.length > 0) {
    const validRatings = props.userGamesBundle
      .map((game: any) => game.rating_ref?.value || 0)
      .filter((rating: number) => rating > 0);
    
    if (validRatings.length > 0) {
      const totalRating = validRatings.reduce((sum: number, rating: number) => sum + rating, 0);
      result[ratingIndex].elems[0] = (totalRating / validRatings.length).toFixed(2);
    } else {
      result[ratingIndex].elems[0] = "0.00";
    }
  }

  result.forEach((item: any, idx: number) => {
    if (props.labels[idx]?.key === "rating_id") return;
    if (typeof item.elems[0] === 'number') {
      item.elems[0] = item.elems[0].toFixed(2);
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
    
    const excludedFields = ['name', 'delete', 'order_in_list', 'tag_id', 'rating_id'];
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
        result[j].elems[0] = '...';
      } else {
        result[j].elems[0] = '...';
      }
    } else {
      // Autres champs
      result[j].elems[0] = null;
    }
  }


  return result;
});
interface User {
  budget?: number;
}
const userCookie = useCookie<User | null>('user');
const user = computed(() => userCookie.value);

const isAnnualBudget = computed(() => !selectedMonth.value || selectedMonth.value === 'Tout')

const getBudgetTarget = () => {
  const budget = user.value?.budget
  if (budget === undefined || budget === null) return null
  const numericBudget = Number(budget)
  if (Number.isNaN(numericBudget)) return null
  return isAnnualBudget.value ? numericBudget * 12 : numericBudget
}

const getBudgetIcon = (priceRaw: any) => {
  const target = getBudgetTarget()
  const price = Number(priceRaw)
  const effectivePrice = price
  if (target === null || Number.isNaN(effectivePrice)) return 'mingcute:check-fill'
  if (effectivePrice > target) return 'mingcute:close-fill'
  if (effectivePrice > target / 2) return 'mingcute:alert-fill'
  return 'mingcute:check-fill'
}

const getBudgetStyle = (priceRaw: any) => {
  const target = getBudgetTarget()
  const price = Number(priceRaw)
  const effectivePrice = price
  if (target === null || Number.isNaN(effectivePrice)) return 'color: green;'
  if (effectivePrice > target) return 'color: red;'
  if (effectivePrice > target / 2) return 'color: orange;'
  return 'color: green;'
}

const getBudgetOverrun = (priceRaw: any) => {
  const target = getBudgetTarget()
  const price = Number(priceRaw)
  const effectivePrice = price
  if (target === null || Number.isNaN(effectivePrice)) return null
  const diff = effectivePrice - target
  if (diff === 0) return 'Budget exact'
  const formatted = Math.abs(diff).toFixed(2)
  const suffix = isAnnualBudget.value ? ' (annuel)' : ' (mensuel)'
  if (diff > 0) return `Dépasse de ${formatted}€${suffix}`
  return `Reste ${formatted}€${suffix}`
}

const getBudgetTooltip = (priceRaw: any) => {
  const message = getBudgetOverrun(priceRaw)
  if (!message) return null
  const target = getBudgetTarget()
  const label = isAnnualBudget.value ? '| Budget annuel' : '| Budget mensuel'
  const targetText = target !== null ? target.toFixed(2) : 'N/A'
  return `${message}\n${label}: ${targetText}€`
}
</script>

<template>
    
    <TableRow :class="props.listClass">
        <td v-if="emplacement === 'footer'"></td>
        <TableCell v-for="(label, index) in labels" :key="index" class="text-right">
            <div v-if="label.key !== 'delete' && label.key !== 'order_in_list' && label.key !== 'tag_id'">
              <ClientOnly>
                <template v-if="label.key === 'rating_id'">
                  {{ elems[index]?.elems[0] }}
                  <UiTableauSuffix :label=label :emplacement="'footer'"/>
                </template>
                <template v-else-if="label.key === 'name'">
                  {{ Math.trunc(elems[index]?.elems[0]) }}
                  <UiTableauSuffix :label=label :emplacement="'footer'"/>
                </template>
                <template v-else-if="label.key === 'price'">
                  {{ elems[index]?.elems[0] }}
                  <span class="relative inline-flex group align-middle">
                    <Icon
                      class="text-xs relative -top-[5px] left-[10px] -mr-3  text-white transition-all duration-400 group-hover:rotate-3"
                      :name="getBudgetIcon(elems[index]?.elems[0])"
                      :style="getBudgetStyle(elems[index]?.elems[0])"
                    />
                    <span
                      v-if="getBudgetTooltip(elems[index]?.elems[0])"
                      class="flex pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2  bg-background border border-[#ffffff20] p-4 text-[11px] text-slate-200 shadow transition-opacity duration-150 opacity-0 group-hover:opacity-100"
                    >
                      {{ getBudgetTooltip(elems[index]?.elems[0]) }}
                    </span>
                  </span>
                  <UiTableauSuffix :label=label :emplacement="'footer'"/>
                </template>
                <template v-else>
                  {{ elems[index]?.elems[0] }}
                  <UiTableauSuffix :label=label :emplacement="'footer'"/>
                </template>
                </ClientOnly>
            </div>
        </TableCell>
   </TableRow>
   <TableRow :class="props.listClass">
    
        <td v-if="emplacement === 'footer'"></td>
        <TableCell v-for="(label, index) in labels" :key="index" class="text-right " >
            <div v-if="ratios[index]?.elems[0] !== null" class=" border-t pt-2 -mt-2 border-[#ffffff20]">
                <span class="text-sm text-muted-foreground">
                  <ClientOnly>
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
                  </ClientOnly>
                </span>
            </div>
        </TableCell>
    </TableRow>
</template>