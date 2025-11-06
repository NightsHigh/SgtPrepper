import { useFetch } from '@/composables/useFetch'

const cacheById = new Map()
const cacheBySlug = new Map()

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

function slugify(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-/_]/g, '')
}

async function fetchJson(url, opts = {}) {
  const { data, error, run } = useFetch(url, { immediate: false })
  await run(url, opts)
  if (error.value) throw new Error(error.value)
  return data.value
}

export async function getProduct({ id, slug, categorySlug } = {}) {
  if (id && cacheById.has(String(id))) return cacheById.get(String(id))
  if (slug && cacheBySlug.has(slug)) return cacheBySlug.get(slug)

  if (id) {
    const prod = await fetchJson(`${API_BASE_URL}/products/${encodeURIComponent(id)}`)
    if (prod) {
      cacheById.set(String(prod.id), prod)
      if (prod.slug) cacheBySlug.set(prod.slug, prod)
      return prod
    }
  }

  const s = slug || null
  const cs = categorySlug || null
  const candidates = []
  if (s) {
    candidates.push(`${API}/products/all/${encodeURIComponent(s)}`)
    if (cs) candidates.push(`${API}/products/${encodeURIComponent(cs)}/${encodeURIComponent(s)}`)
    candidates.push(`${API}/products/${encodeURIComponent(s)}`)
  }

  if (!s && id == null) {
    return null
  }

  for (const url of candidates) {
    try {
      const prod = await fetchJson(url)
      if (prod) {
        cacheById.set(String(prod.id), prod)
        if (prod.slug) cacheBySlug.set(prod.slug, prod)
        return prod
      }
    } catch {}
  }

  try {
    const all = await fetchJson(`${API}/products`)
    const hit = Array.isArray(all) ? all.find(x =>
      (id && String(x.id) === String(id)) ||
      (s && x.slug === s)
    ) : null
    if (hit) {
      cacheById.set(String(hit.id), hit)
      if (hit.slug) cacheBySlug.set(hit.slug, hit)
      return hit
    }
  } catch {}

  return null
}

export function deriveLookupFromCartItem(item) {
  const p = item?.product || {}
  const id = p.id ?? item?.productId ?? item?.id
  const slug = p.slug ?? item?.slug ?? slugify(p.name ?? item?.name)
  const categorySlug = p?.category?.slug ?? item?.category?.slug
  return { id, slug, categorySlug }
}
