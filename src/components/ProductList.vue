<script setup>
import { ref, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useFetch } from '@/composables/useFetch'
import { trackAddToCart } from '@/lib/analytics'

const props = defineProps({
  selectedCategoryId: { type: [Number, String], default: null },
  isLoggedIn: { type: Boolean, default: false },
  addToCart: { type: Function, default: () => {} },
  openLogin: { type: Function, default: null },
})

const API_PORT = import.meta.env.VITE_API_PORT || 4000
const API = `http://localhost:${API_PORT}/api`

function listUrl() {
  return props.selectedCategoryId
    ? `${API}/products/${encodeURIComponent(props.selectedCategoryId)}`
    : `${API}/products`
}

const {
  data: productsData,
  loading,
  error,
  run,
} = useFetch(listUrl(), {
  initial: [],
  immediate: true,
})

watch(
  () => props.selectedCategoryId,
  () => run(listUrl()),
)

const { data: reviewsData } = useFetch(`${API}/reviews`, {
  initial: [],
  immediate: true,
})

const categorySlugs = ref([])
const categoriesLoaded = ref(false)

async function loadCategories() {
  try {
    const res = await fetch(`${API}/categories`)
    if (!res.ok) return
    const cats = await res.json()
    categorySlugs.value = Array.isArray(cats)
      ? cats
          .map((c) => c.slug)
          .filter((s) => typeof s === 'string' && s.length > 0)
      : []
    categoriesLoaded.value = true
  } catch {

  }
}

onMounted(loadCategories)

const slugToProductId = new Map()

async function resolveProductIdFromSlug(slug) {
  if (!slug) return null

  if (slugToProductId.has(slug)) {
    return slugToProductId.get(slug) || null
  }

  if (!categoriesLoaded.value) {
    await loadCategories()
  }

  for (const catSlug of categorySlugs.value) {
    try {
      const url = `${API}/products/${encodeURIComponent(
        catSlug,
      )}/${encodeURIComponent(slug)}`
      const res = await fetch(url)
      if (!res.ok) continue
      const data = await res.json()
      const rawId =
        data?.id ?? data?.productId ?? data?.product_id ?? data?.product?.id
      const n = Number(rawId)
      if (Number.isFinite(n) && n > 0) {
        slugToProductId.set(slug, n)
        return n
      }
    } catch {

    }
  }

  slugToProductId.set(slug, null)
  return null
}

