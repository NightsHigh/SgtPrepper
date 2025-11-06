const STORAGE_KEY = 'sgtprepper_cookie_consent_v1'
let gaInitialized = false

function safeWindow() {
  return typeof window !== 'undefined' ? window : null
}

export function getConsent() {
  const w = safeWindow()
  if (!w) return null
  try {
    const raw = w.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) || null
  } catch {
    return null
  }
}

export function setConsent(partial) {
  const w = safeWindow()
  if (!w) return
  const existing = getConsent() || {}
  const next = { ...existing, ...partial, updatedAt: new Date().toISOString() }
  try {
    w.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
  }
}

function ensureGtag(GA_ID) {
  const w = safeWindow()
  if (!w || !GA_ID) return
  if (typeof w.gtag === 'function') return

  w.dataLayer = w.dataLayer || []
  function gtag(){ w.dataLayer.push(arguments) }
  w.gtag = gtag

  const src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  if (!document.querySelector(`script[src="${src}"]`)) {
    const s = document.createElement('script')
    s.async = true
    s.src = src
    document.head.appendChild(s)
  }

  gtag('js', new Date())
  gtag('config', GA_ID, { anonymize_ip: true })
}

export function initAnalytics() {
  if (gaInitialized) return
  const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || import.meta.env.VITE_GA_ID
  if (!GA_ID) return
  ensureGtag(GA_ID)
  gaInitialized = true
}

export function initFromStoredConsent() {
  const c = getConsent()
  if (c && (c.analytics === true || c.all === true)) {
    initAnalytics()
  }
}

export function trackPageView(route) {
  const w = safeWindow()
  if (!w || typeof w.gtag !== 'function') return
  const path = route && route.fullPath ? route.fullPath : w.location.pathname + w.location.search
  const title = route && (route.meta && route.meta.title) ? route.meta.title : document.title || ''
  w.gtag('event', 'page_view', {
    page_title: title,
    page_location: w.location.href,
    page_path: path,
  })
}

export function trackAddToCart(product, quantity = 1) {
  const w = safeWindow()
  if (!w || typeof w.gtag !== 'function') return
  if (!product) return
  const price = Number(product.price ?? 0) || 0
  const id = product.id ?? product.slug ?? product.name ?? 'unknown'
  const name = product.name ?? product.slug ?? 'Produkt'
  const qty = Number(quantity) || 1
  w.gtag('event', 'add_to_cart', {
    currency: 'DKK',
    value: price * qty,
    items: [
      {
        item_id: String(id),
        item_name: String(name),
        quantity: qty,
        price,
      },
    ],
  })
}
