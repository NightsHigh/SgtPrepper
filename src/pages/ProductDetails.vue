<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useFetch } from '@/composables/useFetch'

const route = useRoute()
const category = computed(() => String(route.params.category || ''))
const slug = computed(() => String(route.params.slug || ''))

const endpoint = computed(() => `http://localhost:4000/api/products/${category.value}/${slug.value}`)

const { data, loading, error } = useFetch(() => endpoint.value, { initial: null })
const product = computed(() => data.value)

const BASE = 'http://localhost:4000'
const imgSrc = (p) => {
  const url = p?.imageUrl ?? p?.image
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${BASE.replace(/\/$/, '')}/${String(url).replace(/^\//, '')}`
}
const fmtPrice = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? `${n.toLocaleString('da-DK')},00` : v
}

function sanitizeHtml(html = '') {
  const template = document.createElement('template')
  template.innerHTML = html

  template.content.querySelectorAll('script,style').forEach(n => n.remove())

  template.content.querySelectorAll('*').forEach(el => {
    ;[...el.attributes].forEach(attr => {
      if (/^on/i.test(attr.name)) el.removeAttribute(attr.name)
    })
  })

  return template.innerHTML
}

const safeDescription = computed(() => sanitizeHtml(product.value?.description || ''))
</script>

<template>
  <section class="mx-auto max-w-5xl px-4 py-8">
    <RouterLink
      :to="{ name: 'category', params: { slug: category } }"
      class="text-sm text-blue-600 hover:underline"
    >
      ← Tilbage
    </RouterLink>

    <p v-if="loading" class="mt-6 text-gray-600">Indlæser…</p>
    <p v-else-if="error" class="mt-6 text-red-600">Fejl: {{ error }}</p>
    <p v-else-if="!product" class="mt-6 text-gray-600">Produkt ikke fundet.</p>

    <div v-else class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="rounded-xl bg-gray-100 aspect-square flex items-center justify-center overflow-hidden">
        <img v-if="imgSrc(product)" :src="imgSrc(product)" :alt="product.name" class="w-full h-full object-contain" />
        <span v-else class="text-gray-400">Intet billede</span>
      </div>

      <div>
        <h1 class="text-2xl md:text-3xl font-semibold text-gray-900">
          {{ product.name }}
        </h1>

        <div class="mt-3 flex flex-wrap gap-3 text-sm text-gray-700">
          <span v-if="product.brand?.name" class="px-2 py-1 rounded bg-gray-100">Brand: {{ product.brand.name }}</span>
          <span v-if="product.category?.name" class="px-2 py-1 rounded bg-gray-100">Kategori: {{ product.category.name }}</span>
          <span v-if="product.stock != null" class="px-2 py-1 rounded bg-gray-100">
            Lager: {{ product.stock > 0 ? 'På lager' : 'Udsolgt' }}
          </span>
        </div>

        <p class="mt-4 text-2xl font-bold text-gray-900" v-if="product.price != null">
          {{ fmtPrice(product.price) }} kr
        </p>

        <div class="mt-6 prose prose-neutral max-w-none product-description" v-html="safeDescription"></div>

        <div class="mt-8">
          <button class="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition">
            Læg i kurv
          </button>
        </div>
      </div>
    </div>
  </section>
</template>