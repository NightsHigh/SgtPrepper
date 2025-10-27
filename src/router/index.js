import { createRouter, createWebHistory } from 'vue-router'
import ProductList from '@/components/ProductList.vue'
import ProductDetails from '@/pages/ProductDetails.vue'

const routes = [
  { path: '/', name: 'home', component: ProductList },
  { path: '/category/:slug', name: 'category', component: ProductList },
  { path: '/product/:category/:slug', name: 'product', component: ProductDetails },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } }
})

export default router
