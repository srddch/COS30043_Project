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

app.get('/api/likes', async (req, res) => {
  const { user_id } = req.query
  if (!user_id) return res.status(400).json({ error: 'user_id is required' })

  const { data, error } = await supabase
    .from('likes')
    .select('*')
    .eq('user_id', String(user_id))

  if (error) return res.status(500).json({ error: error.message })
  res.json(data || [])
})

app.post('/api/likes', async (req, res) => {
  const { user_id, course_id } = req.body
  if (!user_id || !course_id) {
    return res.status(400).json({ error: 'user_id and course_id are required' })
  }

  const { data, error } = await supabase
    .from('likes')
    .insert([{ user_id: String(user_id), course_id }])
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

app.delete('/api/likes', async (req, res) => {
  const { user_id, course_id } = req.query
  if (!user_id || !course_id) {
    return res.status(400).json({ error: 'user_id and course_id are required' })
  }

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', String(user_id))
    .eq('course_id', course_id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: 'Like removed' })
})

app.get('/api/favourites', async (req, res) => {
  const { user_id } = req.query
  if (!user_id) return res.status(400).json({ error: 'user_id is required' })

  const { data, error } = await supabase
    .from('favourites')
    .select('*')
    .eq('user_id', String(user_id))

  if (error) return res.status(500).json({ error: error.message })
  res.json(data || [])
})

app.post('/api/favourites', async (req, res) => {
  const { user_id, course_id } = req.body
  if (!user_id || !course_id) {
    return res.status(400).json({ error: 'user_id and course_id are required' })
  }

  const { data, error } = await supabase
    .from('favourites')
    .insert([{ user_id: String(user_id), course_id }])
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

app.delete('/api/favourites', async (req, res) => {
  const { user_id, course_id } = req.query
  if (!user_id || !course_id) {
    return res.status(400).json({ error: 'user_id and course_id are required' })
  }

  const { error } = await supabase
    .from('favourites')
    .delete()
    .eq('user_id', String(user_id))
    .eq('course_id', course_id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: 'Favourite removed' })
})

app.get('/api/ratings', async (req, res) => {
  const { user_id } = req.query
  if (!user_id) return res.status(400).json({ error: 'user_id is required' })

  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('user_id', String(user_id))

  if (error) return res.status(500).json({ error: error.message })
  res.json(data || [])
})

app.post('/api/ratings', async (req, res) => {
  const { user_id, course_id, rating } = req.body
  if (!user_id || !course_id || rating === undefined || rating === null) {
    return res.status(400).json({ error: 'user_id, course_id and rating are required' })
  }

  const { data: existing, error: existingError } = await supabase
    .from('ratings')
    .select('*')
    .eq('user_id', String(user_id))
    .eq('course_id', course_id)
    .maybeSingle()

  if (existingError) return res.status(500).json({ error: existingError.message })

  if (existing) {
    const { data, error } = await supabase
      .from('ratings')
      .update({ rating })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }

  const { data, error } = await supabase
    .from('ratings')
    .insert([{ user_id: String(user_id), course_id, rating }])
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

app.get('/api/social-schedules', async (req, res) => {
  const { user_id } = req.query
  if (!user_id) return res.status(400).json({ error: 'user_id is required' })

  const { data, error } = await supabase
    .from('social_schedules')
    .select('*')
    .eq('user_id', String(user_id))
    .order('id', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data || [])
})

app.delete('/api/social-schedules', async (req, res) => {
  const { user_id } = req.query
  if (!user_id) return res.status(400).json({ error: 'user_id is required' })

  const { error } = await supabase
    .from('social_schedules')
    .delete()
    .eq('user_id', String(user_id))

  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: 'Schedule cleared' })
})

app.post('/api/social-schedules/bulk', async (req, res) => {
  const { user_id, items } = req.body
  if (!user_id || !Array.isArray(items)) {
    return res.status(400).json({ error: 'user_id and items[] are required' })
  }

  const payload = items.map(item => ({
    user_id: String(user_id),
    course_id: item.course_id,
    day: item.day,
    time_slot: item.time_slot
  }))

  const { data, error } = await supabase
    .from('social_schedules')
    .insert(payload)
    .select()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data || [])
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

// Get single forum post by id
app.get('/api/forum-posts/:id', async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('forum_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return res.status(404).json({ error: 'Forum post not found' })
  }

  res.json(data)
})

// Increment forum post view count
app.patch('/api/forum-posts/:id/view', async (req, res) => {
  const { id } = req.params

  const { data: post, error: fetchError } = await supabase
    .from('forum_posts')
    .select('views_count')
    .eq('id', id)
    .single()

  if (fetchError) {
    return res.status(404).json({ error: 'Forum post not found' })
  }

  const newViewsCount = (post.views_count || 0) + 1

  const { data, error } = await supabase
    .from('forum_posts')
    .update({
      views_count: newViewsCount,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
})

// Get replies for a forum post
app.get('/api/forum-posts/:id/replies', async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('forum_replies')
    .select('*')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
})

// Create a reply for a forum post
app.post('/api/forum-posts/:id/replies', async (req, res) => {
  const { id } = req.params
  const { author, content } = req.body

  if (!author || !content) {
    return res.status(400).json({
      error: 'Author and content are required'
    })
  }

  const { data: replyData, error: replyError } = await supabase
    .from('forum_replies')
    .insert([
      {
        post_id: id,
        author,
        content
      }
    ])
    .select()
    .single()

  if (replyError) {
    return res.status(500).json({ error: replyError.message })
  }

  const { data: postData, error: postFetchError } = await supabase
    .from('forum_posts')
    .select('replies_count')
    .eq('id', id)
    .single()

  if (postFetchError) {
    return res.status(500).json({ error: postFetchError.message })
  }

  const newRepliesCount = (postData.replies_count || 0) + 1

  const { error: updateError } = await supabase
    .from('forum_posts')
    .update({
      replies_count: newRepliesCount,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (updateError) {
    return res.status(500).json({ error: updateError.message })
  }

  res.status(201).json(replyData)
})

// Delete forum post
app.delete('/api/forum-posts/:id', async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from('forum_posts')
    .delete()
    .eq('id', id)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({ message: 'Forum post deleted successfully' })
})

// Create forum post
// Create forum post
app.post('/api/forum-posts', async (req, res) => {
  const { title, category, content, author, tags } = req.body

  if (!title || !category || !content || !author) {
    return res.status(400).json({
      error: 'Title, category, content, and author are required'
    })
  }

  const { data, error } = await supabase
    .from('forum_posts')
    .insert([
      {
        title,
        category,
        content,
        author,
        tags: Array.isArray(tags) ? tags : [],
        replies_count: 0,
        views_count: 0
      }
    ])
    .select()
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json(data)
})

// Update forum post
app.put('/api/forum-posts/:id', async (req, res) => {
  const { id } = req.params
  const { title, category, content, author, tags } = req.body

  if (!title || !category || !content || !author) {
    return res.status(400).json({
      error: 'Title, category, content, and author are required'
    })
  }

  const { data, error } = await supabase
    .from('forum_posts')
    .update({
      title,
      category,
      content,
      author,
      tags: Array.isArray(tags) ? tags : [],
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
})

// Get tasks
app.get('/api/tasks', async (req, res) => {
  const { user_id } = req.query;
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
})

// Create task
app.post('/api/tasks', async (req, res) => {
  const { text, user_id } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Task text is required' })
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert([
      {
        text: text.trim(),
        done: false,
        status: 'todo',
        user_id: user_id 
      }
    ])
    .select()
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json(data)
})

// Update task status
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params
  const { status, user_id } = req.body; 

  const allowedStatus = ['todo', 'in_progress', 'completed']

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ error: 'Invalid task status' })
  }

  const { data, error } = await supabase
    .from('tasks')
    .update({
      status,
      done: status === 'completed'
    })
    .eq('id', id)
    .eq('user_id', user_id)
    .select()
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
})

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params
  const { user_id } = req.body;

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id); 

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({ message: 'Task deleted successfully' })
})
// --- Selections API (Course Module) ---
// 这组接口用于“选课/取消选课”，对应 Supabase 表：selections
// 设计要点：
// - 前端会带上 student_id 或 staff_id，用于只操作“当前用户自己的”选课数据
// - 返回 JSON 给前端，前端再用 selectionStore 驱动 UI（列表 badge、My Selection、Schedule Generator）

