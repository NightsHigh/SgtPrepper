<script>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import ProductList from '@/components/ProductList.vue'
import CategoryNavBar from '@/components/CategoryNavBar.vue'
import Hero from '@/components/Hero.vue'
import SignInModal from '@/components/SignInModal.vue'

export default {
  components: { Header, Footer, ProductList, CategoryNavBar, Hero, SignInModal },
  data() {
    return {
      IsLoggedIn: false,
      ShowSignIn: false,
    }
  },
  methods: {
    // Header button -> open modal
    OpenSignIn() {
      this.ShowSignIn = true
    },
    CloseSignIn() {
      this.ShowSignIn = false
    },
    async HandleLoginSubmit({ email, password }) {
      // TODO: call your API here
      // const ok = await api.login(email, password)
      // if (ok) { ... }

      this.IsLoggedIn = true
      this.ShowSignIn = false
    },
  },
}
</script>

<template>
  <div>
    <!-- Use header's event to OPEN modal (not toggle logged-in) -->
    <Header :isLoggedIn="IsLoggedIn" @toggle-login="OpenSignIn" />

    <CategoryNavBar />
    <Hero />
    <ProductList />
    <Footer />

    <!-- Sign-in modal -->
    <SignInModal
      :open="ShowSignIn"
      @close="CloseSignIn"
      @submit="HandleLoginSubmit"
    />
  </div>
</template>
