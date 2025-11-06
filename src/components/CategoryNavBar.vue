<script setup>
import { computed } from 'vue'
import { useFetch } from '@/composables/useFetch'

const emit = defineEmits(['select-category'])
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
const { data, loading, error } = useFetch(`${API_BASE_URL}/categories`, { initial: [] })

const categories = computed(() => Array.isArray(data.value) ? data.value : [])

function selectCategory(slug) {
  emit('select-category', slug)
}
</script>

<template>
  <nav class="w-full bg-[#64758B] text-white shadow-inner">
    <div class="mx-auto max-w-6xl px-4 py-4">
      <p v-if="loading">Loading…</p>
      <p v-else-if="error">{{ error }}</p>

      <ul v-else class="flex flex-wrap gap-3">
        <li
          v-for="c in categories"
          :key="c.slug || c.id"
          class="cursor-pointer hover:text-yellow-300"
          @click="selectCategory(c.slug ?? c.id)"
        >
          {{ c.title || c.name }}
        </li>
      </ul>
    </div>
  </nav>
</template>
