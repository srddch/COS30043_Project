<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { createForumPost } from '../../services/forumPostService'
import { isUserLoggedIn, getCurrentUserName } from './forumAuth'

const router = useRouter()
const notify = inject('notify')

const title = ref('')
const category = ref('')
const content = ref('')
const tagsInput = ref('')
const errors = ref([])
const isSubmitting = ref(false)

const categories = ['Project', 'Vue', 'Deployment', 'Form', 'API', 'General']

const validateForm = () => {
  errors.value = []

  if (title.value.trim().length < 5) {
    errors.value.push('Title must be at least 5 characters.')
  }

  if (!category.value) {
    errors.value.push('Please select a category.')
  }

  if (content.value.trim().length < 20) {
    errors.value.push('Content must be at least 20 characters.')
  }

  return errors.value.length === 0
}


const createPost = async () => {

   if (!isUserLoggedIn()) {
    if (notify) {
      notify('Please login before creating a post.', 'bg-warning')
    }

    router.push('/login')
    return
  }
  
  if (!validateForm()) {
    if (notify) {
      notify('Please fix the form errors.', 'bg-danger')
    }
    return
  }

  const tags = tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)

  const newPost = {
    title: title.value.trim(),
    category: category.value,
    content: content.value.trim(),
    author: getCurrentUserName() || 'Anonymous',
    tags: tags.length > 0 ? tags : ['General']
  }

  try {
    isSubmitting.value = true

    const createdPost = await createForumPost(newPost)

    if (notify) {
      notify('Post created successfully!', 'bg-success')
    }

    router.push(`/forum/${createdPost.id}`)
  } catch (error) {
    console.error('Failed to create post:', error)

    if (notify) {
      notify('Failed to create post.', 'bg-danger')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="create-post-page">
    <router-link to="/forum" class="btn btn-outline-secondary btn-sm mb-4">
      ← Back to Forum
    </router-link>

    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h1 class="h3 fw-bold mb-2">Create New Discussion</h1>
            <p class="text-secondary mb-4">
              Start a new discussion by asking a question or sharing useful information.
            </p>

            <div
              v-if="errors.length > 0"
              class="alert alert-danger"
            >
              <p class="fw-bold mb-2">Please correct the following errors:</p>
              <ul class="mb-0">
                <li v-for="error in errors" :key="error">
                  {{ error }}
                </li>
              </ul>
            </div>

            <form @submit.prevent="createPost" novalidate>
              <div class="mb-3">
                <label for="postTitle" class="form-label">Title</label>
                <input
                  id="postTitle"
                  v-model="title"
                  type="text"
                  class="form-control"
                  placeholder="Enter a clear discussion title"
                  :disabled="isSubmitting"
                >
                <div class="form-text">
                  Minimum 5 characters.
                </div>
              </div>

              <div class="mb-3">
                <label for="postCategory" class="form-label">Category</label>
                <select
                  id="postCategory"
                  v-model="category"
                  class="form-select"
                  :disabled="isSubmitting"
                >
                  <option value="">Select a category</option>
                  <option
                    v-for="item in categories"
                    :key="item"
                    :value="item"
                  >
                    {{ item }}
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label for="postContent" class="form-label">Content</label>
                <textarea
                  id="postContent"
                  v-model="content"
                  class="form-control"
                  rows="6"
                  placeholder="Describe your question or discussion topic"
                  :disabled="isSubmitting"
                ></textarea>
                <div class="form-text">
                  Minimum 20 characters.
                </div>
              </div>

              <div class="mb-4">
                <label for="postTags" class="form-label">Tags</label>
                <input
                  id="postTags"
                  v-model="tagsInput"
                  type="text"
                  class="form-control"
                  placeholder="Example: Vue, Router, Project"
                  :disabled="isSubmitting"
                >
                <div class="form-text">
                  Separate tags with commas.
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2">
                <router-link to="/forum" class="btn btn-outline-secondary">
                  Cancel
                </router-link>

                <button
                  type="submit"
                  class="btn btn-success"
                  :disabled="isSubmitting"
                >
                  {{ isSubmitting ? 'Creating...' : 'Create Post' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.create-post-page {
  text-align: left;
}
</style>