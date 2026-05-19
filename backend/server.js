import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Test API
app.get('/', (req, res) => {
  res.send('Backend API is running')
})

// Get all courses
app.get('/api/courses', async (req, res) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
})

// Get all forum posts
app.get('/api/forum-posts', async (req, res) => {
  const { data, error } = await supabase
    .from('forum_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
})

// Create forum post
app.post('/api/forum-posts', async (req, res) => {
  const { title, category, content, author } = req.body

  const { data, error } = await supabase
    .from('forum_posts')
    .insert([{ title, category, content, author }])
    .select()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json(data[0])
})

// Get tasks
app.get('/api/tasks', async (req, res) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
})

// Create task
app.post('/api/tasks', async (req, res) => {
  const { text } = req.body

  const { data, error } = await supabase
    .from('tasks')
    .insert([{ text, done: false }])
    .select()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json(data[0])
})

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params
  const { done } = req.body

  const { data, error } = await supabase
    .from('tasks')
    .update({ done })
    .eq('id', id)
    .select()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data[0])
})

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({ message: 'Task deleted successfully' })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})