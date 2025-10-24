<script setup>
import { computed } from 'vue'
import { useFetch } from '@/composables/useFetch'
import { RouterLink } from 'vue-router'

const { data, loading, error } = useFetch('http://localhost:4000/api/categories', { initial: [] })
const categories = computed(() => Array.isArray(data?.value) ? data.value : [])
</script>

<template>
  <nav class="w-full bg-[#64758B] text-white shadow-inner">
    <div class="mx-auto max-w-6xl px-4 py-4">
      <p v-if="loading" class="font-poppins">Loading…</p>
      <p v-else-if="error" class="font-poppins">{{ error }}</p>

      <ul v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <li v-for="c in categories" :key="c.slug" class="font-poppins rounded-md">
          <RouterLink :to="`/category/${c.slug}`" v-slot="{ isActive }">
            <span
              class="block px-4 py-3 text-center rounded-md transition h-14 flex items-center justify-center"
              :class="isActive ? 'bg-white/30 font-semibold' : 'bg-white/10 hover:bg-white/20 h-14 items-center flex justify-center'"
            >
              {{ c.title }}
            </span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </nav>
</template>
