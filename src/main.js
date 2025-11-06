import './assets/css/tailwind.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initFromStoredConsent, trackPageView } from '@/lib/analytics'

const app = createApp(App)

app.use(router)

initFromStoredConsent()

router.afterEach((to) => {
  trackPageView(to)
})

app.mount('#app')
