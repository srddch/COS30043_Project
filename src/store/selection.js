import { reactive, watch } from 'vue'

const STORAGE_KEY = 'enrolled_units'

// Load initial state from localStorage
const savedUnits = localStorage.getItem(STORAGE_KEY)
const initialState = savedUnits ? JSON.parse(savedUnits) : []

export const selectionStore = reactive({
  enrolledUnits: initialState,
  
  toggleEnroll(unit) {
    const index = this.enrolledUnits.findIndex(u => u.code === unit.code)
    if (index > -1) {
      this.enrolledUnits.splice(index, 1)
      return { success: true, action: 'removed' }
    } else {
      if (this.enrolledUnits.length >= 4) {
        return { success: false, message: 'Maximum 4 units allowed!' }
      }
      this.enrolledUnits.push(unit)
      return { success: true, action: 'enrolled' }
    }
  },
  
  isEnrolled(code) {
    return this.enrolledUnits.some(u => u.code === code)
  }
})

// Watch for changes and save to localStorage
watch(
  () => selectionStore.enrolledUnits,
  (newUnits) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUnits))
  },
  { deep: true }
)
