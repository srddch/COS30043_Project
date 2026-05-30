<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../services/api'

const user = JSON.parse(localStorage.getItem('user'))
const currentUserId = user ? String(user.id) : null

const likes = ref([])
const favourites = ref([])
const ratings = ref([])

onMounted(async () => {
  await loadDashboardData()
})

async function loadDashboardData() {
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
  }
}

const myLikes = computed(() => likes.value)

const myFavourites = computed(() => favourites.value)

const myRatings = computed(() => ratings.value)

const averageRating = computed(() => {
  if (myRatings.value.length === 0) return 0

  const total = myRatings.value.reduce(
    (sum, item) => sum + Number(item.rating),
    0
  )

  return (total / myRatings.value.length).toFixed(1)
})

const maxValue = computed(() => {
  return Math.max(
    myLikes.value.length,
    myFavourites.value.length,
    myRatings.value.length,
    Number(averageRating.value),
    1
  )
})

function barWidth(value) {
  return `${(Number(value) / maxValue.value) * 100}%`
}
</script>

<template>
  <div>
    <div class="mb-4">
      <h1 class="fw-bold">Social Interaction Dashboard</h1>

<p class="text-muted">
  This page provides a summary of the user's likes, favourites, ratings and activity statistics.
</p>
      <div
        v-if="!currentUserId"
        class="alert alert-warning"
      >
        Please login to view your dashboard.
      </div>
    </div>

    

    <div class="row g-3 mb-4">
      <div class="col-12 col-md-6 col-lg-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h2>{{ myLikes.length }}</h2>
            <p class="text-muted mb-0">Likes</p>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6 col-lg-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h2>{{ myFavourites.length }}</h2>
            <p class="text-muted mb-0">Favourites</p>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6 col-lg-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h2>{{ myRatings.length }}</h2>
            <p class="text-muted mb-0">Ratings</p>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6 col-lg-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h2>{{ averageRating }}</h2>
            <p class="text-muted mb-0">Average Rating</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <h4 class="fw-bold mb-4">Activity Chart</h4>

        <div class="mb-3">
          <div class="d-flex justify-content-between">
            <span>Likes</span>
            <span>{{ myLikes.length }}</span>
          </div>

          <div class="progress">
            <div
              class="progress-bar"
              :style="{ width: barWidth(myLikes.length) }"
            ></div>
          </div>
        </div>

        <div class="mb-3">
          <div class="d-flex justify-content-between">
            <span>Favourites</span>
            <span>{{ myFavourites.length }}</span>
          </div>

          <div class="progress">
            <div
              class="progress-bar bg-success"
              :style="{ width: barWidth(myFavourites.length) }"
            ></div>
          </div>
        </div>

        <div class="mb-3">
          <div class="d-flex justify-content-between">
            <span>Ratings</span>
            <span>{{ myRatings.length }}</span>
          </div>

          <div class="progress">
            <div
              class="progress-bar bg-warning"
              :style="{ width: barWidth(myRatings.length) }"
            ></div>
          </div>
        </div>

        <div>
          <div class="d-flex justify-content-between">
            <span>Average Rating</span>
            <span>{{ averageRating }}</span>
          </div>

          <div class="progress">
            <div
              class="progress-bar bg-danger"
              :style="{ width: barWidth(averageRating) }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <h4 class="fw-bold">Recent Ratings</h4>

        <div
          v-if="myRatings.length === 0"
          class="text-muted"
        >
          No rating data available.
        </div>

        <ul
          v-else
          class="list-group"
        >
          <li
            v-for="item in myRatings"
            :key="item.id"
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>
              Course ID: {{ item.course_id }}
            </span>

            <span class="badge bg-warning text-dark">
              {{ item.rating }} Stars
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
