<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  product: { type: Object, required: true }
})

const emit = defineEmits(['add-to-cart'])

const router = useRouter()

const priceText = computed(() => {
  const price = typeof props.product.price === 'number'
    ? props.product.price
    : Number(props.product.price || 0)
  if (!Number.isFinite(price)) return ''
  return new Intl.NumberFormat('da-DK', { minimumFractionDigits: 0 }).format(Math.round(price)) + ' kr inkl. moms'
})

const stockLabel = computed(() => {
  const stock = props.product.stock
  if (typeof stock !== 'number') return ''
  if (stock <= 0) return 'Ikke på lager'
  if (stock <= 10) return 'Få stk. på lager'
  return 'På lager'
})

const stockClass = computed(() => {
  const stock = props.product.stock
  if (typeof stock !== 'number') return ''
  if (stock <= 0) return 'text-red-600'
  if (stock <= 10) return 'text-amber-600'
  return 'text-emerald-600'
})

function openDetails() {
  const categorySlug = props.product.category && props.product.category.slug ? props.product.category.slug : 'ukendt'
  router.push({
    name: 'product',
    params: {
      categorySlug,
      slug: props.product.slug
    }
  })
}

function onAddToCart() {
  emit('add-to-cart', props.product)
}
</script>

<template>
  <article class="flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
    <button type="button" class="relative block aspect-[4/3] w-full bg-slate-100" @click="openDetails">
      <img
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.name || 'Produkt'"
        loading="lazy"
        class="h-full w-full object-cover"
      />
      <div v-else class="flex h-full w-full items-center justify-center text-xs text-slate-400">
        Intet billede
      </div>
    </button>

    <div class="flex flex-1 flex-col p-4">
      <h2 class="text-sm font-semibold text-slate-900 line-clamp-2">
        {{ product.name }}
      </h2>
      <p v-if="product.teaser" class="mt-1 text-xs text-slate-600 line-clamp-2">
        {{ product.teaser }}
      </p>

      <div class="mt-3 text-sm font-medium" v-if="priceText">
        {{ priceText }}
      </div>
      <div v-if="stockLabel" class="mt-1 text-xs" :class="stockClass">
        {{ stockLabel }}
      </div>

      <div class="mt-4 flex items-center justify-between">
        <button
          type="button"
          class="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          :disabled="product.stock !== undefined && product.stock <= 0"
          @click="onAddToCart"
        >
          Læg i kurv
        </button>
        <button
          type="button"
          class="text-xs text-slate-600 hover:text-slate-900 underline"
          @click="openDetails"
        >
          Se detaljer
        </button>
      </div>
    </div>
  </article>
</template>
