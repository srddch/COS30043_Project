import { reactive } from 'vue'
import api from '../services/api'

export const selectionStore = reactive({
  enrolledUnits: [],
  loading: false,

  getStudentId() {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    console.log("student_id =", user?.student_id) 
    return user?.student_id || null
  },

  async fetchSelections() {
    const student_id = this.getStudentId()
    if (!student_id) {
      this.enrolledUnits = []
      return
    }

    this.loading = true
    try {
      const response = await api.get('/selections', {
        params: { student_id }
      })
      this.enrolledUnits = response.data
    } catch (error) {
      console.error('Failed to fetch selections:', error)
    } finally {
      this.loading = false
    }
  },
  
  async toggleEnroll(unit) {
    const student_id = this.getStudentId()
    if (!student_id) {
      return { success: false, message: 'Please login first' }
    }

    const index = this.enrolledUnits.findIndex(u => u.code === unit.code)
    
    if (index > -1) {
      try {
        await api.delete(`/selections/${unit.code}`, {
          params: { student_id }
        })
        this.enrolledUnits.splice(index, 1)
        return { success: true, action: 'removed' }
      } catch (error) {
        return { success: false, message: 'Failed to remove from backend' }
      }
    } else {
      if (this.enrolledUnits.length >= 4) {
        return { success: false, message: 'Maximum 4 units allowed!' }
      }
      
      try {
        const data = { ...unit, student_id }
        const response = await api.post('/selections', data)
        this.enrolledUnits.push(response.data)
        return { success: true, action: 'enrolled' }
      } catch (error) {
        return { success: false, message: 'Failed to save to backend' }
      }
    }
  },
  
  isEnrolled(code) {
    return this.enrolledUnits.some(u => u.code === code)
  }
})


