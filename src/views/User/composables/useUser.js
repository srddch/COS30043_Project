import { ref, computed } from 'vue'
const user = ref(null)
export function useUser() {
  const loadUser = () => {
    const stored = localStorage.getItem('user')
    if (stored) user.value = JSON.parse(stored)
  }
  const logout = () => {
    localStorage.removeItem('user')
    user.value = null
  }
  return { user, loadUser, logout }
}