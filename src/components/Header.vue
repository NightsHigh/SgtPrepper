<script setup>
import { computed } from 'vue'
import { FaShoppingBasket } from 'vue-icons-plus/fa'

const props = defineProps({
  isLoggedIn: { type: Boolean, default: false },
  user: { type: Object, default: null },
  cartCount: { type: Number, default: 0 },    // ✅ added
})
const emit = defineEmits(['toggle-login', 'logout', 'open-cart']) // ✅ added

const displayName = computed(() => {
  if (!props.user) return ''
  const names = [props.user.firstname, props.user.lastname].filter(Boolean).join(' ')
  return names || props.user?.email || 'Bruger'
})
</script>

<template>
  <header class="sticky top-0 z-40 bg-slate-800/95 text-white backdrop-blur">
    <div class="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
      <img src="/Logo.png" alt="Logo" class="h-8" />

      <div class="flex items-center gap-3">
        <span v-if="isLoggedIn" class="text-sm opacity-80">Hej {{ displayName }}</span>

        <button
          class="px-3 py-1 rounded bg-white/10 hover:bg-white/20"
          @click="$emit('toggle-login')">
          {{ isLoggedIn ? 'Log ud' : 'Log ind' }}
        </button>

        <button
          class="relative grid place-items-center w-9 h-9 rounded-md bg-white/10 hover:bg-white/20"
          @click="$emit('open-cart')"
          aria-label="Åbn kurv">
          <FaShoppingBasket class="w-5 h-5" />
          <span
            v-if="cartCount > 0"
            class="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-semibold grid place-items-center">
            {{ cartCount }}
          </span>
        </button>
      </div>
    </div>
  </header>
</template>
