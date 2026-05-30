<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { getTemplates } from '../../store/social'
import api from '../../services/api'

const notify = inject('notify', () => {})

const user = JSON.parse(localStorage.getItem('user'))
const currentUserId = user ? String(user.id) : null

const templates = ref([])
const likes = ref([])
const favourites = ref([])
const ratings = ref([])

onMounted(async () => {
  await loadAllData()
})

async function loadAllData() {
  if (!currentUserId) {
    notify('Please login before using social features', 'bg-warning')
    return
  }

  templates.value = await getTemplates()
  await loadSocialData()
}

async function loadSocialData() {
  if (!currentUserId) {
    likes.value = []
    favourites.value = []
    ratings.value = []
    return
  }

  try {
    const [likesRes, favouritesRes, ratingsRes] = await Promise.all([
      api.get('/likes', { params: { user_id: currentUserId } }),
      api.get('/favourites', { params: { user_id: currentUserId } }),
      api.get('/ratings', { params: { user_id: currentUserId } })
    ])

    likes.value = likesRes.data || []
    favourites.value = favouritesRes.data || []
    ratings.value = ratingsRes.data || []
  } catch (err) {
    console.error(err)
    notify('Failed to load social data', 'bg-danger')
  }
}

function isLiked(courseId) {
  return likes.value.some(item => item.course_id === courseId)
}

function isFavourited(courseId) {
  return favourites.value.some(item => item.course_id === courseId)
}

function myRating(courseId) {
  const rating = ratings.value.find(item => item.course_id === courseId)
  return rating ? Number(rating.rating || 0) : 0
}

function averageRating(courseId) {
  const courseRatings = ratings.value.filter(item => item.course_id === courseId)

  if (courseRatings.length === 0) {
    return 'No rating yet'
  }

  const total = courseRatings.reduce((sum, item) => sum + Number(item.rating), 0)
  return (total / courseRatings.length).toFixed(1)
}

async function handleLike(item) {
  if (!currentUserId) {
    notify('Please login first', 'bg-warning')
    return
  }

  if (isLiked(item.id)) {
    try {
      await api.delete('/likes', { params: { user_id: currentUserId, course_id: item.id } })
      notify('Like removed', 'bg-success')
    } catch (error) {
      console.error(error)
      notify('Failed to remove like', 'bg-danger')
      return
    }
  } else {
    try {
      await api.post('/likes', { user_id: currentUserId, course_id: item.id })
      notify('Like saved', 'bg-success')
    } catch (error) {
      console.error(error)
      notify('Failed to save like', 'bg-danger')
      return
    }
  }

  await loadSocialData()
}

async function handleFavourite(item) {
  if (!currentUserId) {
    notify('Please login first', 'bg-warning')
    return
  }

  if (isFavourited(item.id)) {
    try {
      await api.delete('/favourites', { params: { user_id: currentUserId, course_id: item.id } })
      notify('Favourite removed', 'bg-success')
    } catch (error) {
      console.error(error)
      notify('Failed to remove favourite', 'bg-danger')
      return
    }
  } else {
    try {
      await api.post('/favourites', { user_id: currentUserId, course_id: item.id })
      notify('Favourite saved', 'bg-success')
    } catch (error) {
      console.error(error)
      notify('Failed to save favourite', 'bg-danger')
      return
    }
  }

  await loadSocialData()
}

async function handleRate(item, score) {
  if (!currentUserId) {
    notify('Please login first', 'bg-warning')
    return
  }

  try {
    await api.post('/ratings', { user_id: currentUserId, course_id: item.id, rating: score })
    notify('Rating updated', 'bg-warning')
  } catch (error) {
    console.error(error)
    notify('Failed to update rating', 'bg-danger')
    return
  }

  await loadSocialData()
}

const myLikesCount = computed(() => likes.value.length)

const myFavouritesCount = computed(() => favourites.value.length)

const myRatingsCount = computed(() => ratings.value.length)
</script>

<template>
  <div>
    <div class="mb-4">
      <h1 class="fw-bold">Likes, Favourites and Ratings</h1>

      <p class="text-muted">
  This page allows users to like, favourite and rate different courses.
    </p>

      <div
        v-if="!currentUserId"
        class="alert alert-warning"
      >
        Please login to use likes, favourites and ratings.
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-12 col-md-4">
        <div class="card text-center shadow-sm">
          <div class="card-body">
            <h2>{{ myLikesCount }}</h2>
            <p class="text-muted mb-0">My Likes</p>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="card text-center shadow-sm">
          <div class="card-body">
            <h2>{{ myFavouritesCount }}</h2>
            <p class="text-muted mb-0">My Favourites</p>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="card text-center shadow-sm">
          <div class="card-body">
            <h2>{{ myRatingsCount }}</h2>
            <p class="text-muted mb-0">My Ratings</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <div
        v-for="item in templates"
        :key="item.id"
        class="col-12 col-md-6 col-lg-4"
      >
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex flex-column">
            <span class="badge bg-primary mb-2 align-self-start">
              {{ item.type }}
            </span>

            <h5 class="fw-bold">{{ item.title }}</h5>

            <p class="text-muted mb-1">
              Course Code: {{ item.code }}
            </p>

            <p class="text-muted">
              Credit Points: {{ item.cp }}
            </p>

            <p>
              <strong>Average Rating:</strong>
              {{ averageRating(item.id) }}
            </p>

            <div class="mb-3">
              <button
                v-for="star in 5"
                :key="star"
                class="btn btn-sm me-1"
                :class="star <= myRating(item.id) ? 'btn-warning' : 'btn-outline-warning'"
                @click="handleRate(item, star)"
              >
                ★
              </button>
            </div>

            <div class="mt-auto d-flex gap-2">
              <button
                class="btn btn-sm"
                :class="isLiked(item.id) ? 'btn-danger' : 'btn-outline-danger'"
                @click="handleLike(item)"
              >
                {{ isLiked(item.id) ? 'Liked' : 'Like' }}
              </button>

              <button
                class="btn btn-sm"
                :class="isFavourited(item.id) ? 'btn-success' : 'btn-outline-success'"
                @click="handleFavourite(item)"
              >
                {{ isFavourited(item.id) ? 'Saved' : 'Favourite' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="alert alert-info mt-4">
      This module stores likes, favourites and ratings in the Supabase database and connects them to the logged-in user.
    </div>
  </div>
</template>
