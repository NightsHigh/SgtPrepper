// src/composables/useFetch.js
import { ref, onMounted } from 'vue'

export function useFetch(url, { initial = null, immediate = true, options = {} } = {}) {
  const data = ref(initial)
  const loading = ref(false)
  const error = ref(null)

  async function run(customUrl = url, customOptions = options) {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(customUrl, customOptions)
      const ctype = res.headers.get('content-type') || ''
      const payload = ctype.includes('application/json')
        ? await res.json().catch(() => ({}))
        : await res.text().catch(() => '')
      if (!res.ok) throw new Error(payload?.message || `Request failed (${res.status})`)
      data.value = payload
    } catch (e) {
      error.value = e.message || String(e)
    } finally {
      loading.value = false
    }
  }

  if (immediate) onMounted(() => { run() })

  return { data, loading, error, run }
}
