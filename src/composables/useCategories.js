import { ref } from 'vue'
import { apiFetch } from './useApi'

const categories = ref([])
const loading = ref(false)
const error = ref('')

async function loadCategoriesInternal() {
  loading.value = true
  error.value = ''
  try {
    const res = await apiFetch('/categories')
    if (!res.ok) {
      throw new Error('Failed to load categories')
    }
    const data = await res.json()
    categories.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value = 'Kunne ikke hente kategorier.'
  } finally {
    loading.value = false
  }
}

export function useCategories() {
  if (!categories.value.length && !loading.value) {
    loadCategoriesInternal()
  }

  return {
    categories,
    loading,
    error,
    reload: loadCategoriesInternal
  }
}
