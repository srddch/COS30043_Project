import { ref } from 'vue'
import api from '../../../services/api.js'

const user = ref(null)

export function useUser() {
  const loadUser = () => {
    const stored = localStorage.getItem('user')
    if (stored) {
      user.value = JSON.parse(stored)
      fetchLatestUser() 
    }
  }

  const fetchLatestUser = async () => {
    if (!user.value || !user.value.id) return

    try {
      const res = await api.get('/user', {
        params: { id: user.value.id }
      })

      user.value = res.data
      localStorage.setItem('user', JSON.stringify(res.data))
    } catch (err) {
      console.log('Use local cache')
    }
  }

  const logout = () => {
    localStorage.removeItem('user')
    user.value = null
  }

  return { user, loadUser, logout }
}
