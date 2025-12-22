<script setup lang="ts">
import { getPendingModifications, hasPendingModifications } from '@/utils/updateValue'

const refreshInterval = ref<NodeJS.Timeout | null>(null)
const isOpen = ref(false)
const forceUpdateKey = ref(0)

const hasPendingMods = computed(() => {
  forceUpdateKey.value // force dependency tracking
  return hasPendingModifications()
})

const modifications = computed(() => {
  forceUpdateKey.value // force dependency tracking
  return getPendingModifications()
})

const pendingCount = computed(() => {
  const mods = modifications.value
  return {
    total: mods.length,
    pending: mods.filter(m => m.status === 'pending').length,
    sending: mods.filter(m => m.status === 'sending').length,
    sent: mods.filter(m => m.status === 'sent').length,
    failed: mods.filter(m => m.status === 'failed').length
  }
})

const statusColor = (status: string) => {
  switch(status) {
    case 'pending': return 'bg-yellow-500/20 text-yellow-300'
    case 'sending': return 'bg-blue-500/20 text-blue-300'
    case 'sent': return 'bg-green-500/20 text-green-300'
    case 'failed': return 'bg-red-500/20 text-red-300'
    default: return 'bg-gray-500/20 text-gray-300'
  }
}

const statusEmoji = (status: string) => {
  switch(status) {
    case 'pending': return '⏳'
    case 'sending': return '🚚'
    case 'sent': return '✅'
    case 'failed': return '❌'
    default: return '❓'
  }
}

onMounted(() => {
  refreshInterval.value = setInterval(() => {
    forceUpdateKey.value++
  }, 1000)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<template>
  <div v-if="hasPendingMods" class="fixed bottom-4 right-4 z-[999]">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/20 border border-orange-500/50 text-orange-300 hover:bg-orange-500/30 transition-all"
    >
      <span v-if="pendingCount.failed > 0" class="text-red-400 font-bold">⚠️ {{ pendingCount.failed }} échouée(s)</span>
      <span v-else-if="pendingCount.sending > 0" class="text-blue-400 animate-pulse">🚚 {{ pendingCount.sending }} en cours</span>
      <span v-else class="text-yellow-400">⏳ {{ pendingCount.pending }} en attente</span>
      <span :class="isOpen ? 'rotate-180' : ''" class="transition-transform">▼</span>
    </button>

    <Transition>
      <div
        v-if="isOpen"
        class="absolute bottom-16 right-0 w-96 max-h-96 overflow-y-auto rounded-lg bg-slate-950 border border-slate-700 p-4 shadow-xl"
      >
        <div class="space-y-2">
          <div class="text-xs font-semibold text-slate-300 mb-4">
            <div>Total: {{ pendingCount.total }}</div>
            <div class="grid grid-cols-4 gap-2 mt-2">
              <div class="text-yellow-300">⏳ {{ pendingCount.pending }}</div>
              <div class="text-blue-300">🚚 {{ pendingCount.sending }}</div>
              <div class="text-green-300">✅ {{ pendingCount.sent }}</div>
              <div class="text-red-300">❌ {{ pendingCount.failed }}</div>
            </div>
          </div>

          <div v-for="mod in modifications" :key="`${mod.elemId}:${mod.label.field}`" class="text-xs p-2 rounded bg-slate-900 border border-slate-700">
            <div class="flex items-start gap-2">
              <span :class="statusColor(mod.status)" class="px-2 py-1 rounded text-center flex-shrink-0 min-w-fit">
                {{ statusEmoji(mod.status) }}
              </span>
              <div class="flex-1 min-w-0">
                <div class="font-mono text-slate-400 truncate">
                  {{ mod.elemId.slice(0, 8) }}...
                </div>
                <div class="text-slate-300">
                  {{ mod.label.table }}.{{ mod.label.field }}
                </div>
                <div class="text-slate-500 truncate">
                  → {{ mod.value }}
                </div>
                <div v-if="mod.status === 'failed'" class="text-red-400 mt-1">
                  Retry: {{ mod.retryCount }}/3
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.v-enter-active, .v-leave-active {
  transition: all 0.2s ease;
}

.v-enter-from, .v-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
