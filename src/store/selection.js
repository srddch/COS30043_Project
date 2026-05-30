import { reactive } from 'vue'
import api from '../services/api'

// 这是“我的选课(My Selection)”的全局状态。
// 作用：让 Course Catalogue / My Selection / Schedule Generator 都能共享同一份“已选课程”数据。
// 数据来源：通过 src/services/api.js 访问后端 Express API，再由后端读写 Supabase。
export const selectionStore = reactive({
  // 当前用户已选择(Enroll)的课程列表（从后端读取）。
  enrolledUnits: [],
  // 页面用的加载状态（例如 My Selection 页面显示 loading spinner）。
  loading: false,

  // 从 localStorage 取当前登录用户信息（登录模块写入）。
  // 约定：user.role 用来区分 student/teacher，后端用 student_id 或 staff_id 做归属。
  getUser() {
    return JSON.parse(localStorage.getItem('user') || 'null')
  },

  // 从后端拉取“已选课程”，用于：
  // 1) Course Catalogue 显示每门课是否已 Enroll
  // 2) My Selection 页面展示列表 + 图表
  // 3) Schedule Generator 基于已选课程生成课表
  async fetchSelections() {
    const user = this.getUser()
    if (!user) {
      this.enrolledUnits = []
      return
    }

    this.loading = true
    try {
      const params = {}

      // 传给后端的查询参数，用于只拿“当前用户自己的选课”。
      if (user.role === 'student') {
        params.student_id = user.student_id
      } else if (user.role === 'teacher') {
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

  // 切换选课状态：如果已选则取消，如果未选则加入。
  // 返回值给 UI 用（CourseList/MySelection 决定弹什么 toast）。
  async toggleEnroll(unit) {
    const user = this.getUser()
    if (!user) {
      return { success: false, message: 'Please login first' }
    }

    const isStudent = user.role === 'student'
    const isTeacher = user.role === 'teacher'

    // 发送到后端的数据：unit 基础信息 + 用户归属字段（student_id / staff_id）。
    const postData = { ...unit }

    if (isStudent) {
      postData.student_id = user.student_id
    } else if (isTeacher) {
      postData.staff_id = user.id
    }

    // 前端先在本地列表里判断是否已选（避免再打一遍 GET）。
    const index = this.enrolledUnits.findIndex(u => u.code === unit.code)

    // 情况 A：已选 -> 调后端 DELETE，再同步更新本地数组
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

    // 情况 B：未选 -> 检查上限(最多 4 门) -> 调后端 POST -> 写回本地数组
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
  },

  // 给 UI 判断某门课是否已选，用于列表 badge/按钮状态。
  isEnrolled(code) {
    return this.enrolledUnits.some(u => u.code === code)
  }
})
