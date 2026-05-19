import { reactive } from 'vue'
import api from '../services/api'

export const selectionStore = reactive({
  enrolledUnits: [],
  loading: false,

  async fetchSelections() {
    this.loading = true
    try {
      const response = await api.get('/selections')
      this.enrolledUnits = response.data
    } catch (error) {
      console.error('Failed to fetch selections:', error)
    } finally {
      this.loading = false
    }
  },
  
  async toggleEnroll(unit) {
    const index = this.enrolledUnits.findIndex(u => u.code === unit.code)
    
    if (index > -1) {
      // Remove from backend
      try {
        await api.delete(`/selections/${unit.code}`)
        this.enrolledUnits.splice(index, 1)
        return { success: true, action: 'removed' }
      } catch (error) {
        return { success: false, message: 'Failed to remove from backend' }
      }
    } else {
      if (this.enrolledUnits.length >= 4) {
        return { success: false, message: 'Maximum 4 units allowed!' }
      }
      
      // Add to backend
      try {
        const response = await api.post('/selections', unit)
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

// Initialize selections when store is imported (optional, but helpful)
selectionStore.fetchSelections()
