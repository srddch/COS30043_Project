<script setup>
import { ref, computed } from 'vue'
import { getSocialData } from '../../store/social'

const currentUserId = 1
const socialData = ref(getSocialData())

const myLikes = computed(() =>
  socialData.value.likes.filter(item => item.userId === currentUserId)
)

const myFavourites = computed(() =>
  socialData.value.favourites.filter(item => item.userId === currentUserId)
)

const myRatings = computed(() =>
  socialData.value.ratings.filter(item => item.userId === currentUserId)
)

const mySchedule = computed(() =>
  socialData.value.schedule.filter(item => item.userId === currentUserId)
)

const averageRating = computed(() => {
  if (myRatings.value.length === 0) return 0

  const total = myRatings.value.reduce((sum, item) => sum + item.score, 0)
  return (total / myRatings.value.length).toFixed(1)
})

const maxValue = computed(() => {
  return Math.max(
    myLikes.value.length,
    myFavourites.value.length,
    myRatings.value.length,
    mySchedule.value.length,
    1
  )
})

function barWidth(value) {
  return `${(value / maxValue.value) * 100}%`
}
</script>

<template>
  <div>
    <div class="mb-4">
      <h1 class="fw-bold">Social Interaction Dashboard</h1>
      <p class="text-muted">
        Advanced Feature 2: this dashboard visualises user interaction data.
      </p>
    </div>

    <div class="alert alert-success">
      This feature improves usability by helping users understand their activity
      through visual statistics.
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
            <div class="progress-bar" :style="{ width: barWidth(myLikes.length) }"></div>
          </div>
        </div>

        <div class="mb-3">
          <div class="d-flex justify-content-between">
            <span>Favourites</span>
            <span>{{ myFavourites.length }}</span>
          </div>
          <div class="progress">
            <div class="progress-bar bg-success" :style="{ width: barWidth(myFavourites.length) }"></div>
          </div>
        </div>

        <div class="mb-3">
          <div class="d-flex justify-content-between">
            <span>Ratings</span>
            <span>{{ myRatings.length }}</span>
          </div>
          <div class="progress">
            <div class="progress-bar bg-warning" :style="{ width: barWidth(myRatings.length) }"></div>
          </div>
        </div>

        <div>
          <div class="d-flex justify-content-between">
            <span>Schedule Items</span>
            <span>{{ mySchedule.length }}</span>
          </div>
          <div class="progress">
            <div class="progress-bar bg-danger" :style="{ width: barWidth(mySchedule.length) }"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <h4 class="fw-bold">Recent Ratings</h4>

        <div v-if="myRatings.length === 0" class="text-muted">
          No rating data available.
        </div>

        <ul v-else class="list-group">
          <li
            v-for="item in myRatings"
            :key="item.itemId"
            class="list-group-item d-flex justify-content-between"
          >
            <span>{{ item.title }}</span>
            <span class="badge bg-warning text-dark">
              {{ item.score }} Stars
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>