import { createRouter, createWebHistory } from 'vue-router'
import ProductList from '@/components/ProductList.vue'

const routes = [
  { path: '/', name: 'home', component: ProductList },
  { path: '/category/:slug', name: 'category', component: ProductList },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } }
})

export default router
