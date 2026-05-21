export const getCurrentUser = () => {
  const storedUser = localStorage.getItem('user')

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser)
  } catch (error) {
    console.error('Failed to parse current user:', error)
    return null
  }
}

export const isUserLoggedIn = () => {
  return getCurrentUser() !== null
}

export const getCurrentUserName = () => {
  const user = getCurrentUser()

  if (!user) {
    return ''
  }

  return user.full_name || user.email || 'Anonymous'
}