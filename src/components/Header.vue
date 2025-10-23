<template>
  <header class="flex justify-between items-center p-4 shadow-md bg-[#334156]">
    <img src="../../Logo.png" alt="Logo" class="h-10" />
    <div class="flex items-center gap-4">
      <button
        id="LogInBtn"
        @click="$emit('toggle-login')"
        class="px-3 py-1 bg-white rounded-md hover:bg-gray-100 transition"
      >
        {{ isLoggedIn ? 'Log ud!' : 'Log in.' }}
      </button>
      <figure>
        <ShoppingCartIcon class="w-6 h-6 text-gray-600" />
      </figure>
    </div>
  </header>
</template>

<script>
import { ShoppingCartIcon } from '@heroicons/vue/24/solid'
export default {
  props: ['isLoggedIn'],
  components: { ShoppingCartIcon },
}
</script>
