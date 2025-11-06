<script setup>
import { computed, reactive, watch, onMounted } from 'vue'
import { useCart } from '@/composables/useCart'
import { resolveProductImage, buildImageUrl } from '@/composables/useImage'
import { getProduct, deriveLookupFromCartItem } from '@/composables/useProductLookup'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close', 'checkout'])

const { items, isLoading, error, removeFromCart, subtotal } = useCart()

const totalItems = computed(() => items.value.reduce((n, i) => n + (i.quantity || 0), 0))

const imgByItemId = reactive({})

function imgSrc(item) {
  if (!item) return buildImageUrl('/placeholder.png')

  const prod = item.product || {}

  if (prod._resolvedImage) return prod._resolvedImage
  if (item._resolvedImage) return item._resolvedImage

  const local = resolveProductImage(prod) || resolveProductImage(item)
  if (local) return local

  return buildImageUrl('/placeholder.png')
}

async function hydrateImage(item) {
  if (!item || !item.id || imgByItemId[item.id]) return

  const prod = item?.product || {}
  if (item._resolvedImage) {
    imgByItemId[item.id] = item._resolvedImage
    return
  }
  if (prod._resolvedImage) {
    imgByItemId[item.id] = prod._resolvedImage
    item._resolvedImage = prod._resolvedImage
    return
  }

  const local = resolveProductImage(item)
  if (local) {
    imgByItemId[item.id] = local
    item._resolvedImage = local
    return
  }

  const { id, slug, categorySlug } = deriveLookupFromCartItem(item)
  try {
    const full = await getProduct({ id, slug, categorySlug })
    if (full) {
      item.product = { ...(item.product || {}), ...full }
      const url = resolveProductImage(item)
      if (url) {
        imgByItemId[item.id] = url
        item.product._resolvedImage = url
        item._resolvedImage = url
      }
    }
  } catch (e) {
  }
}

function toNumber(v) {
  const n = Number(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}
function fmt(n) {
  return new Intl.NumberFormat('da-DK', { minimumFractionDigits: 0 }).format(Math.round(n))
}
function priceOf(i) { return toNumber(i?.product?.price) }
function lineTotal(i) { return priceOf(i) * (i.quantity || 0) }
function onCheckout() { emit('checkout', items) }

onMounted(async () => {
  if (Array.isArray(items.value)) {
    for (const item of items.value) {
      const { id, slug, categorySlug } = deriveLookupFromCartItem(item)
      try {
        const full = await getProduct({ id, slug, categorySlug })
        if (full) item.product = { ...(item.product || {}), ...full }
      } catch {}
      await hydrateImage(item)
    }
  }
})

watch(() => props.open, (open) => {
  if (open && Array.isArray(items.value)) items.value.forEach(hydrateImage)
})
watch(() => items.value, (arr) => {
  if (Array.isArray(arr)) arr.forEach(hydrateImage)
}, { deep: true })
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/40" @click="$emit('close')" />
    <aside class="absolute right-0 top-0 h-full w-96 bg-white shadow-xl p-4 flex flex-col">
      <header class="relative flex items-center justify-between mb-3">
        <span class="absolute left-0 -top-2 inline-flex items-center justify-center min-w-6 h-6 px-1 rounded-full bg-slate-800 text-white text-xs font-semibold">
          {{ totalItems }}
        </span>
        <h3 class="font-semibold text-lg">Indkøbskurv</h3>
        <button class="px-2 py-1 rounded bg-slate-200" @click="$emit('close')">Luk</button>
      </header>

      <p v-if="isLoading">Henter…</p>
      <p v-if="error" class="text-red-600">{{ error }}</p>

      <ul class="flex-1 overflow-y-auto divide-y">
        <li v-for="item in items" :key="item.id" class="py-3 flex gap-3 items-center">
          <div class="w-12 h-12 rounded overflow-hidden bg-slate-200 flex items-center justify-center">
            <img
              :src="imgByItemId[item.id] || imgSrc(item)"
              :alt="item.product?.name || 'Product'"
              class="w-full h-full object-cover"
              @error="imgByItemId[item.id] = buildImageUrl('/placeholder.png')"
              loading="lazy"
            />
          </div>

          <div class="flex-1">
            <div class="font-medium">{{ item.product?.name || item.name || 'Produkt' }}</div>
            <div class="text-sm text-slate-600">Antal: {{ item.quantity || 0 }}</div>
            <p class="text-sm mt-1">
              Pris: {{ fmt(priceOf(item)) }} kr
              <span class="opacity-60">· I alt: {{ fmt(lineTotal(item)) }} kr</span>
            </p>
          </div>

          <button class="px-2 py-1 rounded bg-red-600 text-white" @click="removeFromCart(item.id)">Slet</button>
        </li>
      </ul>

      <footer class="pt-3 space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span class="font-medium">Subtotal</span>
          <span class="font-semibold">{{ fmt(subtotal) }} kr</span>
        </div>

        <button class="w-full px-4 py-2 rounded bg-slate-800 text-white" @click="onCheckout">
          Gå til betaling
        </button>
      </footer>
    </aside>
  </div>
</template>
