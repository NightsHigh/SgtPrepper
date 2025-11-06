<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@/composables/useCart'

const router = useRouter()
const { items, subtotal, clearCart } = useCart()
const form = ref({
  fullName: '',
  email: '',
  address: '',
  city: '',
  zip: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
})

function toNumber(v) {
  const n = Number(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount ?? 0)
}

const cartLines = computed(() => {
  const source = Array.isArray(items?.value) ? items.value : []
  return source.map((it) => {
    const product = it.product || {}
    const quantity = it.quantity ?? it.qty ?? 0
    const unitPrice = toNumber(product.price ?? it.price ?? 0)
    const name =
      product.title ||
      product.name ||
      it.name ||
      'Produkt'
    const key =
      it.id ??
      `${it.productId ?? product.id ?? name}-${product.slug ?? ''}`

    return {
      key,
      name,
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
    }
  })
})

const hasItems = computed(() => cartLines.value.length > 0)

const total = computed(() => {
  const fromSubtotal = typeof subtotal?.value === 'number' ? subtotal.value : NaN
  if (!Number.isNaN(fromSubtotal)) return fromSubtotal
  return cartLines.value.reduce((sum, line) => sum + line.lineTotal, 0)
})

async function handleSubmit() {
  if (!hasItems.value) {
    alert('Din kurv er tom. Læg venligst varer i kurven før du betaler.')
    return
  }

  if (!form.value.fullName || !form.value.email) {
    alert('Udfyld venligst navn og e-mail.')
    return
  }

  await clearCart()
  router.push({ name: 'success' })
}

</script>

<template>
  <section class="mx-auto max-w-6xl px-4 py-10">
    <h1 class="text-3xl font-bold tracking-tight mb-6">Betaling</h1>
    <p class="text-sm text-slate-600 mb-6">
      Dette er en undervisnings-demo. Der bliver ikke trukket rigtige penge, og din ordre bliver ikke sendt.
      Når du klikker <strong>Gennemfør betaling</strong>, kommer du videre til en kvitteringsside, som viser,
      hvordan en rigtig webshop kunne bekræfte din bestilling.
    </p>

    <div class="grid gap-8 md:grid-cols-[2fr,1.3fr]">
      <form class="space-y-6 bg-white rounded-xl shadow-sm p-6" @submit.prevent="handleSubmit">
        <h2 class="text-xl font-semibold mb-2">Faktureringsoplysninger</h2>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1" for="fullName">
              Fulde navn
            </label>
            <input
              id="fullName"
              v-model="form.fullName"
              type="text"
              required
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>

          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1" for="email">
              E-mail
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>

          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1" for="address">
              Adresse
            </label>
            <input
              id="address"
              v-model="form.address"
              type="text"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1" for="city">
              By
            </label>
            <input
              id="city"
              v-model="form.city"
              type="text"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1" for="zip">
              Postnummer
            </label>
            <input
              id="zip"
              v-model="form.zip"
              type="text"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </div>

        <h2 class="text-xl font-semibold mt-6 mb-2">Kortoplysninger</h2>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1" for="cardNumber">
              Kortnummer
            </label>
            <input
              id="cardNumber"
              v-model="form.cardNumber"
              type="text"
              inputmode="numeric"
              autocomplete="cc-number"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1" for="expiry">
              Udløbsdato (MM/ÅÅ)
            </label>
            <input
              id="expiry"
              v-model="form.expiry"
              type="text"
              inputmode="numeric"
              autocomplete="cc-exp"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1" for="cvc">
              CVC
            </label>
            <input
              id="cvc"
              v-model="form.cvc"
              type="text"
              inputmode="numeric"
              autocomplete="cc-csc"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </div>

        <button
          type="submit"
          class="mt-6 inline-flex w-full items-center justify-center rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
        >
          Gennemfør betaling
        </button>
      </form>

      <aside class="bg-slate-50 rounded-xl p-6 h-fit border border-slate-200">
        <h2 class="text-xl font-semibold mb-4">Din ordre</h2>

        <p v-if="!hasItems" class="text-slate-600">
          Din kurv er tom.
        </p>

        <div v-else class="space-y-4">
          <ul class="divide-y divide-slate-200">
            <li
              v-for="line in cartLines"
              :key="line.key"
              class="py-3 flex items-center justify-between text-sm"
            >
              <div>
                <div class="font-medium text-slate-900">
                  {{ line.quantity }} × {{ line.name }}
                </div>
              </div>
              <div class="text-slate-700 font-medium">
                {{ formatCurrency(line.lineTotal) }}
              </div>
            </li>
          </ul>

          <div class="border-t border-slate-200 pt-4 flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span>{{ formatCurrency(total) }}</span>
          </div>
          <p class="mt-1 text-xs text-slate-500">
            Alle beløb er i DKK og angivet inkl. moms. Eventuelle leveringsomkostninger er ikke medregnet i denne demo.
          </p>

        </div>
      </aside>
    </div>
  </section>
</template>
