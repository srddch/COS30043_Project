<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { forumPosts } from './forumData'
import { currentUser } from './forumAuthMock'

const router = useRouter()
const notify = inject('notify')

const title = ref('')
const category = ref('')
const content = ref('')
const tagsInput = ref('')
const errors = ref([])

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

const createPost = () => {
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
    id: Date.now(),
    title: title.value.trim(),
    category: category.value,
    author: currentUser,
    date: new Date().toISOString().slice(0, 10),
    content: content.value.trim(),
    replies: 0,
    views: 0,
    tags: tags.length > 0 ? tags : ['General']
  }

  forumPosts.unshift(newPost)

  if (notify) {
    notify('Post created successfully!', 'bg-success')
  }

  router.push('/forum')
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
                >
                <div class="form-text">
                  Separate tags with commas.
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2">
                <router-link to="/forum" class="btn btn-outline-secondary">
                  Cancel
                </router-link>

                <button type="submit" class="btn btn-success">
                  Create Post
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