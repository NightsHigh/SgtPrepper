<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const cart = ref(loadCart())

const total = computed(() => cart.value.reduce((sum, it) => sum + toNum(it.price) * it.qty, 0))
function toNum(p) {
  const s = String(p ?? '').replace(/\s|DKK|kr\.?|/gi, '')
  return Number(s.replace(',', '.')) || 0
}
function fmt(n) {
  return n.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DKK'
}
function submit() {
  // simulate success
  clearCart()
  router.push({ name: 'success' })
}
function loadCart() {
  try { return JSON.parse(localStorage.getItem('sp_cart_v1') || '[]') } catch { return [] }
}
function clearCart() {
  try { localStorage.setItem('sp_cart_v1', '[]') } catch {}
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-6">
    <div class="grid md:grid-cols-2 gap-8">
      <!-- Customer / Payment form -->
      <form @submit.prevent="submit" class="rounded-2xl bg-white p-6 ring-1 ring-slate-200 space-y-6">
        <h2 class="text-2xl font-bold">Kundeoplysninger</h2>

        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Navn *</label>
            <input required class="w-full rounded-lg border px-3 py-2" placeholder="Poul Poulsen" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Telefonnummer *</label>
            <input required class="w-full rounded-lg border px-3 py-2" placeholder="00 00 00 00" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">By *</label>
            <input required class="w-full rounded-lg border px-3 py-2" placeholder="By" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Adresse *</label>
            <input required class="w-full rounded-lg border px-3 py-2" placeholder="Adressevej 0" />
          </div>
        </div>

        <h3 class="text-2xl font-bold">Kortbetaling</h3>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Kort *</label>
            <input required class="w-full rounded-lg border px-3 py-2" placeholder="0123 4567 8910" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Sikkerhedskode *</label>
            <input required class="w-full rounded-lg border px-3 py-2" placeholder="1234" />
          </div>
        </div>

        <div class="flex justify-end">
          <button class="rounded-full bg-emerald-600 text-white px-6 py-3 text-lg hover:bg-emerald-700">
            Betal
          </button>
        </div>
      </form>

      <!-- Cart summary -->
      <aside class="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <h3 class="text-xl font-bold mb-4">Kurvoversigt</h3>
        <ul class="divide-y">
          <li v-for="it in cart" :key="it.slug || it.id" class="py-3 flex items-center justify-between">
            <div class="font-medium">{{ it.qty }} × {{ it.name }}</div>
            <div class="text-slate-700">{{ fmt(toNum(it.price) * it.qty) }}</div>
          </li>
        </ul>

        <div class="mt-4 border-t pt-4 flex items-center justify-between text-lg font-bold">
          <span>Total:</span>
          <span>{{ fmt(total) }}</span>
        </div>
      </aside>
    </div>
  </section>
</template>
