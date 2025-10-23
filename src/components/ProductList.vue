<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useFetch } from '@/composables/useFetch'

const route = useRoute()
const slug = computed(() => route.params.slug || null)

const endpoint = computed(() =>
  slug.value
    ? `http://localhost:4000/api/products/${slug.value}`
    : 'http://localhost:4000/api/products/vand-og-vandrensning'
)

const { data, loading, error } = useFetch(() => endpoint.value, { initial: [] })
const products = computed(() => Array.isArray(data?.value) ? data.value : [])

const BASE = 'http://localhost:4000'
const imgSrc = (p) => {
  const url = p.imageUrl ?? p.image
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${BASE.replace(/\/$/, '')}/${String(url).replace(/^\//, '')}`
}
const fmtPrice = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? `${n.toLocaleString('da-DK')},00` : v
}
</script>

<template>
  <section class="py-6">
    <p v-if="loading">Loading...</p>
    <p v-else-if="error">{{ error }}</p>

    <ul v-else class="flex flex-col items-center gap-8 p-4">
      <li
        v-for="p in products"
        :key="p.slug ?? p.id"
        class="font-poppins border rounded-md p-6 bg-gray-600 text-white w-80 flex flex-col items-center gap-2"
      >
        <img :src="imgSrc(p)" :alt="`Image of ${p.name}`" class="w-32 h-32 object-contain bg-white/5 rounded" />
        <strong class="text-lg">{{ p.name }}</strong>
        <span class="opacity-90">{{ fmtPrice(p.price) }} kr</span>
      </li>
    </ul>
  </section>
</template>
