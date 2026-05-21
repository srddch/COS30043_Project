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

const mapForumReply = (row) => {
  return {
    id: row.id,
    postId: row.post_id,
    author: row.author,
    content: row.content,
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

export const incrementForumPostViews = async (id) => {
  const response = await api.patch(`/forum-posts/${id}/view`)
  return mapForumPost(response.data)
}

export const getForumReplies = async (postId) => {
  const response = await api.get(`/forum-posts/${postId}/replies`)
  return response.data.map(mapForumReply)
}

export const createForumReply = async (postId, reply) => {
  const response = await api.post(`/forum-posts/${postId}/replies`, reply)
  return mapForumReply(response.data)
}