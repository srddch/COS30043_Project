import axios from 'axios'

const api = axios.create({
  baseURL: 'https://cos30043-project-backend.onrender.com/api'
})

export default api