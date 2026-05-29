import { reactive } from 'vue'
import api from '../services/api'

export const selectionStore = reactive({
  enrolledUnits: [],
  loading: false,

  getUser() {
    return JSON.parse(localStorage.getItem('user') || 'null')
  },

  async fetchSelections() {
    const user = this.getUser()
    if (!user) {
      this.enrolledUnits = []
      return
    }

    this.loading = true
    try {
      const params = {}

      if (user.role === 'student') {
        params.student_id = user.student_id
      }
      else if (user.role === 'teacher') {
        params.staff_id = user.id
      }

      const response = await api.get('/selections', { params })
      this.enrolledUnits = response.data
    } catch (error) {
      console.error('Failed to fetch selections:', error)
    } finally {
      this.loading = false
    }
  },

  async toggleEnroll(unit) {
    const user = this.getUser()
    if (!user) {
      return { success: false, message: 'Please login first' }
    }

    const isStudent = user.role === 'student'
    const isTeacher = user.role === 'teacher'

    const postData = { ...unit }

    if (isStudent) {
      postData.student_id = user.student_id
    }
    else if (isTeacher) {
      postData.staff_id = user.id
    }

    const index = this.enrolledUnits.findIndex(u => u.code === unit.code)

    if (index > -1) {
      try {
        const params = isStudent ? { student_id: user.student_id } : { staff_id: user.id }
        await api.delete(`/selections/${unit.code}`, { params })
        this.enrolledUnits.splice(index, 1)
        return { success: true, action: 'removed' }
      } catch (error) {
        return { success: false, message: 'Failed to remove from backend' }
      }
    }

    else {
      if (this.enrolledUnits.length >= 4) {
        return { success: false, message: 'Maximum 4 units allowed!' }
      }

      try {
        const response = await api.post('/selections', postData)
        this.enrolledUnits.push(response.data)
        return { success: true, action: 'enrolled' }
      } catch (error) {
        console.error('API ERROR:', error)
        return { success: false, message: 'Failed to save to backend' }
      }
    }
  },

  isEnrolled(code) {
    return this.enrolledUnits.some(u => u.code === code)
  }
})
