<script setup>
import { ref, computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { forumPosts } from './forumData'
import { isLoggedIn, currentUser } from './forumAuthMock'

const route = useRoute()
const router = useRouter()
const notify = inject('notify')

const postId = computed(() => {
  return Number(route.params.id)
})

const originalPost = computed(() => {
  return forumPosts.find(post => post.id === postId.value)
})

const canEditPost = computed(() => {
  return isLoggedIn && originalPost.value && originalPost.value.author === currentUser
})

const title = ref(originalPost.value ? originalPost.value.title : '')
const category = ref(originalPost.value ? originalPost.value.category : '')
const content = ref(originalPost.value ? originalPost.value.content : '')
const tagsInput = ref(originalPost.value ? originalPost.value.tags.join(', ') : '')
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

const updatePost = () => {
  if (!validateForm()) {
    if (notify) {
      notify('Please fix the form errors.', 'bg-danger')
    }
    return
  }

  const postIndex = forumPosts.findIndex(post => post.id === postId.value)

  if (postIndex === -1) {
    if (notify) {
      notify('Post not found.', 'bg-danger')
    }
    return
  }

  const tags = tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)

  forumPosts[postIndex] = {
    ...forumPosts[postIndex],
    title: title.value.trim(),
    category: category.value,
    content: content.value.trim(),
    tags: tags.length > 0 ? tags : ['General']
  }

  if (notify) {
    notify('Post updated successfully!', 'bg-success')
  }

  router.push(`/forum/${postId.value}`)
}
</script>

<template>
  <div class="edit-post-page">
    <router-link
      v-if="originalPost"
      :to="`/forum/${postId}`"
      class="btn btn-outline-secondary btn-sm mb-4"
    >
      ← Back to Post
    </router-link>

    <router-link
      v-else
      to="/forum"
      class="btn btn-outline-secondary btn-sm mb-4"
    >
      ← Back to Forum
    </router-link>

    <div v-if="originalPost && canEditPost" class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h1 class="h3 fw-bold mb-2">Edit Discussion Post</h1>
            <p class="text-secondary mb-4">
              Update the title, category, content, or tags of this discussion.
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

            <form @submit.prevent="updatePost" novalidate>
              <div class="mb-3">
                <label for="editTitle" class="form-label">Title</label>
                <input
                  id="editTitle"
                  v-model="title"
                  type="text"
                  class="form-control"
                >
                <div class="form-text">
                  Minimum 5 characters.
                </div>
              </div>

              <div class="mb-3">
                <label for="editCategory" class="form-label">Category</label>
                <select
                  id="editCategory"
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
                <label for="editContent" class="form-label">Content</label>
                <textarea
                  id="editContent"
                  v-model="content"
                  class="form-control"
                  rows="6"
                ></textarea>
                <div class="form-text">
                  Minimum 20 characters.
                </div>
              </div>

              <div class="mb-4">
                <label for="editTags" class="form-label">Tags</label>
                <input
                  id="editTags"
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
                <router-link
                  :to="`/forum/${postId}`"
                  class="btn btn-outline-secondary"
                >
                  Cancel
                </router-link>

                <button type="submit" class="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="card border-0 shadow-sm">
  <div class="card-body text-center py-5">
    <h1 class="h4 fw-bold mb-2">
      {{ originalPost ? 'Permission denied' : 'Post not found' }}
    </h1>

    <p class="text-muted mb-4">
      {{
        originalPost
          ? 'Only the author of this post can edit it.'
          : 'The post you are trying to edit does not exist.'
      }}
    </p>

    <router-link to="/forum" class="btn btn-success">
      Back to Forum
    </router-link>
    </div>
   </div>
  </div>
</template>

<style scoped>
.edit-post-page {
  text-align: left;
}
</style>