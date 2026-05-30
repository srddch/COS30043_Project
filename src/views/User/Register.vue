<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow p-4">
          <h3 class="text-center mb-4">Register</h3>

          <!-- 名 First Name -->
          <div class="mb-3">
            <label class="form-label">First Name</label>
            <input
              v-model="firstName"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.firstName }"
            >
            <div class="invalid-feedback">{{ errors.firstName }}</div>
          </div>

          <!-- 姓 Last Name -->
          <div class="mb-3">
            <label class="form-label">Last Name</label>
            <input
              v-model="lastName"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.lastName }"
            >
            <div class="invalid-feedback">{{ errors.lastName }}</div>
          </div>

          <!-- 邮箱 -->
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input
              v-model="email"
              type="email"
              class="form-control"
              :class="{ 'is-invalid': errors.email }"
            >
            <div class="invalid-feedback">{{ errors.email }}</div>
          </div>

          <!-- 身份 -->
          <div class="mb-3">
            <label class="form-label">Role</label>
            <select v-model="role" class="form-select">
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <!-- 学生 ID -->
          <div class="mb-3" v-if="role === 'student'">
            <label class="form-label">Student ID</label>
            <input
              v-model="studentId"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.studentId }"
              placeholder="7-digit student ID"
            />
            <div class="invalid-feedback">{{ errors.studentId }}</div>
          </div>

          <!-- 教师 ID -->
          <div class="mb-3" v-if="role === 'teacher'">
            <label class="form-label">Staff ID</label>
            <input
              v-model="staffId"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.staffId }"
              placeholder="7-digit staff ID"
            />
            <div class="invalid-feedback">{{ errors.staffId }}</div>
          </div>

          <!-- 密码 -->
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input
              v-model="password"
              type="password"
              class="form-control"
              @input="checkStrength"
              :class="{ 'is-invalid': errors.password }"
            >
            <div class="mt-2">
                <div class="progress">
                    <div 
                    class="progress-bar transition-all" 
                    :style="{ width: strength + '%', backgroundColor: color }"
                    ></div>
                </div>
                <small class="text-muted">{{ strengthText }}</small>
                </div>
            </div>

          <!-- 确认密码 -->
          <div class="mb-3">
            <label class="form-label">Confirm Password</label>
            <input
              v-model="confirmPassword"
              type="password"
              class="form-control"
              :class="{ 'is-invalid': errors.confirmPassword }"
            >
            <div class="invalid-feedback">{{ errors.confirmPassword }}</div>
          </div>

          <button @click="handleRegister" class="btn btn-success w-100" :disabled="loading">
            {{ loading ? 'Registering...' : 'Register' }}
          </button>

          <div class="text-center mt-3">
            Already have an account?
            <router-link to="/login">Login</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api.js'

const router = useRouter()
const notify = inject('notify')

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const role = ref('student')
const studentId = ref('')
const staffId = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  studentId: '',
  staffId: '',
  password: '',
  confirmPassword: ''
})

// 学校白名单
const validStudentIds = ['1000001','1000002','1000003','1000004','1000005','1000006','1000007']
const validStaffIds = ['2000001','2000002','2000003','2000004','2000005','2000006','2000007']

// 密码强度
const strength = ref(0)
const strengthText = ref('')
const color = ref('red')

const checkStrength = () => {
  const p = password.value
  const hasLetter = /[A-Za-z]/.test(p)
  const hasNumber = /[0-9]/.test(p)
  const hasSymbol = /[^A-Za-z0-9]/.test(p)

  if ((hasLetter && !hasNumber) || (!hasLetter && hasNumber)) {
    strength.value = 33
    strengthText.value = 'Weak'
    color.value = 'red'
  } else if (hasLetter && hasNumber && !hasSymbol) {
    strength.value = 66
    strengthText.value = 'Medium'
    color.value = '#ffc107'
  } else if (hasLetter && hasNumber && hasSymbol) {
    strength.value = 100
    strengthText.value = 'Strong'
    color.value = '#28a745'
  } else {
    strength.value = 0
    strengthText.value = ''
    color.value = 'transparent'
  }
}

const validate = () => {
  Object.keys(errors).forEach(k => errors[k] = '')
  let ok = true

  if (!firstName.value.trim()) { errors.firstName = 'Required'; ok = false }
  if (!/^[A-Za-z]+$/.test(firstName.value)) { errors.firstName = 'Letters only'; ok = false }
  
  if (!lastName.value.trim()) { errors.lastName = 'Required'; ok = false }
  if (!/^[A-Za-z]+$/.test(lastName.value)) { errors.lastName = 'Letters only'; ok = false }

  if (!email.value.includes('@')) {
    errors.email = 'Must contain @'
    ok = false
  } else {
    const [pre, suf] = email.value.split('@')
    const validPre = /^[A-Za-z0-9._]+$/.test(pre)
    const validSuf = /^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(suf)
    if (!validPre || !validSuf) {
      errors.email = 'Invalid email'
      ok = false
    }
  }

  // 学生ID校验
  if (role.value === 'student') {
    if (!studentId.value) { errors.studentId = 'Required'; ok = false }
    else if (!/^\d{7}$/.test(studentId.value)) { errors.studentId = '7 digits'; ok = false }
    else if (!validStudentIds.includes(studentId.value)) { errors.studentId = 'Not in school'; ok = false }
  }

  // 教师ID校验
  if (role.value === 'teacher') {
    if (!staffId.value) { errors.staffId = 'Required'; ok = false }
    else if (!/^\d{7}$/.test(staffId.value)) { errors.staffId = '7 digits'; ok = false }
    else if (!validStaffIds.includes(staffId.value)) { errors.staffId = 'Not in school'; ok = false }
  }

  if (!password.value) { errors.password = 'Required'; ok = false }
  else if (password.value.length < 6) { errors.password = 'At least 6'; ok = false }
  
  if (password.value !== confirmPassword.value) {
    errors.confirmPassword = 'Not match'
    ok = false
  }

  return ok
}

const handleRegister = async () => {
  if (!validate()) return
  loading.value = true

  try {
    await api.post('/register', {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value,
      role: role.value,
      studentId: role.value === 'student' ? studentId.value : null,
      staffId: role.value === 'teacher' ? staffId.value : null
    })

    notify('Registered successfully!', 'bg-success')
    router.push('/login')
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || 'Registration failed'
    notify(msg, 'bg-danger')
  } finally {
    loading.value = false
  }
}
</script>

<style>
.transition-all {
  transition: all 0.3s ease;
}
</style>