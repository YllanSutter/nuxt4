<script setup lang="ts">
import { Input } from '~/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'

type GameOption = { id: string; name: string }

const props = defineProps<{
  modelValue?: string
  baseGameId?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'commit', value: string): void
  (e: 'select', option: GameOption): void
}>()

const internalValue = ref(props.modelValue || '')
const open = ref(false)
const loading = ref(false)
const options = ref<GameOption[]>([])
const allGames = ref<{ id: string; name: string; lower: string }[]>([])
const hasFocus = ref(false)

watch(
  () => props.modelValue,
  (value) => {
    internalValue.value = value || ''
  }
)

const normalizeGame = (item: any) => {
  const name = item?.name || item?.title || item?.gameName || item?.game || ''
  const rawId = item?.id ?? item?.appid ?? item?.appId ?? item?.game_id ?? item?.gameId
  if (!name || rawId === undefined || rawId === null) return null
  return {
    id: String(rawId),
    name,
    lower: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }
}

const loadSteamList = async () => {
  if (allGames.value.length || loading.value) return
  if (typeof window === 'undefined') return
  loading.value = true
  try {
    const mod = await import('~/lib/steamList.json')
    const raw = mod?.default
    const rawList = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as any)?.apps)
        ? (raw as any).apps
        : Array.isArray((raw as any)?.applist?.apps)
          ? (raw as any).applist.apps
          : []
    const normalized = (rawList as any[])
      .map((item: any) => normalizeGame(item))
      .filter((item: any) => Boolean(item)) as { id: string; name: string; lower: string }[]
    allGames.value = normalized
  } catch (error) {
    console.error('❌ Impossible de charger steamList.json', error)
  } finally {
    loading.value = false
  }
}

const updateOptions = async (query: string) => {
  if (!query || query.trim().length < 1) {
    options.value = []
    open.value = hasFocus.value
    return
  }

  await loadSteamList()
  const lowerQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  options.value = allGames.value
    .filter((game) => game.lower.includes(lowerQuery))
    .slice(0, 10)
    .map(({ id, name }) => ({ id, name }))
  open.value = hasFocus.value
}

watch(
  internalValue,
  (value) => {
    emit('update:modelValue', value)
    updateOptions(value)
  }
)

const handleSelect = (option: GameOption) => {
  internalValue.value = option.name
  emit('update:modelValue', option.name)
  emit('select', option)
  emit('commit', option.name)
  open.value = false
}

const handleCommit = () => {
  emit('commit', internalValue.value)
  open.value = false
}

const handleFocus = () => {
  hasFocus.value = true
  open.value = true
  updateOptions(internalValue.value)
}

const handleBlur = () => {
  setTimeout(() => {
    hasFocus.value = false
  }, 120)
  emit('commit', internalValue.value)
}

const handleOpenChange = (next: boolean) => {
  if (next) {
    open.value = true
    return
  }
  // Ne pas fermer tant que l'input est focus
  open.value = hasFocus.value ? true : false
}
</script>

<template>
  <Popover v-model:open="open" @update:open="handleOpenChange">
    <PopoverTrigger as-child>
      <div class="w-full">
        <Input
          v-model="internalValue"
          type="text"
          label="name"
          :placeholder="placeholder || 'Rechercher un jeu'"
          class="w-full text-left"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown.enter.prevent="handleCommit"
        />
      </div>
    </PopoverTrigger>
    <PopoverContent class="p-0 w-[320px]">
      <div v-if="loading" class="p-3 text-xs text-muted-foreground">Chargement...</div>
      <div v-else class="max-h-60 overflow-auto">
        <button
          v-for="option in options"
          :key="option.id"
          type="button"
          class="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
          @click="handleSelect(option)"
        >
          <span class="font-medium leading-tight">{{ option.name }}</span>
          <span class="ml-auto text-[11px] text-muted-foreground">ID {{ option.id }}</span>
        </button>
        <div v-if="!options.length && internalValue" class="p-3 text-xs text-muted-foreground">
          <span v-if="allGames.length === 0">Liste vide : placez steamList.json dans app/lib/steamList.json</span>
          <span v-else>Aucun résultat</span>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
