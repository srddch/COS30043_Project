<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { getForumPosts } from '../../services/forumPostService'
import { isUserLoggedIn } from './forumAuth'
import PostCard from './components/PostCard.vue'

const notify = inject('notify')

const isLoggedIn = computed(() => {
  return isUserLoggedIn()
})


const forumPosts = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const searchText = ref('')
const selectedCategory = ref('All')
const sortBy = ref('latest')
const currentPage = ref(1)
const pageSize = 4

const loadForumPosts = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    forumPosts.value = await getForumPosts()
  } catch (error) {
    console.error('Failed to load forum posts:', error)
    errorMessage.value = 'Failed to load forum posts from database.'

    if (notify) {
      notify('Failed to load forum posts.', 'bg-danger')
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadForumPosts()
})

const showLoginRequired = () => {
  if (notify) {
    notify('You must be logged in to perform this action.', 'bg-warning')
  }
}

const categories = computed(() => {
  const uniqueCategories = forumPosts.value.map(post => post.category)
  return ['All', ...new Set(uniqueCategories)]
})

const filteredPosts = computed(() => {
  return forumPosts.value.filter(post => {
    const keyword = searchText.value.toLowerCase().trim()

    const matchesSearch =
      post.title.toLowerCase().includes(keyword) ||
      post.content.toLowerCase().includes(keyword) ||
      post.category.toLowerCase().includes(keyword) ||
      post.tags.some(tag => tag.toLowerCase().includes(keyword))

    const matchesCategory =
      selectedCategory.value === 'All' ||
      post.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})

const getSearchKeywords = () => {
  return searchText.value
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
}

const calculateRelevanceScore = (post) => {
  const keywords = getSearchKeywords()
  let score = 0

  const title = post.title.toLowerCase()
  const content = post.content.toLowerCase()
  const category = post.category.toLowerCase()
  const tags = post.tags.map(tag => tag.toLowerCase())

  keywords.forEach(keyword => {
    if (title.includes(keyword)) {
      score += 6
    }

    if (tags.some(tag => tag.includes(keyword))) {
      score += 5
    }

    if (category.includes(keyword)) {
      score += 3
    }

    if (content.includes(keyword)) {
      score += 2
    }
  })

  score += Math.min(post.replies, 10) * 0.3
  score += Math.min(post.views, 100) * 0.05

  const createdTime = new Date(post.createdAt)
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


const sortedPosts = computed(() => {
  const posts = [...filteredPosts.value]

  if (sortBy.value === 'latest') {
    return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  if (sortBy.value === 'relevance') {
  return posts
    .map(post => ({
      ...post,
      relevanceScore: calculateRelevanceScore(post)
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
}

  if (sortBy.value === 'replies') {
    return posts.sort((a, b) => b.replies - a.replies)
  }

  if (sortBy.value === 'views') {
    return posts.sort((a, b) => b.views - a.views)
  }

  if (sortBy.value === 'title') {
    return posts.sort((a, b) => a.title.localeCompare(b.title))
  }

  return posts
})

const visibleReplies = computed(() => {
  return sortedPosts.value.reduce((total, post) => total + post.replies, 0)
})

const visibleViews = computed(() => {
  return sortedPosts.value.reduce((total, post) => total + post.views, 0)
})

const totalPages = computed(() => {
  return Math.ceil(sortedPosts.value.length / pageSize)
})

const pageNumbers = computed(() => {
  return Array.from({ length: totalPages.value }, (_, index) => index + 1)
})

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return sortedPosts.value.slice(start, end)
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const resetFilters = () => {
  searchText.value = ''
  selectedCategory.value = 'All'
  sortBy.value = 'latest'
  currentPage.value = 1
}
</script>

<template>
  <div class="forum-page">
    <!-- Page header -->
    <div class="row mb-4 align-items-center">
      <div class="col-md-8">
        <h1 class="h2 fw-bold mb-2">Discussion Forum</h1>
        <p class="text-secondary mb-0">
          Ask questions, share ideas, and discuss course-related topics with other students.
        </p>
      </div>

      <div class="col-md-4 text-md-end mt-3 mt-md-0">
        <router-link v-if="isLoggedIn" to="/forum/create" class="btn btn-success">
          Create Post
        </router-link>

        <button v-else class="btn btn-outline-secondary" @click="showLoginRequired">
          Login to Create Post
        </button>
      </div>
    </div>

    <!-- Small statistics cards -->
    <!-- Small statistics cards -->
<div class="row g-3 mb-4">
  <div class="col-md-4">
    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <p class="text-muted small mb-1">Visible Posts</p>
        <h3 class="h4 mb-0">{{ sortedPosts.length }}</h3>
      </div>
    </div>
  </div>

  <div class="col-md-4">
    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <p class="text-muted small mb-1">Visible Replies</p>
        <h3 class="h4 mb-0">
          {{ visibleReplies }}
        </h3>
      </div>
    </div>
  </div>

  <div class="col-md-4">
    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <p class="text-muted small mb-1">Visible Views</p>
        <h3 class="h4 mb-0">
          {{ visibleViews }}
        </h3>
      </div>
    </div>
  </div>
</div>


    <!-- Search and filter area -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-lg-5">
            <label for="forumSearch" class="form-label small text-muted">
              Search discussions
            </label>
            <input id="forumSearch" v-model="searchText" @input="currentPage = 1" type="text" class="form-control"
              placeholder="Search by title, content, category, or tag...">
          </div>

          <div class="col-lg-3">
            <label for="categoryFilter" class="form-label small text-muted">
              Category
            </label>
            <select id="categoryFilter" v-model="selectedCategory" @change="currentPage = 1" class="form-select">
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <div class="col-lg-2">
            <label for="sortPosts" class="form-label small text-muted">
              Sort by
            </label>
            <select id="sortPosts" v-model="sortBy" @change="currentPage = 1" class="form-select">
              <option value="latest">Latest</option>
              <option value="relevance">Most Relevant</option>
              <option value="replies">Most Replies</option>
              <option value="views">Most Views</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>

          <div class="col-lg-2 d-grid">
            <label class="form-label small text-muted">
              Action
            </label>
            <button class="btn btn-outline-secondary" @click="resetFilters">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main layout -->
    <div class="row g-4">
      <!-- Left: forum feed -->
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-body">
            <h2 class="h5 fw-bold mb-0">Recent Discussions</h2>
          </div>
        </div>

        <div v-if="isLoading" class="card border-0 shadow-sm mb-3">
          <div class="card-body text-center py-5">
            <div class="spinner-border text-success mb-3" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted mb-0">Loading forum posts...</p>
          </div>
        </div>

        <div v-if="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>

        <PostCard v-for="post in paginatedPosts" :key="post.id" :post="post" />

        <div v-if="!isLoading && sortedPosts.length === 0" class="card border-0 shadow-sm">
          <div class="card-body text-center py-5">
            <h3 class="h5 fw-bold mb-2">No discussions found</h3>
            <p class="text-muted mb-3">
              Try using different keywords or reset the filters.
            </p>
            <button class="btn btn-outline-secondary" @click="resetFilters">
              Reset Filters
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1"
          class="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4">
          <p class="text-muted small mb-3 mb-md-0">
            Showing {{ paginatedPosts.length }} of {{ sortedPosts.length }} discussions
          </p>

          <nav aria-label="Forum pagination">
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
                  Previous
                </button>
              </li>

              <li v-for="page in pageNumbers" :key="page" class="page-item" :class="{ active: currentPage === page }">
                <button class="page-link" @click="goToPage(page)">
                  {{ page }}
                </button>
              </li>

              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <!-- Right: sidebar -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-body">
            <h2 class="h5 fw-bold mb-3">Forum Guide</h2>
            <ul class="text-secondary small mb-0 ps-3">
              <li>Use clear and specific post titles.</li>
              <li>Check existing discussions before posting.</li>
              <li>Keep questions related to courses or projects.</li>
              <li>Be respectful when replying to others.</li>
            </ul>
          </div>
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h2 class="h5 fw-bold mb-3">Module Scope</h2>
            <p class="text-secondary small mb-0">
              This forum module focuses on post listing, post details, create, edit,
              delete, search, sorting, pagination, and post-related data.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forum-page {
  text-align: left;
}
</style>