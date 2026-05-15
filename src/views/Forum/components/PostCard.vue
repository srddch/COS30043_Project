<script setup>
defineProps({
  post: {
    type: Object,
    required: true
  }
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

const getAuthorInitial = (author) => {
  if (!author || author.length === 0) {
    return '?'
  }

  return author.charAt(0).toUpperCase()
}
</script>

<template>
  <div class="card border-0 shadow-sm mb-3 post-card">
    <div class="card-body">
      <div class="d-flex gap-3">
        <!-- Author avatar -->
        <div class="author-avatar">
          {{ getAuthorInitial(post.author) }}
        </div>

        <!-- Main post content -->
        <div class="flex-grow-1">
          <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
            <span class="fw-semibold text-dark">
              {{ post.author }}
            </span>

            <span class="text-muted small">·</span>

            <span class="badge bg-light text-dark border">
              {{ post.category }}
            </span>

            <span class="text-muted small">·</span>

            <span class="text-muted small">
              {{ formatRelativeTime(post.createdAt) }}
            </span>
          </div>

          <h3 class="h5 fw-bold mb-2 post-title">
            {{ post.title }}
          </h3>

          <p class="text-secondary mb-3 post-preview">
            {{ post.content }}
          </p>

          <div class="d-flex flex-wrap gap-2 mb-3">
            <span
              v-for="tag in post.tags"
              :key="tag"
              class="badge bg-secondary-subtle text-secondary border"
            >
              #{{ tag }}
            </span>
          </div>

          <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
            <div class="d-flex flex-wrap gap-2">
              <span
                v-if="typeof post.relevanceScore === 'number'"
                class="badge bg-success-subtle text-success border border-success-subtle"
              >
                Relevance {{ post.relevanceScore.toFixed(1) }}
              </span>

              <span class="badge bg-light text-dark border">
                Replies {{ post.replies }}
              </span>

              <span class="badge bg-light text-dark border">
                Views {{ post.views }}
              </span>
            </div>

            <router-link
              :to="`/forum/${post.id}`"
              class="btn btn-outline-success btn-sm"
            >
              View Details
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.post-card:hover {
  transform: translateY(-2px);
}

.author-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: #198754;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.post-title {
  line-height: 1.35;
}

.post-preview {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>