function buildImageUrl(url) {
  if (!url) return '/placeholder.png'
  const s = String(url)
  if (/^https?:\/\//i.test(s)) return s
  return `http://localhost:${API_PORT}/${s.replace(/^\//, '')}`
}

function imgSrc(p) {
  const url = p?.imageUrl || p?.thumbnail || p?.image || ''
  return buildImageUrl(url)
}

function formatNumber(n) {
  const x = Number(String(n ?? '').replace(',', '.'))
  if (!Number.isFinite(x)) return ''
  return new Intl.NumberFormat('da-DK', {
    minimumFractionDigits: 0,
  }).format(Math.round(x))
}

function stockLabel(p) {
  const s = Number(p && p.stock)
  if (!Number.isFinite(s)) return ''
  if (s <= 0) return 'Ikke på lager'
  if (s <= 5) return 'Få stk. på lager'
  return 'På lager'
}

function stockClass(p) {
  const s = Number(p && p.stock)
  if (!Number.isFinite(s)) return ''
  if (s <= 0) return 'text-red-600'
  if (s <= 5) return 'text-amber-600'
  return 'text-emerald-600'
}

function getReviewProductId(review) {
  const candidates = [
    review?.productId,
    review?.product_id,
    review?.product?.id,
  ]
  for (const c of candidates) {
    const n = Number(c)
    if (Number.isFinite(n) && n > 0) return n
  }
  return null
}

const products = ref([])

watch(
  [productsData, reviewsData],
  async ([prodsRaw, reviewsRaw]) => {
    const prods = Array.isArray(prodsRaw) ? prodsRaw : []
    const reviews = Array.isArray(reviewsRaw) ? reviewsRaw : []

    console.log('[PL] productsData', prods)
    console.log('[PL] reviewsData', reviews)

    const statsMap = new Map()

    for (const r of reviews) {
      const pid = getReviewProductId(r)
      if (!pid) continue
      const entry = statsMap.get(pid) || { sum: 0, count: 0 }
      entry.sum += Number(r.numStars || r.rating || 0)
      entry.count += 1
      statsMap.set(pid, entry)
    }

    const enriched = []
    for (const p of prods) {
      const slug = p?.slug ?? p?.productSlug ?? null
      const pid = await resolveProductIdFromSlug(slug)

      const stat = pid != null ? statsMap.get(pid) : null
      const avg =
        stat && stat.count
          ? Math.max(0, Math.min(5, stat.sum / stat.count))
          : 0
      const count = stat?.count || 0

      console.log('[PL] product', p, 'slug', slug, 'pid', pid, 'avg', avg, 'count', count)

      enriched.push({
        ...p,
        _avgRating: avg,
        _reviewCount: count,
      })
    }

    products.value = enriched
  },
  { immediate: true },
)

async function handleAddToCart(p) {
  if (!props.isLoggedIn) {
    props.openLogin && props.openLogin()
    return
  }
  const slug = p?.slug ?? p?.productSlug ?? null
  const pid = await resolveProductIdFromSlug(slug)
  if (!pid) {
    alert('Kunne ikke finde produktets ID')
    return
  }
  try {
    await props.addToCart(pid, 1)
    trackAddToCart(p, 1)
  } catch {
    alert('Kunne ikke tilføje produktet til kurven.')
  }
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-6">
    <p v-if="loading">Indlæser…</p>
    <p v-else-if="error" class="text-red-600">{{ error }}</p>

    <ul
      v-else
      class="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      <li
        v-for="p in products"
        :key="p.slug ?? p.id ?? p.productId"
        class="group"
      >
        <RouterLink
          :to="{
            name: 'product',
            params: { slug: p.slug ?? String(p.id ?? p.productId ?? '') },
          }"
          class="block rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 group-hover:shadow-md group-hover:ring-slate-300 transition overflow-hidden"
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
            <p class="font-semibold truncate">
              {{ p.name || p.title }}
            </p>
            <p class="text-sm text-slate-600">
              {{ p.teaser || p.brand?.title || '' }}
            </p>

            <p v-if="p.price != null" class="mt-1 font-medium">
              {{ formatNumber(p.price) }} kr
              <span class="text-xs text-slate-600">inkl. moms</span>
            </p>

            <p
              v-if="p.stock != null"
              class="mt-1 text-xs"
              :class="stockClass(p)"
            >
              {{ stockLabel(p) }}
            </p>

            <div class="mt-1 flex items-center gap-2">
              <div
                class="flex items-center -ml-0.5"
                aria-label="Produktbedømmelse"
              >
                <template v-for="n in 5" :key="n">
                  <svg
                    v-if="n <= Math.round(p._avgRating || 0)"
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

              <span
                v-if="(p._reviewCount || 0) > 0"
                class="text-xs text-slate-600"
              >
                ({{ p._reviewCount }})
              </span>
              <span v-else class="text-xs text-slate-400">
                Ingen anmeldelser
              </span>
            </div>
          </div>
        </RouterLink>

        <div class="mt-2">
          <button
            v-if="props.isLoggedIn"
            type="button"
            class="w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-semibold hover:bg-slate-800"
            @click="handleAddToCart(p)"
          >
            Læg i kurv
          </button>
          <button
            v-else
            type="button"
            class="w-full rounded-lg bg-slate-200 text-slate-700 py-2 hover:bg-slate-300"
            @click="props.openLogin && props.openLogin()"
          >
            Log ind for at købe
          </button>
        </div>
      </li>
    </ul>

    <p
      v-if="!loading && !error && products.length === 0"
      class="mt-4 text-slate-600"
    >
      Ingen produkter.
    </p>
  </section>
</template>
