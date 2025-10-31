<script setup>
import { useCart } from '@/composables/useCart'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close', 'checkout'])

const { items, isLoading, error, removeFromCart } = useCart()

function onCheckout() {
  // No checkout API in backend yet — just emit so parent can handle UI
  emit('checkout', items)
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/40" @click="$emit('close')" />
    <aside class="absolute right-0 top-0 h-full w-96 bg-white shadow-xl p-4 flex flex-col">
      <header class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-lg">Indkøbskurv</h3>
        <button class="px-2 py-1 rounded bg-slate-200" @click="$emit('close')">Luk</button>
      </header>

      <p v-if="isLoading">Henter…</p>
      <p v-if="error" class="text-red-600">{{ error }}</p>

      <ul class="flex-1 overflow-y-auto divide-y">
        <li v-for="item in items" :key="item.id" class="py-3 flex gap-3 items-center">
          <img :src="item.product?.imageUrl || item.product?.image" class="w-12 h-12 object-cover rounded" />
          <div class="flex-1">
            <p class="font-medium">{{ item.product?.name || 'Vare' }}</p>
            <p class="text-sm opacity-70">Antal: {{ item.quantity }}</p>
          </div>
          <button class="px-2 py-1 rounded bg-red-600 text-white" @click="removeFromCart(item.id)">Slet</button>
        </li>
      </ul>

      <footer class="pt-3 space-y-2">
        <button class="w-full px-4 py-2 rounded bg-slate-800 text-white" @click="onCheckout">
          Gå til betaling
        </button>
        <p class="text-xs text-slate-500">
          (Ingen checkout-route i API endnu—knappen sender kun et event.)
        </p>
      </footer>
    </aside>
  </div>
</template>