// Get all selected units (Read)
app.get('/api/selections', async (req, res) => {
  const { student_id, staff_id } = req.query;

  try {
    let query = supabase.from('selections').select('*');

    // 只允许按身份过滤（避免返回所有人的 selections）
    if (student_id) {
      query = query.eq('student_id', student_id);
    } else if (staff_id) {
      query = query.eq('staff_id', staff_id);
    } else {
      return res.json([]);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add a unit to selection (Create)
app.post('/api/selections', async (req, res) => {
  const data = req.body;

  // 必须带用户归属字段，否则无法知道这条 selection 属于谁
  if (!data.student_id && !data.staff_id) {
    return res.status(400).json({ error: 'student_id or staff_id is required' });
  }

  try {
    // 字段白名单：只写入 selections 表需要的列，避免前端传多余字段导致插入失败
    const { data: result, error } = await supabase
      .from('selections')
      .insert([{
        code: data.code,
        course_title: data.course_title,
        category: data.category,
        instructor: data.instructor,
        credits: data.credits,
        semester_offered: data.semester_offered,
        desc: data.desc,
        student_id: data.student_id ?? null,
        staff_id: data.staff_id ?? null
      }])
      .select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Remove a unit from selection (Delete)
app.delete('/api/selections/:code', async (req, res) => {
  const { code } = req.params;
  const { student_id, staff_id } = req.query;

  // 同时按 code + 用户归属字段删除，避免误删其他用户的选课
  let query = supabase.from('selections').delete().eq('code', code);

  if (student_id) {
    query = query.eq('student_id', student_id);
  } else if (staff_id) {
    query = query.eq('staff_id', staff_id);
  } else {
    return res.status(400).json({ error: 'Missing user ID' });
  }

  const { error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Selection removed' });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});


app.post('/api/register', async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    role,
    studentId,
    staffId
  } = req.body;

  const full_name = `${firstName} ${lastName}`.trim();

  try {
    
    const { data: existEmail } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (existEmail) {
      return res.status(400).json({
        message: 'Email is already registered'
      })
    }
    if (role === 'student') {
      const { data: existStudent } = await supabase
        .from('users')
        .select('student_id')
        .eq('student_id', studentId)
        .single()

      if (existStudent) {
        return res.status(400).json({
          message: 'This student ID is already registered'
        })
      }
    }
    if (role === 'teacher') {
      const { data: existStaff } = await supabase
        .from('users')
        .select('staff_id')
        .eq('staff_id', staffId)
        .single()

      if (existStaff) {
        return res.status(400).json({
          message: 'This staff ID is already registered'
        })
      }
    }
    const { data, error } = await supabase
      .from('users')
      .insert([{
        first_name: firstName,
        last_name: lastName,
        full_name: full_name,
        email: email,
        password: password,
        role: role,
        student_id: role === 'student' ? studentId : null,
        staff_id: role === 'teacher' ? staffId : null
      }])
      .select();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json({ success: true, user: data[0] });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/api/user', async (req, res) => {
  const { id } = req.query

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !user) {
    return res.status(404).json({ message: 'User not found' })
  }

  res.json(user)
});

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
