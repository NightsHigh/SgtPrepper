<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getConsent, setConsent, initAnalytics } from '@/lib/analytics'
const visible = ref(false)

function acceptAll() {
  setConsent({ analytics: true, all: true })
  initAnalytics()
  visible.value = false
}

function onlyNecessary() {
  setConsent({ analytics: false, all: false })
  visible.value = false
}

function handleOpenSettings() {
  visible.value = true
}

onMounted(() => {
  const existing = getConsent()
  if (!existing) {
    visible.value = true
  } else if (existing.analytics === true || existing.all === true) {
    initAnalytics()
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('open-cookie-settings', handleOpenSettings)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('open-cookie-settings', handleOpenSettings)
  }
})

</script>

<template>
  <div v-if="visible" class="fixed inset-x-0 bottom-0 z-50">
    <div class="mx-auto max-w-7xl px-4 pb-4">
      <div class="rounded-2xl bg-slate-900 text-slate-100 px-6 py-4 shadow-lg">
        <p class="text-sm font-semibold">Cookies</p>
        <p class="mt-1 text-xs text-slate-300">
          Vi bruger cookies til at få anonym statistik og gøre oplevelsen bedre. Du kan vælge kun nødvendige eller
          acceptere alle cookies.
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            class="px-3 py-1.5 text-xs rounded-md bg-slate-100 text-slate-900"
            @click="onlyNecessary"
          >
            Kun nødvendige
          </button>
          <button
            type="button"
            class="px-3 py-1.5 text-xs rounded-md bg-emerald-500 text-white"
            @click="acceptAll"
          >
            Accepter alle cookies
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
