<script setup>
import { watch, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useFetch } from '@/composables/useFetch'

const props = defineProps({
  selectedCategoryId: { type: [Number, String], default: null },
  isLoggedIn: { type: Boolean, default: false },
  addToCart: { type: Function, default: () => {} },
  openLogin: { type: Function, default: null }, // open login modal
})

const API_PORT = import.meta.env.VITE_API_PORT || 4000
const API = `http://localhost:${API_PORT}/api`

function listUrl() {
  return props.selectedCategoryId
    ? `${API}/products/${encodeURIComponent(props.selectedCategoryId)}`
    : `${API}/products`
}

// Load products
const { data, loading, error, run } = useFetch(listUrl(), { initial: [], immediate: true })
watch(() => props.selectedCategoryId, () => run(listUrl()))

const products = computed(() => (Array.isArray(data.value) ? data.value : []))

function imgSrc(p) {
  const url = p?.imageUrl || p?.thumbnail || ''
  if (!url) return '/placeholder.png'
  if (/^https?:\/\//i.test(url)) return url
  return `http://localhost:${API_PORT}/${url.replace(/^\//, '')}`
}

function resolveLocalId(p) {
  // try common fields first
  const candidates = [p?.id, p?.productId, p?.product_id, p?.product?.id, p?.product?.productId, p?.variant?.productId]
  for (const c of candidates) {
    const n = Number(c)
    if (Number.isFinite(n) && n > 0) return n
  }
  return null
}

// Fallback: fetch by slug to get the product with a real numeric id
async function fetchIdBySlug(p) {
  const slug = p?.slug
  if (!slug) return null
  // Backend product controller resolves by slug only; category is ignored, so send selected or "all"
  const cat = props.selectedCategoryId ?? 'all'
  try {
    const res = await fetch(`${API}/products/${encodeURIComponent(cat)}/${encodeURIComponent(slug)}`)
    if (!res.ok) return null
    const full = await res.json()
    const n = Number(full?.id)
    return Number.isFinite(n) && n > 0 ? n : null
  } catch {
    return null
  }
}

async function handleAddToCart(p) {
  if (!props.isLoggedIn) {
    props.openLogin && props.openLogin()
    return
  }

  // 1) use any id that is already present
  let productId = resolveLocalId(p)

  // 2) fallback: fetch by slug to obtain id
  if (!productId) {
    productId = await fetchIdBySlug(p)
  }

  if (!productId) {
    console.error('Product shape without usable id:', p)
    alert('Kunne ikke finde produktets ID')
    return
  }

  try {
    await props.addToCart(productId, 1)
  } catch (err) {
    console.error('Add to cart failed:', err)
    alert('Kunne ikke tilføje produktet til kurven.')
  }
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-6">
    <p v-if="loading">Indlæser…</p>
    <p v-else-if="error" class="text-red-600">{{ error }}</p>

    <ul v-else class="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <li v-for="p in products" :key="p.slug ?? p.id ?? p.productId" class="group">
        <RouterLink
          :to="{ name: 'product', params: { slug: p.slug ?? String(p.id ?? p.productId ?? '') } }"
          class="block rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 hover:shadow-md hover:ring-slate-300 transition overflow-hidden"
        >
          <div class="bg-slate-100">
            <img
              :src="imgSrc(p)"
              :alt="p.name || p.title || 'Produkt'"
              class="h-44 w-full object-cover"
              loading="lazy"
            />
          </div>
          <div class="p-4">
            <p class="font-semibold truncate">{{ p.name || p.title }}</p>
            <p class="text-sm text-slate-600">{{ p.teaser || p.brand?.title || '' }}</p>
          </div>
        </RouterLink>

        <div class="p-4 pt-2">
          <button
            v-if="props.isLoggedIn"
            class="w-full rounded-lg bg-slate-800 text-white py-2 hover:opacity-90"
            @click="handleAddToCart(p)"
          >
            Læg i kurv
          </button>

          <button
            v-else
            class="w-full rounded-lg bg-slate-200 text-slate-700 py-2 hover:bg-slate-300"
            @click="props.openLogin && props.openLogin()"
          >
            Log ind for at købe
          </button>
        </div>
      </li>
    </ul>

    <p v-if="!loading && !error && products.length === 0" class="mt-4 text-slate-600">
      Ingen produkter.
    </p>
  </section>
</template>
