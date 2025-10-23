<script>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import ProductList from '@/components/ProductList.vue';
import CategoryNavBar from './components/CategoryNavBar.vue';
import Hero from './components/Hero.vue';
export default {
  components: { Header, Footer, ProductList, CategoryNavBar, Hero },
  data() {
    return { IsLoggedIn: false }
  },
  methods: {
    ToggleLogin() {
      this.IsLoggedIn = !this.IsLoggedIn
    },
  },
}
</script>


<template>
  <div>
    <Header :isLoggedIn="IsLoggedIn" @toggle-login="ToggleLogin" />
    <CategoryNavBar />
    <Hero />
    <ProductList />
    <Footer />
  </div>
</template>

