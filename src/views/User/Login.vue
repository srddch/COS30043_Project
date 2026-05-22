<template>
<div>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow p-4">
          <h3 class="text-center mb-4">Login</h3>

          <div class="mb-3">
            <label for="login-email" class="form-label">Email</label>
            <input
              id="login-email"
              name="email"
              v-model="email"
              type="email"
              class="form-control"
              :class="{ 'is-invalid': errors.email }"
              placeholder="your@email.com"
            >
            <div class="invalid-feedback">{{ errors.email }}</div>
          </div>

          <div class="mb-3">
            <label for="login-password" class="form-label">Password</label>
            <input
              id="login-password"
              name="password"
              v-model="password"
              type="password"
              class="form-control"
              :class="{ 'is-invalid': errors.password }"
            >
            <div class="invalid-feedback">{{ errors.password }}</div>
          </div>

          <button @click="handleLogin" class="btn btn-primary w-100" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>

          <!-- 忘记密码按钮 -->
          <div class="text-center mt-2">
            <button class="btn btn-link p-0" @click="showForgot = true">
              Forgot Password?
            </button>
          </div>

          <div class="text-center mt-1">
            No account?
            <a href="/register" class="btn btn-link p-0">Register here</a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 忘记密码弹窗 -->
  <div v-if="showForgot" class="modal-backdrop" @click="showForgot = false">
    <div class="modal-box" @click.stop>
      <h5 class="mb-3">Retrieve Password</h5>
      <input v-model="resetEmail" class="form-control mb-2" placeholder="Enter your email" />
      <button class="btn btn-primary w-100" @click="retrievePassword">Confirm</button>
      <button class="btn btn-link mt-2" @click="showForgot = false">Close</button>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const notify = inject('notify')

const email = ref('')
const password = ref('')
const loading = ref(false)
const errors = reactive({ email: '', password: '' })

// 忘记密码
const showForgot = ref(false)
const resetEmail = ref('')

const strength = ref(0)
const strengthText = ref('')
const color = ref('red')

const checkStrength = () => {
  const p = password.value
  let score = 0
  if (p.length >= 6) score += 25
  if (p.length >= 10) score += 25
  if (/[A-Z]/.test(p)) score += 25
  if (/[0-9]/.test(p)) score += 25

  strength.value = score
  if (score === 0) {
    strengthText.value = ''
    color.value = 'red'
  } else if (score <= 25) {
    strengthText.value = 'Weak'
    color.value = 'red'
  } else if (score <= 50) {
    strengthText.value = 'Medium'
    color.value = 'orange'
  } else if (score <= 75) {
    strengthText.value = 'Good'
    color.value = '#0d6efd'
  } else {
    strengthText.value = 'Strong'
    color.value = 'green'
  }
}

const validate = () => {
  errors.email = ''
  errors.password = ''
  let ok = true
  if (!email.value) { errors.email = 'Email is required'; ok = false }
  if (!password.value) { errors.password = 'Password is required'; ok = false }
  return ok
}

const handleLogin = async () => {
  loading.value = true

  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    const user = await res.json()

    if (!res.ok) {
      throw new Error(user.message || 'Login failed')
    }

    localStorage.setItem('user', JSON.stringify(user))
    notify('Login successful', 'bg-success')
    router.push('/')
  } 
  catch (err) {
    notify(err.message, 'bg-danger')
  } 
  finally {
    loading.value = false
  }
}

// 找回密码
const retrievePassword = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const user = users.find(u => u.email === resetEmail.value)
  if (!user) {
    notify('Email not found', 'bg-danger')
    return
  }
  alert('Your password: ' + user.password)
  showForgot.value = false
}
</script>

<style>
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
}
.modal-box {
  background: white; padding: 2rem; border-radius: 10px;
  width: 90%; max-width: 400px;
}
</style>