<script setup>
import { RouterLink } from 'vue-router'

function openCookieSettings() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-cookie-settings'))
  }
}
</script>

<template>
  <footer
    class="mt-10 border-t border-slate-200 text-slate-100 bg-slate-900"
  >
    
    <div
      class="bg-[url('/Footer.png')] bg-cover bg-center bg-no-repeat"
    >
      
      <div class="bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-slate-900/80">
        <div
          class="mx-auto max-w-7xl px-4 py-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
        >
          <div class="text-sm space-y-1">
            <p class="font-semibold">SgtPrepper (demo-webshop)</p>
            <p>
              CVR: 12345678 · Forberedelsesvej 1, 9000 Aalborg<br />
              E-mail:
              <a
                href="mailto:kontakt@sgtprepper.demo"
                class="underline hover:text-white"
              >
                kontakt@sgtprepper.demo
              </a>
            </p>
            <p class="text-xs text-slate-200">
              Alle priser er i DKK inkl. moms. Eventuelle leveringsomkostninger
              vises i checkout (demo).
            </p>
          </div>

          <nav class="flex flex-wrap gap-8 text-sm">
            <div class="space-y-1">
              <p
                class="font-semibold text-xs uppercase tracking-wide text-slate-200"
              >
                Information
              </p>
              <RouterLink class="block hover:underline" :to="{ name: 'home' }">
                Forside
              </RouterLink>
              <RouterLink class="block hover:underline" :to="{ name: 'about' }">
                Om os
              </RouterLink>
              <RouterLink
                class="block hover:underline"
                :to="{ name: 'terms' }"
              >
                Handelsbetingelser
              </RouterLink>
              <RouterLink
                class="block hover:underline"
                :to="{ name: 'privacy' }"
              >
                Persondatapolitik
              </RouterLink>
            </div>

            <div class="space-y-1">
              <p
                class="font-semibold text-xs uppercase tracking-wide text-slate-200"
              >
                Cookies
              </p>
              <button
                type="button"
                class="text-left text-sm underline hover:text-white"
                @click="openCookieSettings"
              >
                Cookie-indstillinger
              </button>
            </div>
          </nav>
        </div>
      </div>
    </div>
  </footer>
</template>
