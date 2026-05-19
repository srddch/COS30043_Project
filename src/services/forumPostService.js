import api from './api'

const mapForumPost = (row) => {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    content: row.content,
    author: row.author,
    tags: row.tags || [],
    replies: row.replies_count || 0,
    views: row.views_count || 0,
    createdAt: row.created_at
  }
}

export const getForumPosts = async () => {
  const response = await api.get('/forum-posts')
  return response.data.map(mapForumPost)
}

export const getForumPostById = async (id) => {
  const response = await api.get(`/forum-posts/${id}`)
  return mapForumPost(response.data)
}

export const createForumPost = async (post) => {
  const response = await api.post('/forum-posts', post)
  return mapForumPost(response.data)
}

export const updateForumPost = async (id, post) => {
  const response = await api.put(`/forum-posts/${id}`, post)
  return mapForumPost(response.data)
}

export const deleteForumPost = async (id) => {
  const response = await api.delete(`/forum-posts/${id}`)
  return response.data
}