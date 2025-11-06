# Beginner Guide – Vue Webshop Frontend

This project is a **Vue 3 + Vite + Tailwind CSS** frontend for a small webshop.

The most important ideas:

- The app starts in `src/main.js`.
- Routes (pages) are defined in `src/router/index.js`.
- Reusable building blocks live in `src/components/`.
- Full pages (like Home, Checkout, Success) live in `src/pages/`.
- Shared logic (like the cart) lives in `src/composables/`.
- Small helper functions live in `src/lib/`.

If you are new to Vue, read this file together with the code. It is written to help you connect *what you see on the screen* with *where it lives in the code*.

## 1. Entry point – `src/main.js`

This is where the Vue app is created:

- Imports global CSS.
- Creates the Vue app from `App.vue`.
- Installs the router.
- Sets up basic analytics for page views.
- Mounts the app on `<div id="app">` in `index.html`.

You usually do **not** need to change this file often.

## 2. Root component – `src/App.vue`

`App.vue` is the root layout of the app:

- Renders the **header**, the **main page content**, and the **footer**.
- It also shows:
  - The cart drawer (when the user opens the cart).
  - The sign-in modal.
  - The cookie consent banner.

`<RouterView />` is where the current page is rendered (home page, product page, checkout, etc.).

## 3. Routing – `src/router/index.js`

The router file defines which Vue component should show for which URL:

- `/` → product list (home page)
- `/product/:slug` → product details
- `/checkout` → checkout page
- `/success` → success/receipt page
- `/om`, `/handelsbetingelser`, `/persondatapolitik` → static info pages

Each route has:
- `path` – the URL.
- `name` – the route name used inside the code.
- `component` – which Vue component to render.

## 4. Pages – `src/pages/`

The most important pages are:

- **`Home.vue` or `ProductList` route**: shows a list/grid of products.
- **`ProductDetails.vue`**: shows a single product with details and reviews.
- **`Checkout.vue`**: shows the checkout form and the cart summary.
- **`Success.vue`**: shows a fake order confirmation.

These pages usually:
- Import composables for data (for example `useCart()`).
- Gather data and methods in `<script setup>`.
- Describe the HTML structure & Tailwind CSS classes in `<template>`.

## 5. Components – `src/components/`

Components are smaller building blocks that can be reused:

- `Header.vue` – top navigation bar and login/logout area.
- `Footer.vue` – footer with company info and legal links.
- `ProductCard.vue` – card for a single product in a list.
- `ProductList.vue` – the main product list on the homepage.
- `Cart.vue` – the mini cart content.
- `CartDrawer.vue` – the sliding panel that shows the cart on the right.
- `CookieBanner.vue` – cookie consent banner.
- `SignInModal.vue` – login modal.

They usually receive data as **props** and emit events or call functions passed from the parent.

## 6. Composables – `src/composables/`

Composables are functions that contain reusable logic. They all start with `use...`.

### `useCart.js`

This composable:

- Stores the cart items (`items`).
- Keeps track of loading and error state.
- Knows how to **load the cart** from the backend (`fetchCart`).
- Knows how to **add an item** to the cart (`addToCart`).
- Knows how to **remove an item** from the cart (`removeFromCart`).
- Knows how to **clear the cart** (`clearCart`) – used after payment.
- Calculates the **subtotal price** of the cart (`subtotal`).

Any component that needs cart data can do:

```js
import { useCart } from '@/composables/useCart'

const { items, subtotal, addToCart, removeFromCart, clearCart } = useCart()
```

### `useAuth.js`

This composable:

- Stores information about the current user and tokens.
- Exposes a small API:
  - `isLoggedIn`
  - `user`
  - `login`
  - `logout`
  - `authHeader()` – returns headers for authenticated API calls.

### `useFetch.js` and `useApi.js`

These helpers simplify calling the backend API:

- `useFetch` is a small wrapper around `fetch` that manages:
  - `data`
  - `loading`
  - `error`
- `useApi` sets the correct base URL for the backend and makes it easier to call endpoints.

## 7. Lib helpers – `src/lib/`

- `apiFetch.js` – low-level wrapper for `fetch` with JSON parsing and error handling.
- `slugify.js` – turns a product name like `"Survival Knife Pro"` into a URL-friendly slug like `"survival-knife-pro"`.
- `analytics.js` – small helper functions for cookie consent and tracking page views or “add to cart” actions.

## 8. Cart flow – how it all connects

1. On the product list or product details page, when the user clicks **“Add to cart”**, the component calls `addToCart(productId, quantity)` from `useCart()`.
2. `useCart` sends a POST request to `/api/cart` on the backend and then reloads the cart with `fetchCart`.
3. The header and cart drawer use `useCart()` too, so they automatically see the updated cart data (because `items` is a shared `ref`).
4. On the **checkout page**, the cart contents and totals come from `useCart()`:
   - `items` are converted into `cartLines` for display.
   - `subtotal` is used to show the total price.
5. When the user submits the checkout form:
   - The form validates that there are items and the user filled in the required fields.
   - `clearCart()` is called to remove all items from the cart on the backend.
   - The router sends the user to the `/success` page.
6. If the user goes back to the shop, the cart starts empty again.

## 9. How to read a single-file component (SFC)

A typical Vue component looks like this:

```vue
<script setup>
// 1. Import tools and composables
import { ref, computed } from 'vue'
import { useCart } from '@/composables/useCart'

// 2. Setup state and methods
const { items } = useCart()
const count = computed(() => items.value.length)
</script>

<template>
  <!-- 3. Describe what should be rendered -->
  <p>There are {{ count }} items in your cart.</p>
</template>

<style scoped>
/* 4. Optional component-specific styling */
</style>
```

In this project:
- Most of the logic lives in `<script setup>`.
- The visible HTML structure lives in `<template>`.
- Tailwind CSS is used for styling instead of writing a lot of custom CSS.

---

If you are a complete beginner in Vue:

1. Start with `src/main.js`, then `src/App.vue`.
2. Look at `src/router/index.js` to see which page components exist.
3. Open `src/components/ProductList.vue` and `src/pages/ProductDetails.vue` to see how products are shown.
4. Finally, read `src/composables/useCart.js` to understand how cart data is shared.
