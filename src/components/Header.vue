<script>
import { ShoppingCartIcon } from '@heroicons/vue/24/solid'

export default {
  props: ['isLoggedIn'],
  components: { ShoppingCartIcon },
}
</script>

<template>
  <header class="flex justify-between items-center p-4 shadow-md bg-[#334156]">
    <img src="../../Logo.png" alt="Logo" class="h-10" />
    <div class="flex items-center gap-4">
      <button
        id="LogInBtn"
        @click="$emit('toggle-login')"
        class="px-3 py-1 bg-white rounded-md hover:bg-gray-100 transition rounded-5xl"
      >
        {{ isLoggedIn ? 'Log ud!' : 'Log ind' }}
      </button>
      <figure>
        <ShoppingCartIcon class="w-6 h-6 text-gray-300" />
      </figure>
    </div>
  </header>
</template>
