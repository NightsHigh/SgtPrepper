<script>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import ProductList from '@/components/ProductList.vue'
import CategoryNavBar from '@/components/CategoryNavBar.vue'
import Hero from '@/components/Hero.vue'
import SignInModal from '@/components/SignInModal.vue'

export default {
  components: { Header, Footer, ProductList, CategoryNavBar, Hero, SignInModal },
  data() {
    return {
      IsLoggedIn: false,
      ShowSignIn: false,
      user: null,
    }
  },
  computed: {
    fullName() {
      return this.user ? `${this.user.firstname} ${this.user.lastname}` : ''
    },
  },
  created() {
    const saved = localStorage.getItem('user')
    if (saved) {
      this.user = JSON.parse(saved)
      this.IsLoggedIn = true
    }
  },
methods: {
  OpenSignIn() {
    this.ShowSignIn = true
  },
  CloseSignIn() {
    this.ShowSignIn = false
  },

  async HandleLoginSubmit({ email, password }) {
    try {
      this.IsLoggedIn = false
      this.user = null
      localStorage.removeItem('user')

      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      })

      if (loginRes.ok) {
        const data = await loginRes.json()
        if (!data?.user) throw new Error('Missing user in response')
        this.user = data.user
        this.IsLoggedIn = true
        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('accessToken', data.accessToken || '')
        localStorage.setItem('refreshToken', data.refreshToken || '')
        this.ShowSignIn = false
        return
      }

      if (loginRes.status === 401) {
        const usersRes = await fetch('/api/users', { headers: { 'Content-Type': 'application/json' } })
        if (!usersRes.ok) throw new Error('Could not fetch users')

        const list = await usersRes.json()
        const match = Array.isArray(list)
          ? list.find(u => (u.email || '').toLowerCase() === email.toLowerCase())
          : null

        if (!match) {
          throw new Error('Ingen bruger fundet for den e-mail')
        }

        this.user = { id: match.id, firstname: match.firstname, lastname: match.lastname, email: match.email }
        this.IsLoggedIn = true
        localStorage.setItem('user', JSON.stringify(this.user))
        this.ShowSignIn = false
        return
      }

      let msg = 'Login failed'
      try {
        const err = await loginRes.json()
        if (err?.message) msg = err.message
      } catch {}
      throw new Error(msg)
    } catch (e) {
      console.error(e)
      alert(e.message || 'Kunne ikke logge ind eller hente brugerdata')
    }
  },

  HandleLogout() {
    this.IsLoggedIn = false
    this.user = null
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },
}


}
</script>


<template>
  <div>
    <Header
      :isLoggedIn="IsLoggedIn"
      :user="user"
      :fullName="fullName"
      @toggle-login="OpenSignIn"
      @logout="HandleLogout"
    />

    <CategoryNavBar />
    <router-view />
    <Footer />

    <SignInModal
      :open="ShowSignIn"
      @close="CloseSignIn"
      @submit="HandleLoginSubmit"
    />
  </div>
</template>

