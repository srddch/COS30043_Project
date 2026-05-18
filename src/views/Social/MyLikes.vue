<script setup>
import { ref, computed, inject } from 'vue'
import {
  getTemplates,
  getSocialData,
  toggleLike,
  toggleFavourite,
  rateTemplate
} from '../../store/social'

const notify = inject('notify', () => {})
const currentUserId = 1

const templates = ref(getTemplates())
const socialData = ref(getSocialData())

function refresh() {
  socialData.value = getSocialData()
}

function isLiked(id) {
  return socialData.value.likes.some(
    item => item.userId === currentUserId && item.itemId === id
  )
}

function isFavourited(id) {
  return socialData.value.favourites.some(
    item => item.userId === currentUserId && item.itemId === id
  )
}

function myRating(id) {
  const rating = socialData.value.ratings.find(
    item => item.userId === currentUserId && item.itemId === id
  )
  return rating ? rating.score : 0
}

function averageRating(id) {
  const ratings = socialData.value.ratings.filter(item => item.itemId === id)
  if (ratings.length === 0) return 'No rating yet'

  const total = ratings.reduce((sum, item) => sum + item.score, 0)
  return (total / ratings.length).toFixed(1)
}

function handleLike(item) {
  toggleLike(currentUserId, item)
  refresh()
  notify('Like status updated successfully', 'bg-success')
}

function handleFavourite(item) {
  toggleFavourite(currentUserId, item)
  refresh()
  notify('Favourite status updated successfully', 'bg-success')
}

function handleRate(item, score) {
  rateTemplate(currentUserId, item, score)
  refresh()
  notify('Rating saved successfully', 'bg-warning')
}

const myLikesCount = computed(() =>
  socialData.value.likes.filter(item => item.userId === currentUserId).length
)

const myFavouritesCount = computed(() =>
  socialData.value.favourites.filter(item => item.userId === currentUserId).length
)

const myRatingsCount = computed(() =>
  socialData.value.ratings.filter(item => item.userId === currentUserId).length
)
</script>

<template>
  <div>
    <div class="mb-4">
      <h1 class="fw-bold">Likes, Favourites and Ratings</h1>
      <p class="text-muted">
        This page allows users to interact with design templates through likes,
        favourites and star ratings.
      </p>
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

            <p class="text-muted">
              A reusable SmartCanvas design template for users.
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
      This module prevents repeated likes by checking both user ID and template ID.
      The interaction data is stored persistently in localStorage.
    </div>
  </div>
</template>