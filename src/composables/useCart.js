import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { resolveProductImage, buildImageUrl } from '@/composables/useImage'

const API_PORT = import.meta.env.VITE_API_PORT || 4000
const API_BASE_URL = `http://localhost:${API_PORT}/api`

function slugify(str) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9æøåäöüéèáíóúñ\- ]/gi, '')
    .replace(/\s+/g, '-')
}

async function checkPlaceholder() {
  const placeholderUrls = [
    `http://localhost:${API_PORT}/static/placeholder.png`,
    `http://localhost:${API_PORT}/images/placeholder.png`,
    `http://localhost:${API_PORT}/placeholder.png`,
  ]

  for (const url of placeholderUrls) {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      if (response.ok) {
        return url
      }
    } catch (e) {
    }
  }

  return null
}

const items = ref([]) // list of cart items shared across the app
const isLoading = ref(false) // true while the cart is being loaded from the API
const error = ref('') // holds the latest error message (if any)

export function useCart() {
  const { authHeader } = useAuth()

  const count = computed(() =>
    items.value.reduce((n, i) => n + (i.quantity || 0), 0),
  )

  function toNumber(v) {
    if (v == null) return 0
    const n = Number(String(v).replace(',', '.'))
    return Number.isFinite(n) ? n : 0
  }

  async function fetchProductById(id) {
    if (!id) return null
    try {
      const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`, {
        headers: { ...authHeader() },
      })
      if (res.ok) return await res.json()
    } catch {
    }
    return null
  }

  async function fetchProductBySlug(slug) {
    if (!slug) return null
    try {
      const res = await fetch(`${API_BASE_URL}/products/all/${encodeURIComponent(slug)}`, {
        headers: { ...authHeader() },
      })
      if (res.ok) return await res.json()
    } catch {
    }
    return null
  }

  let productIndex = null

  async function loadProductIndex() {
    if (Array.isArray(productIndex)) return productIndex

    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        headers: {
          ...authHeader(),
        },
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch products index: ${res.status}`)
      }

      const list = await res.json()
      productIndex = Array.isArray(list) ? list : []
      return productIndex
    } catch (e) {
      productIndex = []
      return productIndex
    }
  }

  async function enrichItems(arr) {
    const index = await loadProductIndex()
    const out = []

    for (const it of Array.isArray(arr) ? arr : []) {
      try {
        const p = it.product || {}

        let full = null

        let slug = p.slug
        if (!slug && p.name) {
          slug = slugify(p.name)
        }
        if (slug) {
          full = await fetchProductBySlug(slug)
        }

        if (!full && Array.isArray(index) && p.name) {
          full = index.find(prod => prod.name === p.name) || null
        }

        const merged = full ? { ...p, ...full } : { ...p }

        let resolvedUrl = resolveProductImage(merged, API_PORT)

        if (!resolvedUrl) {
          resolvedUrl = buildImageUrl('/placeholder.png', API_PORT)
        }

        const productWithImage = { ...merged, _resolvedImage: resolvedUrl }

        out.push({
          ...it,
          product: productWithImage,
          _resolvedImage: resolvedUrl,
        })
      } catch (e) {
        const fallback = buildImageUrl('/placeholder.png', API_PORT)
        out.push({
          ...it,
          _resolvedImage: fallback,
        })
      }
    }

    return out
  }

  async function fetchCart() {
    isLoading.value = true
    error.value = ''
    try {
      const res = await fetch(`${API_BASE_URL}/cart`, { headers: { ...authHeader() } })
      if (!res.ok) throw new Error(`GET /cart failed: ${res.status}`)
      const raw = await res.json()
      items.value = await enrichItems(Array.isArray(raw) ? raw : [])
    } catch (e) {
      error.value = e?.message || String(e)
    } finally {
      isLoading.value = false
    }
  }

  async function addToCart(productId, quantity = 1) {
    error.value = ''
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ productId, quantity }),
    })
    if (!res.ok) throw new Error(`POST /cart failed: ${res.status}`)
    await fetchCart()
  }

  async function removeFromCart(cartItemId) {
    error.value = ''
    const res = await fetch(`${API_BASE_URL}/cart/${encodeURIComponent(cartItemId)}`, {
      method: 'DELETE',
      headers: { ...authHeader() },
    })
    if (!res.ok) throw new Error(`DELETE /cart/${cartItemId} failed: ${res.status}`)
    items.value = items.value.filter(i => i.id !== cartItemId)
  }



  async function clearCart() {
    error.value = ''
    const currentItems = Array.isArray(items.value) ? [...items.value] : []

    for (const item of currentItems) {
      try {
        if (item?.id != null) {
          await removeFromCart(item.id)
        }
      } catch (e) {
        error.value = e?.message || String(e)
      }
    }
  }

  const subtotal = computed(() =>
    items.value.reduce(
      (sum, it) => sum + toNumber(it.product?.price) * (it.quantity || 0),
      0,
    ),
  )

  onMounted(async () => {
    await checkPlaceholder()
  })

  return {
    items,
    count,
    isLoading,
    error,
    fetchCart,
    addToCart,
    removeFromCart,
    clearCart,
    subtotal,
  }
}
