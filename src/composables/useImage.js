export function buildImageUrl(url, apiPort = import.meta.env.VITE_API_PORT || 4000) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `http://localhost:${apiPort}/${String(url).replace(/^\//, '')}`
}

export function resolveProductImage(input, apiPort = import.meta.env.VITE_API_PORT || 4000) {
  const p = input?.product ?? input?.Product ?? input ?? {}

  const direct =
    p.imageUrl || p.image_url || p.imageURL || p.ImageUrl ||
    p.thumbnail || p.thumb ||
    p.image || p.img ||
    p.imagePath || p.image_path || p.imagepath ||
    p.imageurl || p.image_uri || p.imageHref || p.photo || p.picture
  if (direct) return buildImageUrl(direct, apiPort)

  const arrays = [p.images, p.media, p.photos, p.pictures, p.gallery]
  for (const arr of arrays) {
    if (Array.isArray(arr) && arr.length) {
      const first = arr[0]
      const fromArray =
        (typeof first === 'string' && first) ||
        first?.url || first?.src || first?.path || first?.href
      if (fromArray) return buildImageUrl(fromArray, apiPort)
    }
  }

  const nested =
    (p.image && (p.image.url || p.image.src || p.image.path)) ||
    (p.thumbnail && (p.thumbnail.url || p.thumbnail.src || p.thumbnail.path)) ||
    (p.picture && (p.picture.url || p.picture.src || p.picture.path))
  if (nested) return buildImageUrl(nested, apiPort)

  const onItem =
    input?.imageUrl || input?.image_url || input?.image || input?.img || input?.thumbnail
  if (onItem) return buildImageUrl(onItem, apiPort)

  const deep = findImageUrlDeep(p) || findImageUrlDeep(input)
  if (deep) return buildImageUrl(deep, apiPort)

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
