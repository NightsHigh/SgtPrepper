<script>
export default {
  props: {
    isLoggedIn: { type: Boolean, default: false },
    user: { type: Object, default: null },
    fullName: { type: String, default: '' },
  },
  methods: {
    onLoginClick() {
      this.$emit('toggle-login')
    },
    onLogoutClick() {
      this.$emit('logout')
    },
  },
}
</script>


<template>
  <header class="flex justify-between items-center p-4 bg-[#64758B] shadow-md">
    <img src="../../Logo.png" alt="App Logo" class="w-10" />

    <div class="flex items-center gap-4">
      <template v-if="isLoggedIn">
      <template v-if="isLoggedIn && user">
        Hej, {{ fullName || (user.firstname + ' ' + user.lastname) }}
      </template>


        <button
          @click="onLogoutClick"
          class="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
        >
          Log ud
        </button>
      </template>

      <template v-else>
        <button
          @click="onLoginClick"
          class="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Log ind
        </button>
      </template>

      <img src="@/assets/images/Shoppingcart.svg" alt="Indkøbskurv" class="w-8" />
    </div>
  </header>
</template>

