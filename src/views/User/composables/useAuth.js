import { ref } from 'vue'
import { useRouter } from 'vue-router'

export function useAuth() {
  const router = useRouter()
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const logout = () => {
    localStorage.removeItem('user')
    user.value = null
    router.push('/login')
  }

  return { user, logout }
}