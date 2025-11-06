<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})
const emit = defineEmits(['close', 'submit'])

const email = ref('')
const password = ref('')

function onSubmit(e) {
  e?.preventDefault?.()
  emit('submit', {
    email: email.value.trim(),
    password: password.value,
  })
}

function onOverlay(e) {
  if (e.target === e.currentTarget) emit('close')
}
function onEsc(e) {
  if (e.key === 'Escape') emit('close')
}
watch(() => props.open, (v) => {
  if (v) {
  }
})
onMounted(() => window.addEventListener('keydown', onEsc))
onBeforeUnmount(() => window.removeEventListener('keydown', onEsc))
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center" @click="onOverlay">
    <div class="absolute inset-0 bg-black/40" />
    <div class="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
      <h2 class="text-xl font-semibold mb-4">Log ind</h2>

      <form @submit="onSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Adgangskode</label>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
            placeholder="••••••••"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <div class="flex gap-2 justify-end pt-2">
          <button type="button" class="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200" @click="$emit('close')">
            Annullér
          </button>
          <button
            type="submit"
            class="px-4 py-2 rounded-lg bg-[#334156] text-white hover:opacity-90 disabled:opacity-60"
            :disabled="loading"
          >
            {{ loading ? 'Logger ind…' : 'Log ind' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
