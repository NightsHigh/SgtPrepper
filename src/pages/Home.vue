<script setup>
import Hero from '../components/Hero.vue'
import CategoryNavBar from '../components/CategoryNavBar.vue'
import ProductList from '../components/ProductList.vue'
</script>

<template>
  <section aria-labelledby="home-heading">
    <h1 id="home-heading" class="sr-only">
      SgtPrepper demo-webshop
    </h1>
    <Hero />
    <CategoryNavBar />
    <ProductList :show-intro="true" />
  </section>
</template>
