<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { trackAddToCart } from '@/lib/analytics'

const API_PORT = import.meta.env.VITE_API_PORT || 4000
const API = `http://localhost:${API_PORT}/api`
const route = useRoute()
const router = useRouter()

const props = defineProps({
  isLoggedIn: { type: Boolean, default: false },
  addToCart: { type: Function, default: () => {} },
  openLogin: { type: Function, default: null },
})

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
    const catsRes = await fetch(`${API}/categories`)
    const cats = await catsRes.json().catch(() => [])
    const slugs = Array.isArray(cats) ? cats.map((c) => c.slug).filter(Boolean) : []

    for (const c of slugs) {
      try {
        const data = await fetchJson(urlFor(c, s))
        product.value = data
        const q = route.query.debug ? { debug: route.query.debug } : {}
        router.replace({ name: 'product', params: { slug: s }, query: q })
        return
      } catch {

      }
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

function fmt(n) {
  const x = Number(String(n ?? '').replace(',', '.'))
  if (!Number.isFinite(x)) return ''
  return new Intl.NumberFormat('da-DK', {
    minimumFractionDigits: 0,
  }).format(Math.round(x))
}

const stockLabel = computed(() => {
  const s = Number(product.value && product.value.stock)
  if (!Number.isFinite(s)) return ''
  if (s <= 0) return 'Ikke på lager'
  if (s <= 5) return 'Få stk. på lager'
  return 'På lager'
})

const stockClass = computed(() => {
  const s = Number(product.value && product.value.stock)
  if (!Number.isFinite(s)) return ''
  if (s <= 0) return 'text-red-600'
  if (s <= 5) return 'text-amber-600'
  return 'text-emerald-600'
})

async function handleAddToCart(p) {
  if (!props.isLoggedIn) {
    if (props.openLogin) props.openLogin()
    return
  }
  const id = p.id
  if (!id) return
  try {
    await props.addToCart(id, 1)
    trackAddToCart(p, 1)
  } catch {

  }
}

const reviews = ref([])

const reviewCount = computed(() => reviews.value.length)

const avgRating = computed(() => {
  if (!reviews.value.length) return 0
  const sum = reviews.value.reduce(
    (s, r) => s + Number(r.numStars || r.rating || 0),
    0,
  )
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

watch(product, (p) => {
  const id = p?.id ?? p?.productId ?? p?.product_id ?? p?.product?.id
  if (!id) {
    reviews.value = []
    return
  }
  loadReviewsForProduct(id)
})

const title = computed(() => product.value?.name || 'Produkt')
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-6">
    <p v-if="loading">Indlæser…</p>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <div v-else-if="product" class="grid gap-8 md:grid-cols-2">
      <div class="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 p-3">
        <img
          :src="imgSrc(product)"
          :alt="title"
          class="w-full aspect-[4/3] object-cover rounded-xl bg-slate-100"
        />
      </div>

      <div class="space-y-4">
        <h1 class="text-3xl font-bold tracking-tight">{{ title }}</h1>
        <p class="text-slate-600">{{ product.brand?.title || '' }}</p>

        <p v-if="product.price != null" class="text-2xl font-semibold">
          {{ fmt(product.price) }} kr
          <span class="text-sm font-normal text-slate-600">
            (inkl. moms, ekskl. fragt)
          </span>
        </p>

        <p v-if="stockLabel" class="text-sm" :class="stockClass">
          {{ stockLabel }}
        </p>

        <div class="mt-2 flex items-center gap-2" aria-label="Produktbedømmelse">
          <div class="flex items-center -ml-0.5">
            <template v-for="n in 5" :key="n">
              <svg
                v-if="n <= Math.round(avgRating)"
                class="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M9.049 2.927a1 1 0 011.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.97 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.923-.755 1.688-1.54 1.118L10 13.348l-3.376 2.233c-.784.57-1.838-.195-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.89 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"
                />
              </svg>
              <svg
                v-else
                class="w-5 h-5 opacity-25"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M9.049 2.927a1 1 0 011.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.97 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.923-.755 1.688-1.54 1.118L10 13.348l-3.376 2.233c-.784.57-1.838-.195-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.89 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"
                />
              </svg>
            </template>
          </div>
          <p class="text-sm text-slate-600">
            <span v-if="reviewCount > 0">
              {{ avgRating.toFixed(1) }} / 5 ·
              {{ reviewCount }} anmeldelse{{ reviewCount === 1 ? '' : 'r' }}
            </span>
            <span v-else>Ingen anmeldelser endnu.</span>
          </p>
        </div>

        <div class="mt-4 flex items-center gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            @click="handleAddToCart(product)"
          >
            Læg i kurv
          </button>
        </div>

        <div class="prose max-w-none">
          <div v-if="product.description" v-html="product.description" />
          <p v-else class="text-slate-500">Ingen beskrivelse.</p>
        </div>

        <section class="mt-6 border-t border-slate-200 pt-4">
          <h2 class="text-lg font-semibold mb-2">Kundeanmeldelser</h2>

          <p v-if="reviewCount === 0" class="text-sm text-slate-500">
            Der er endnu ingen anmeldelser for dette produkt.
          </p>

          <ul v-else class="space-y-4 text-sm">
            <li
              v-for="r in reviews"
              :key="r.id ?? r.createdAt ?? r.title"
              class="rounded-lg border border-slate-200 p-3 bg-white/70"
            >
              <div class="flex items-center justify-between gap-2">
                <p class="font-medium text-slate-900">
                  {{ r.title || 'Anmeldelse' }}
                </p>
                <div class="flex items-center gap-1 text-amber-500">
                  <template v-for="n in 5" :key="n">
                    <svg
                      v-if="n <= Number(r.numStars || r.rating || 0)"
                      class="w-4 h-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        d="M9.049 2.927a1 1 0 011.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.97 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.923-.755 1.688-1.54 1.118L10 13.348l-3.376 2.233c-.784.57-1.838-.195-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.89 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"
                      />
                    </svg>
                    <svg
                      v-else
                      class="w-4 h-4 opacity-25"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        d="M9.049 2.927a1 1 0 011.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.97 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.923-.755 1.688-1.54 1.118L10 13.348l-3.376 2.233c-.784.57-1.838-.195-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.89 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"
                      />
                    </svg>
                  </template>
                </div>
              </div>
              <p class="mt-0.5 text-xs text-slate-500">
                {{ r.user?.name || 'Anonym kunde' }}
              </p>
              <p class="mt-1 text-slate-700 whitespace-pre-line">
                {{ r.comment }}
              </p>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <p v-else>Produkt ikke fundet.</p>
  </section>
</template>
