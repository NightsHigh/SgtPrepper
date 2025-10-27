<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useFetch } from '@/composables/useFetch'

const route = useRoute()
const slug = computed(() => route.params.slug || null)

const endpoint = computed(() =>
  slug.value
    ? `http://localhost:4000/api/products/${slug.value}`
    : 'http://localhost:4000/api/products/Mad-og-langtidsopbevaring'
)

const { data: productData, loading, error } = useFetch(() => endpoint.value, { initial: [] })
const products = computed(() =>
  Array.isArray(productData.value) ? productData.value : [productData.value]
)


const { data: reviewsData, loading: reviewsLoading, error: reviewsError } = useFetch(
  'http://localhost:4000/api/reviews',
  { initial: [] }
)

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

const stock = (p) => (p.stock > 0 ? 'På lager' : 'Udsolgt')
</script>

<template>
  <article class="py-6">
    <h4 class="text-xl font-semibold mb-4 text-white">Seneste nyt</h4>

    <p v-if="loading || reviewsLoading" class="text-gray-300">Indlæser…</p>
    <p v-else-if="error || reviewsError" class="text-red-400">Der opstod en fejl.</p>

    <ul
      v-else
      class="flex flex-col items-center gap-8 p-4"
    >
      <li
        v-for="p in products"
        :key="p.slug ?? p.id"
        class="font-poppins border rounded-md p-6 bg-gray-600 text-white w-6/8 flex flex-col gap-2 hover:bg-gray-700 transition"
      >
        <RouterLink
          class="flex items-center gap-2 w-full"
          :to="{ name: 'product', params: { category: slug || 'Mad-og-langtidsopbevaring', slug: p.slug } }"
        >
          <img
            :src="imgSrc(p)"
            :alt="`Image of ${p.name}`"
            class="w-40 h-32 object-contain bg-white/5 rounded"
          />
          <div class="flex flex-col gap-1">
            <strong class="text-lg">{{ p.name }}</strong>
            <p class="opacity-90">{{ p.teaser }}</p>
          </div>
          <div class="ml-auto flex flex-col items-end gap-2">
            <span :class="p.stock > 0 ? 'text-green-400' : 'text-red-400'">{{ stock(p) }}</span>
            <span class="opacity-90">{{ fmtPrice(p.price) }} kr</span>
          </div>
        </RouterLink>
      </li>
    </ul>
  </article>
</template>
