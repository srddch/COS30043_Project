<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow p-4">
          <h3 class="text-center mb-4">My Account</h3>

          <div class="mb-3">
            <label class="form-label text-muted">Full Name</label>
            <input type="text" class="form-control" :value="user?.full_name" disabled />
          </div>

          <div class="mb-3">
            <label class="form-label text-muted">Email</label>
            <input type="text" class="form-control" :value="user?.email" disabled />
          </div>
          
          <div class="mb-3" v-if="user?.role === 'student'">
            <label class="form-label text-muted">Student ID</label>
            <input type="text" class="form-control" :value="user?.student_id || 'Not set'" disabled />
          </div>

          <div class="mb-3" v-else-if="user?.role === 'teacher'">
            <label class="form-label text-muted">Staff ID</label>
            <input type="text" class="form-control" :value="user?.staff_id || 'Not set'" disabled />
          </div>

          <button class="btn btn-danger w-100 mt-3" @click="handleLogout">
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUser } from './composables/useUser'
import { useRouter } from 'vue-router'
import { inject } from 'vue'

const { user, logout } = useUser() 
const router = useRouter()
const notify = inject('notify')

const handleLogout = () => {
  logout() 
  notify('Logged out successfully', 'bg-success')
  router.push('/login')
}
</script>