<script setup>
import { computed } from 'vue'
import CategoryNavBar from '../components/CategoryNavBar.vue'
import ProductList from '../components/ProductList.vue'
import { useCategories } from '../composables/useCategories'

const props = defineProps({
  slug: { type: String, required: true }
})

const { categories } = useCategories()

const currentCategory = computed(() =>
  categories.value.find(cat => cat.slug === props.slug) || null
)

const heading = computed(() =>
  currentCategory.value ? currentCategory.value.title : 'Produkter i kategori'
)
</script>

<template>
  <section aria-labelledby="category-heading">
    <h1 id="category-heading" class="sr-only">
      {{ heading }}
    </h1>
    <CategoryNavBar />
    <ProductList :category-slug="slug" :heading="heading" />
  </section>
</template>
