// src/composables/useCart.js
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const API_PORT = import.meta.env.VITE_API_PORT || 4000
const API = `http://localhost:${API_PORT}/api`

const items = ref([])
const isLoading = ref(false)
const error = ref('')

export function useCart() {
  const { authHeader } = useAuth()

  const count = computed(() => items.value.reduce((n, i) => n + (i.quantity || 0), 0))

  async function fetchCart() {
    isLoading.value = true
    error.value = ''
    try {
      const res = await fetch(`${API}/cart`, { headers: { ...authHeader() } })
      if (!res.ok) throw new Error(`GET /cart failed: ${res.status}`)
      items.value = await res.json()
    } catch (e) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function addToCart(productId, quantity = 1) {
    error.value = ''
    const res = await fetch(`${API}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ productId, quantity }),
    })
    if (!res.ok) throw new Error(`POST /cart failed: ${res.status}`)
    await fetchCart()
  }

  async function removeFromCart(cartItemId) {
    error.value = ''
    const res = await fetch(`${API}/cart/${cartItemId}`, {
      method: 'DELETE',
      headers: { ...authHeader() },
    })
    if (!res.ok) throw new Error(`DELETE /cart/${cartItemId} failed: ${res.status}`)
    items.value = items.value.filter(i => i.id !== cartItemId)
  }

  return { items, count, isLoading, error, fetchCart, addToCart, removeFromCart }
}
