<script setup>
import { ref, computed, inject, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getForumPostById,
  getForumPosts,
  deleteForumPost
} from '../../services/forumPostService'
import { isLoggedIn, currentUser } from './forumAuthMock'

const route = useRoute()
const router = useRouter()
const notify = inject('notify')

const postId = computed(() => {
  return Number(route.params.id)
})

const post = ref(null)
const allPosts = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const loadPost = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    post.value = null
    allPosts.value = []

    const [postData, postsData] = await Promise.all([
      getForumPostById(postId.value),
      getForumPosts()
    ])

    post.value = postData
    allPosts.value = postsData
  } catch (error) {
    console.error('Failed to load forum post:', error)
    post.value = null
    allPosts.value = []
    errorMessage.value = 'Post not found or failed to load.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadPost()
})

watch(
  () => route.params.id,
  () => {
    loadPost()
  }
)

const canManagePost = computed(() => {
  return isLoggedIn && post.value && post.value.author === currentUser
})

const calculateRelatedScore = (candidatePost) => {
  if (!post.value) {
    return 0
  }

  let score = 0

  if (candidatePost.category === post.value.category) {
    score += 4
  }

  const sharedTags = candidatePost.tags.filter(tag =>
    post.value.tags.includes(tag)
  )

  score += sharedTags.length * 3
  score += Math.min(candidatePost.replies, 10) * 0.3
  score += Math.min(candidatePost.views, 100) * 0.05

  const createdTime = new Date(candidatePost.createdAt)
  const now = new Date()
  const diffDays = Math.floor((now - createdTime) / (1000 * 60 * 60 * 24))

  if (diffDays <= 1) {
    score += 2
  } else if (diffDays <= 7) {
    score += 1
  } else if (diffDays <= 30) {
    score += 0.5
  }

  return score
}

const relatedPosts = computed(() => {
  if (!post.value) {
    return []
  }

  return allPosts.value
    .filter(candidatePost => candidatePost.id !== post.value.id)
    .map(candidatePost => ({
      ...candidatePost,
      relatedScore: calculateRelatedScore(candidatePost)
    }))
    .sort((a, b) => b.relatedScore - a.relatedScore)
    .slice(0, 3)
})

const formatRelativeTime = (createdAt) => {
  const createdTime = new Date(createdAt)
  const now = new Date()
  const diffMs = now - createdTime
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) {
    return 'Just now'
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`
  }

  if (diffHours < 24) {
    return `${diffHours} h ago`
  }

  if (diffDays < 7) {
    return `${diffDays} d ago`
  }

  return createdTime.toLocaleDateString()
}

const deletePost = async () => {
  if (!canManagePost.value) {
    if (notify) {
      notify('You do not have permission to delete this post.', 'bg-danger')
    }
    return
  }

  const confirmed = window.confirm('Are you sure you want to delete this post?')

  if (!confirmed) {
    return
  }

  try {
    await deleteForumPost(postId.value)

    if (notify) {
      notify('Post deleted successfully!', 'bg-success')
    }

    router.push('/forum')
  } catch (error) {
    console.error('Failed to delete post:', error)

    if (notify) {
      notify('Failed to delete post.', 'bg-danger')
    }
  }
}
</script>

<template>
  <div class="post-detail-page">
    <router-link to="/forum" class="btn btn-outline-secondary btn-sm mb-4">
      ← Back to Forum
    </router-link>

    <div v-if="isLoading" class="card border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <div class="spinner-border text-success mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted mb-0">Loading post details...</p>
      </div>
    </div>

    <div v-else-if="post" class="card border-0 shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <span class="badge bg-light text-dark border">
            {{ post.category }}
          </span>

          <small class="text-muted">
            {{ formatRelativeTime(post.createdAt) }}
          </small>
        </div>

        <h1 class="h3 fw-bold mb-3">
          {{ post.title }}
        </h1>

        <div class="text-muted small mb-4">
          Posted by {{ post.author }} · {{ post.replies }} replies · {{ post.views }} views
        </div>

        <p class="text-secondary mb-4">
          {{ post.content }}
        </p>

        <div class="d-flex flex-wrap gap-2 mb-4">
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="badge bg-secondary-subtle text-secondary border"
          >
            #{{ tag }}
          </span>
        </div>

        <div class="border-top pt-3">
          <div
            v-if="canManagePost"
            class="d-flex flex-column flex-sm-row justify-content-end gap-2 gap-sm-3"
          >
            <router-link
              :to="`/forum/${post.id}/edit`"
              class="btn btn-outline-primary btn-sm"
            >
              Edit Post
            </router-link>

            <button
              class="btn btn-outline-danger btn-sm"
              @click="deletePost"
            >
              Delete Post
            </button>
          </div>

          <p v-else class="text-muted small mb-0">
            You can view this post, but only the author can edit or delete it.
          </p>
        </div>

        <div class="border-top pt-4 mt-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h2 class="h5 fw-bold mb-0">Related Discussions</h2>
          </div>

          <p class="text-muted small mb-3">
            Recommended based on similar category, shared tags, replies, views, and recency.
          </p>

          <div v-if="relatedPosts.length > 0" class="row g-3">
            <div
              v-for="related in relatedPosts"
              :key="related.id"
              class="col-md-4"
            >
              <router-link
                :to="`/forum/${related.id}`"
                class="text-decoration-none"
              >
                <div class="card h-100 border related-card">
                  <div class="card-body">
                    <span class="badge bg-light text-dark border mb-2">
                      {{ related.category }}
                    </span>

                    <h3 class="h6 fw-bold text-dark mb-2">
                      {{ related.title }}
                    </h3>

                    <p class="text-muted small mb-2">
                      Replies {{ related.replies }} · Views {{ related.views }}
                    </p>

                    <span class="badge bg-success-subtle text-success border border-success-subtle">
                      Related {{ related.relatedScore.toFixed(1) }}
                    </span>
                  </div>
                </div>
              </router-link>
            </div>
          </div>

          <p v-else class="text-muted small mb-0">
            No related discussions found.
          </p>
        </div>
      </div>
    </div>

    <div v-else class="card border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <h1 class="h4 fw-bold mb-2">Post not found</h1>
        <p class="text-muted mb-4">
          The discussion post you are looking for does not exist.
        </p>
        <router-link to="/forum" class="btn btn-success">
          Back to Forum
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-detail-page {
  text-align: left;
}

.related-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.related-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 .5rem 1rem rgba(0, 0, 0, .08);
}
</style>