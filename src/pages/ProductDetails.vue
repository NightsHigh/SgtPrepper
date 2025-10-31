<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const API_PORT = import.meta.env.VITE_API_PORT || 4000
const API = `http://localhost:${API_PORT}/api`
const route = useRoute()
const router = useRouter()

const slug = computed(() => String(route.params.slug || ''))
const product = ref(null)
const loading = ref(false)
const error = ref('')

const triedUrl = ref('')
const lastStatus = ref(null)

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
  const res = await fetch(u)
  lastStatus.value = res.status
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function load() {
  product.value = null
  error.value = ''
  lastStatus.value = null
  const s = slug.value
  if (!s) return

  loading.value = true
  try {
    // 1) get categories
    const catsRes = await fetch(`${API}/categories`)
    const cats = await catsRes.json().catch(() => [])
    const slugs = Array.isArray(cats) ? cats.map(c => c.slug).filter(Boolean) : []

    // 2) probe each category until one returns 200
    for (const c of slugs) {
      try {
        const data = await fetchJson(urlFor(c, s))
        product.value = data
        // keep /product/:slug as canonical (no reload)
        const q = route.query.debug ? { debug: route.query.debug } : {}
        router.replace({ name: 'product', params: { slug: s }, query: q })
        return
      } catch { /* try next */ }
    }
    error.value = 'Produkt ikke fundet.'
  } catch {
    error.value = 'Kunne ikke hente produkt.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => slug.value, load)

const title = computed(() => product.value?.name || 'Produkt')
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-6">
    <p v-if="loading">Indlæser…</p>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

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
      </div>
    </div>

    <p v-else>Produkt ikke fundet.</p>
  </section>
</template>
