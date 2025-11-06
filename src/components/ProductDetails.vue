<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useCart } from '@/composables/useCart'

const route = useRoute()
const { state: authState } = useAuth()
const cart = useCart()

const API_PORT = import.meta.env.VITE_API_PORT || 4000
const API = `http://localhost:${API_PORT}/api`

const product = ref(null)
const loading = ref(true)
const error = ref('')
const slug = computed(() => String(route.params.slug || ''))

function buildImageUrl(url) {
  if (!url) return '/placeholder.png'
  if (/^https?:\/\//i.test(url)) return url
  return `http://localhost:${API_PORT}/${String(url).replace(/^\//,'')}`
}
function fmt(n) {
  const x = Number(String(n ?? '').replace(',', '.'))
  return Number.isFinite(x) ? new Intl.NumberFormat('da-DK', { minimumFractionDigits: 0 }).format(Math.round(x)) : ''
}

async function fetchProductBySlugOrId() {
  if (!slug.value) return null
  const tries = [
    `${API}/products/all/${encodeURIComponent(slug.value)}`,
  ]
  if (/^\d+$/.test(slug.value)) tries.push(`${API}/products/${slug.value}`)
  tries.push(`${API}/products/${encodeURIComponent(slug.value)}`)

  for (const url of tries) {
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      const data = await res.json()
      const obj = Array.isArray(data) ? data[0] : data
      if (obj && (obj.id || obj.slug)) return obj
    } catch {}
  }
  return null
}
async function loadProduct() {
  loading.value = true
  error.value = ''
  try {
    const p = await fetchProductBySlugOrId()
    if (!p) throw new Error('Produktet blev ikke fundet.')
    product.value = p
  } catch (e) {
    error.value = e?.message || 'Kunne ikke hente produktet.'
    product.value = null
  } finally {
    loading.value = false
  }
}

const reviews = ref([])
const reviewCount = computed(() => reviews.value.length)
const avgRating = computed(() => {
  if (!reviews.value.length) return 0
  const sum = reviews.value.reduce((s, r) => s + Number(r.numStars || r.rating || 0), 0)
  return Math.max(0, Math.min(5, sum / reviews.value.length))
})
async function loadReviewsForProduct(productId) {
  reviews.value = []

  const pid = Number(productId)
  if (!Number.isFinite(pid) || pid <= 0) return

  try {
    const res = await fetch(`${API}/reviews`)
    if (!res.ok) return
    const all = await res.json()

    const arr = Array.isArray(all) ? all : []
    const filtered = arr.filter((r) => {
      const rawPid = r?.productId ?? r?.product_id ?? r?.product?.id
      const n = Number(rawPid)
      return Number.isFinite(n) && n === pid
    })

    reviews.value = filtered
  } catch {
    reviews.value = []
  }
}

async function addToCart(qty = 1) {
  if (!authState.accessToken) { alert('Log ind for at lægge i kurven.'); return }
  const pid = Number(product.value?.id)
  if (!Number.isFinite(pid) || pid <= 0) { alert('Kunne ikke finde produktets ID.'); return }
  try {
    await cart.addToCart(pid, qty)
  } catch (e) {
    alert('Kunne ikke tilføje produktet til kurven.')
  }
}

watch(slug, () => loadProduct(), { immediate: true })
watch(product, (p) => loadReviewsForProduct(Number(p?.id || 0)))
onMounted(() => { if (authState.accessToken) cart.fetchCart() })
</script>

<template>
  <section class="mx-auto max-w-6xl px-4 py-6">
    <p v-if="loading">Indlæser…</p>
    <p v-else-if="error" class="text-red-600">{{ error }}</p>

    <div v-else-if="product" class="grid gap-6 md:grid-cols-2">
      <div class="rounded-2xl overflow-hidden bg-slate-100">
        <a :href="buildImageUrl(product.imageUrl || product.thumbnail || product.image)" target="_blank" rel="noopener">
          <img
            :src="buildImageUrl(product.imageUrl || product.thumbnail || product.image)"
            :alt="product.name || product.title || 'Produkt'"
            class="w-full h-96 object-cover"
          />
        </a>
      </div>

      <div>
        <h1 class="text-2xl font-bold">{{ product.name || product.title }}</h1>
        <p class="mt-2 text-slate-700 whitespace-pre-line">
          {{ product.description || product.teaser || '' }}
        </p>

        <p v-if="product.price != null" class="mt-4 text-xl font-semibold">
          {{ fmt(product.price) }} kr
        </p>

        <div class="mt-4 flex items-center gap-3">
          <button class="px-4 py-2 rounded-lg bg-slate-800 text-white hover:opacity-90" @click="addToCart(1)">
            Læg i kurv
          </button>
        </div>

        <div class="mt-6 flex items-center gap-2">
          <div class="flex items-center -ml-0.5" aria-label="Produktbedømmelse">
            <template v-for="n in 5" :key="n">
              <svg v-if="n <= Math.round(avgRating)" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927a1 1 0 011.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.97 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.036a1 1 0 00-1.176 0l-2.802 2.036c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"/>
              </svg>
              <svg v-else class="w-5 h-5 opacity-25" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927a1 1 0 011.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.97 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.036a1 1 0 00-1.176 0l-2.802 2.036c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"/>
              </svg>
            </template>
          </div>
          <span class="text-sm text-slate-600">({{ reviewCount }})</span>
        </div>

        <section class="mt-4">
          <p v-if="!reviews.length" class="text-sm text-slate-500">Ingen anmeldelser endnu.</p>

          <ul v-else class="space-y-3">
            <li v-for="r in reviews" :key="r.id" class="rounded-lg border border-slate-200 p-3">
              <p class="font-medium">{{ r.title }}</p>
              <p class="text-xs text-slate-500">{{ new Date(r.createdAt).toLocaleDateString() }}</p>
              <div class="mt-1 flex items-center">
                <template v-for="n in 5" :key="n">
                  <svg v-if="n <= (r.numStars || r.rating || 0)" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927a1 1 0 011.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.97 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.036a1 1 0 00-1.176 0l-2.802 2.036c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"/>
                  </svg>
                  <svg v-else class="w-4 h-4 opacity-25" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927a1 1 0 011.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.97 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.036a1 1 0 00-1.176 0l-2.802 2.036c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"/>
                  </svg>
                </template>
              </div>
              <p class="mt-1 text-sm text-slate-700 whitespace-pre-line">{{ r.comment }}</p>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <p v-else class="text-slate-600">Produktet blev ikke fundet.</p>
  </section>
</template>
