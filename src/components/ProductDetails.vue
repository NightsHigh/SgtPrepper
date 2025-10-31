<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
console.log('[PD: components]');


// ===== CONFIG =====
const API_PORT = import.meta.env.VITE_API_PORT || 4000
const API = `http://localhost:${API_PORT}/api`
const route = useRoute()
const router = useRouter()

// ===== STATE =====
const slug = computed(() => String(route.params.slug || ''))
const product = ref(null)
const loading = ref(false)
const error = ref('')

const triedUrl = ref('')
const lastStatus = ref(null)
const categoriesTried = ref([])
const categoriesCount = ref(0)
const fallbackHit = ref(null)
const DEBUG = computed(() => route.query.debug === '1' || route.query.debug === 1)

// ===== HELPERS =====
function urlFor(catSlug, s) {
  return `${API}/products/${encodeURIComponent(catSlug)}/${encodeURIComponent(s)}`
}

function imgSrc(p) {
  const url = p?.imageUrl || ''
  if (!url) return '/placeholder.png'
  if (/^https?:\/\//i.test(url)) return url
  return `http://localhost:${API_PORT}/${url.replace(/^\//, '')}`
}

async function fetchJson(u) {
  triedUrl.value = u
  console.log('[Details] GET', u)
  const res = await fetch(u)
  lastStatus.value = res.status
  console.log('[Details] status', res.status, res.statusText)
  if (!res.ok) {
    let body = ''
    try { body = await res.text() } catch {}
    if (body) console.log('[Details] error body (preview):', body.slice(0, 300))
    const e = new Error(`HTTP ${res.status}`)
    // @ts-ignore
    e.status = res.status
    throw e
  }
  const json = await res.json()
  return json
}

function normalizeCategorySlugs(payload) {
  // Accept [], { categories: [] }, { data: [] }, or anything with array inside
  if (Array.isArray(payload)) return payload.map(c => c?.slug).filter(Boolean)
  if (payload && Array.isArray(payload.categories)) return payload.categories.map(c => c?.slug).filter(Boolean)
  if (payload && Array.isArray(payload.data)) return payload.data.map(c => c?.slug).filter(Boolean)
  // Last resort: search for any array value that looks like categories
  for (const k of Object.keys(payload || {})) {
    const v = payload[k]
    if (Array.isArray(v) && v.length && v.every(x => typeof x === 'object' && 'slug' in x)) {
      return v.map(c => c?.slug).filter(Boolean)
    }
  }
  return []
}

// ===== MAIN =====
async function load() {
  product.value = null
  error.value = ''
  triedUrl.value = ''
  lastStatus.value = null
  categoriesTried.value = []
  fallbackHit.value = null

  const s = slug.value
  console.groupCollapsed('%c[ProductDetails] load', 'color:#0ea5e9', { slug: s })
  if (!s) {
    console.warn('[Details] No slug, aborting.')
    console.groupEnd()
    return
  }

  loading.value = true
  try {
    // 1) Fetch categories (robust to different shapes)
    const catsRes = await fetch(`${API}/categories`)
    let catsPayload = null
    try {
      catsPayload = await catsRes.json()
    } catch {
      catsPayload = []
    }
    const slugs = normalizeCategorySlugs(catsPayload)
    categoriesCount.value = slugs.length
    console.log('[Details] category slugs:', slugs)

    if (!slugs.length) {
      error.value = 'Ingen kategorier fundet (kan ikke slå produkt op).'
      console.warn('[Details] No category slugs available.')
      return
    }

    // 2) Probe each category until we find the product
    for (const c of slugs) {
      const testUrl = urlFor(c, s)
      categoriesTried.value.push(c)
      console.log('[Details] try:', { category: c, url: testUrl })
      try {
        const data = await fetchJson(testUrl)
        product.value = data
        fallbackHit.value = c
        // Keep /product/:slug (slug-only) as canonical; preserve ?debug if present
        const q = route.query.debug ? { debug: route.query.debug } : {}
        router.replace({ name: 'product', params: { slug: s }, query: q })
        console.log('[Details] FOUND in category:', c)
        console.groupEnd()
        return
      } catch (e) {
        console.log('[Details] not found in', c, e?.message)
      }
    }

    // None matched
    error.value = 'Produkt ikke fundet.'
    console.warn('[Details] No category returned the product.')
  } catch (e) {
    error.value = 'Kunne ikke hente produkt.'
    console.error('[Details] Fatal error:', e)
  } finally {
    loading.value = false
    console.groupEnd()
  }
}

onMounted(load)
watch(() => slug.value, load)

const title = computed(() => product.value?.name || 'Produkt')
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-6">
    <p v-if="loading">Indlæser…</p>

    <div v-else-if="error" class="text-red-600 space-y-2">
      <p>{{ error }}</p>
      <div v-if="DEBUG" class="text-xs opacity-70 space-y-1">
        <p><strong>Last tried:</strong> <code>{{ triedUrl }}</code></p>
        <p><strong>Status:</strong> <code>{{ lastStatus }}</code></p>
        <p><strong>Categories tried ({{ categoriesCount }}):</strong> {{ categoriesTried.join(', ') }}</p>
      </div>
    </div>

    <div v-else-if="product" class="grid gap-8 md:grid-cols-2">
      <div class="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 p-3">
        <img :src="imgSrc(product)" :alt="title" class="w-full aspect-[4/3] object-cover rounded-xl bg-slate-100" />
      </div>

      <div class="space-y-4">
        <h1 class="text-3xl font-bold tracking-tight">{{ title }}</h1>
        <p class="text-slate-600">{{ product.brand?.title || '' }}</p>

        <div class="prose max-w-none">
          <div v-if="product.description" v-html="product.description" />
          <p v-else class="text-slate-500">Ingen beskrivelse.</p>
        </div>

        <div v-if="DEBUG" class="text-xs mt-4 p-3 rounded bg-slate-50 ring-1 ring-slate-200/60">
          <p><strong>Debug:</strong></p>
          <p>Fallback hit: <code>{{ fallbackHit || 'none' }}</code></p>
          <p>Last tried: <code>{{ triedUrl }}</code></p>
          <p>Status: <code>{{ lastStatus }}</code></p>
          <p>Categories tried: {{ categoriesTried.join(', ') }}</p>
        </div>
      </div>
    </div>

    <p v-else>Produkt ikke fundet.</p>
  </section>
</template>
