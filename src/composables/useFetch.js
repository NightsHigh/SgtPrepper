import { ref, onMounted, watch } from 'vue'

export function useFetch(url, { initial = null, map } = {}) {
  const data = ref(initial)
  const loading = ref(true)
  const error = ref(null)

  async function load(u) {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(u)
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const json = await res.json()
      data.value = typeof map === 'function' ? map(json) : json
    } catch (err) {
      error.value = err.message ?? String(err)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => load(typeof url === 'function' ? url() : url))

  if (typeof url === 'function') {
    watch(url, (u) => { if (u) load(u) })
  }

  return { data, loading, error }
}
