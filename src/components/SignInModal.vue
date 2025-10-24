<template>
  <div
    v-if="open"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-xl shadow-xl p-6 w-96 relative">
      <h2 class="text-xl font-semibold mb-4 text-gray-900">Log ind</h2>

      <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
        <div>
          <label for="email" class="block text-sm mb-1">Email</label>
          <input id="email" v-model="email" type="email" required
                 class="w-full border rounded p-2 focus:outline-none focus:ring" />
        </div>

        <div>
          <label for="password" class="block text-sm mb-1">Adgangskode</label>
          <input id="password" v-model="password" type="password" required
                 class="w-full border rounded p-2 focus:outline-none focus:ring" />
        </div>

        <div class="flex justify-between mt-2">
          <button type="button" @click="$emit('close')"
                  class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
            Opret Profil
          </button>
          <button type="submit"
                  class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
            Log ind
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close', 'submit'])

const email = ref('')
const password = ref('')

function onSubmit() {
  // send credentials up; parent decides what to do
  emit('submit', { email: email.value, password: password.value })
}

function onKey(e) {
  if (e.key === 'Escape' && props.open) emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>
