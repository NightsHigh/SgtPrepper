export function buildImageUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
  const staticBase = apiBase.replace(/\/api\/?$/, '')

  return `${staticBase}/${String(url).replace(/^\//, '')}`
}

export function resolveProductImage(input) {
  const p = input?.product ?? input?.Product ?? input ?? {}

  const direct =
    p.imageUrl || p.image_url || p.imageURL || p.ImageUrl ||
    p.thumbnail || p.thumb ||
    p.image || p.img ||
    p.imagePath || p.image_path || p.imagepath ||
    p.imageurl || p.image_uri || p.imageHref || p.photo || p.picture
  if (direct) return buildImageUrl(direct)

  const nested = p.assets || p.media || p.images || p.photos || null
  if (Array.isArray(nested) && nested.length > 0) {
    const first = nested[0]
    if (typeof first === 'string') return buildImageUrl(first)
    if (first && typeof first === 'object') {
      const deep = findImageUrlDeep(first)
      if (deep) return buildImageUrl(deep)
    }
  }

  const deep = findImageUrlDeep(p)
  if (deep) return buildImageUrl(deep)

  return ''
}

function findImageUrlDeep(obj, seen = new Set(), lvl = 0) {
  if (!obj || typeof obj !== 'object' || lvl > 3 || seen.has(obj)) return ''
  seen.add(obj)
  for (const [, v] of Object.entries(obj)) {
    if (typeof v === 'string') {
      if (/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(v)) return v
      if (/^data:image\//i.test(v)) return v
    }
    if (v && typeof v === 'object') {
      const found = findImageUrlDeep(v, seen, lvl + 1)
      if (found) return found
    }
  }
  return ''
}
