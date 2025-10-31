import { createRouter, createWebHistory } from 'vue-router'
import ProductList from '@/components/ProductList.vue'
import ProductDetails from '@/pages/ProductDetails.vue'
import Checkout from '@/pages/Checkout.vue'   // 👈 NEW
import Success from '@/pages/Success.vue'     // 👈 NEW

const routes = [
  { path: '/', name: 'home', component: ProductList },
  { path: '/product/:slug', name: 'product', component: ProductDetails, props: true },
  { path: '/checkout', name: 'checkout', component: Checkout },  // 👈
  { path: '/success', name: 'success', component: Success },     // 👈
]

export default createRouter({ history: createWebHistory(), routes })
