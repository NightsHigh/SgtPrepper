<script>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import CategoryNavBar from '@/components/CategoryNavBar.vue'
import ProductList from '@/components/ProductList.vue'
import SignInModal from '@/components/SignInModal.vue'
import CartDrawer from '@/components/CartDrawer.vue'
import CookieBanner from '@/components/CookieBanner.vue'
import { useCart } from '@/composables/useCart'
import { useAuth } from '@/composables/useAuth'

export default {
  components: { Header, Footer, CategoryNavBar, ProductList, SignInModal, CartDrawer, CookieBanner },
  setup() {
    const cart = useCart()
    const { state, setAuth, logout } = useAuth()
    return { cart, authState: state, setAuth, logout }
  },
  data() {
    return {
      IsLoggedIn: false,
      user: null,
      ShowSignIn: false,
      isAuthLoading: false,
      authError: '',
      SelectedCategoryId: null,
      ShowCart: false,
    }
  },
  watch: {
    IsLoggedIn(next) {
      if (next) this.cart.fetchCart()
      else this.cart.items = []
    }
  },
  mounted() {
    this.IsLoggedIn = !!this.authState.accessToken
    this.user = this.authState.user
    if (this.IsLoggedIn) this.cart.fetchCart()
  },
  methods: {
    OnSelectCategory(slug) {
      this.SelectedCategoryId = slug
      if (this.$route?.name !== 'home') this.$router?.push?.({ name: 'home' })
    },
    ToggleLogin() {
      if (this.IsLoggedIn) {
        this.logout()
        this.IsLoggedIn = false
        this.user = null
        this.cart.items = []
      } else {
        this.OpenSignIn()
      }
    },
    OpenSignIn() { this.ShowSignIn = true },
    CloseSignIn() { this.ShowSignIn = false },
    async HandleLoginSubmit({ email, password }) {
      this.isAuthLoading = true
      this.authError = ''
      const API_PORT = import.meta.env.VITE_API_PORT || 4000
      const API = `http://localhost:${API_PORT}/api`
      try {
        const res = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Login failed')

        this.setAuth({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user })
        this.IsLoggedIn = true
        this.user = data.user
        this.ShowSignIn = false
        await this.cart.fetchCart()
      } catch (e) {
        this.authError = e.message || String(e)
      } finally {
        this.isAuthLoading = false
      }
    },
    async AddToCart(productId, qty = 1) {
      if (!this.IsLoggedIn) { this.OpenSignIn(); return }
      await this.cart.addToCart(productId, qty)
    },
  },
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    <Header
      :isLoggedIn="IsLoggedIn"
      :user="user"
      :cartCount="cart.count?.value ?? 0"
      @toggle-login="ToggleLogin"
      @open-cart="ShowCart = true"
    />

    <CategoryNavBar @select-category="OnSelectCategory" />

    <main class="flex-1">
      <router-view
        :selectedCategoryId="SelectedCategoryId"
        :isLoggedIn="IsLoggedIn"
        :addToCart="AddToCart"
        :openLogin="OpenSignIn"
      />
    </main>

    <Footer />

    <SignInModal
      :open="ShowSignIn"
      :loading="isAuthLoading"
      :error="authError"
      @close="CloseSignIn"
      @submit="HandleLoginSubmit"
    />

    <CartDrawer
      :open="ShowCart"
      @close="ShowCart = false"
      @checkout="$router?.push?.({ name: 'checkout' })"
    />
    <CookieBanner />
  </div></template>
