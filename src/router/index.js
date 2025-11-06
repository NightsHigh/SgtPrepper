import { createRouter, createWebHistory } from 'vue-router'
import ProductList from '@/components/ProductList.vue'
import ProductDetails from '@/pages/ProductDetails.vue'
import Checkout from '@/pages/Checkout.vue'
import Success from '@/pages/Success.vue'
import About from '@/pages/About.vue'
import Terms from '@/pages/Terms.vue'
import Privacy from '@/pages/Privacy.vue'

const routes = [
  { path: '/', name: 'home', component: ProductList },
  { path: '/product/:slug', name: 'product', component: ProductDetails, props: true },
  { path: '/checkout', name: 'checkout', component: Checkout },
  { path: '/success', name: 'success', component: Success },

  { path: '/om', name: 'about', component: About },
  { path: '/handelsbetingelser', name: 'terms', component: Terms },
  { path: '/persondatapolitik', name: 'privacy', component: Privacy },
]

export default createRouter({ history: createWebHistory(), routes })
