<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { getTemplates } from '../../store/social'
import { supabase } from '../../lib/supabase'

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

  const { data: likesData, error: likesError } = await supabase
    .from('likes')
    .select('*')
    .eq('user_id', currentUserId)

  const { data: favouritesData, error: favouritesError } = await supabase
    .from('favourites')
    .select('*')
    .eq('user_id', currentUserId)

  const { data: ratingsData, error: ratingsError } = await supabase
    .from('ratings')
    .select('*')
    .eq('user_id', currentUserId)

  if (likesError || favouritesError || ratingsError) {
    console.error(likesError || favouritesError || ratingsError)
    notify('Failed to load social data', 'bg-danger')
    return
  }

  likes.value = likesData || []
  favourites.value = favouritesData || []
  ratings.value = ratingsData || []
}

function isLiked(courseId) {
  return likes.value.some(item => item.course_id === courseId)
}

function isFavourited(courseId) {
  return favourites.value.some(item => item.course_id === courseId)
}

function myRating(courseId) {
  const rating = ratings.value.find(item => item.course_id === courseId)
  return rating ? rating.rating : 0
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
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', currentUserId)
      .eq('course_id', item.id)

    if (error) {
      console.error(error)
      notify('Failed to remove like', 'bg-danger')
      return
    }

    notify('Like removed from database', 'bg-success')
  } else {
    const { error } = await supabase
      .from('likes')
      .insert([
        {
          user_id: currentUserId,
          course_id: item.id
        }
      ])

    if (error) {
      console.error(error)
      notify('Failed to save like', 'bg-danger')
      return
    }

    notify('Like saved to database', 'bg-success')
  }

  await loadSocialData()
}

async function handleFavourite(item) {
  if (!currentUserId) {
    notify('Please login first', 'bg-warning')
    return
  }

  if (isFavourited(item.id)) {
    const { error } = await supabase
      .from('favourites')
      .delete()
      .eq('user_id', currentUserId)
      .eq('course_id', item.id)

    if (error) {
      console.error(error)
      notify('Failed to remove favourite', 'bg-danger')
      return
    }

    notify('Favourite removed from database', 'bg-success')
  } else {
    const { error } = await supabase
      .from('favourites')
      .insert([
        {
          user_id: currentUserId,
          course_id: item.id
        }
      ])

    if (error) {
      console.error(error)
      notify('Failed to save favourite', 'bg-danger')
      return
    }

    notify('Favourite saved to database', 'bg-success')
  }

  await loadSocialData()
}

async function handleRate(item, score) {
  if (!currentUserId) {
    notify('Please login first', 'bg-warning')
    return
  }

  const existingRating = ratings.value.find(
    rating => rating.course_id === item.id
  )

  if (existingRating) {
    const { error } = await supabase
      .from('ratings')
      .update({ rating: score })
      .eq('user_id', currentUserId)
      .eq('course_id', item.id)

    if (error) {
      console.error(error)
      notify('Failed to update rating', 'bg-danger')
      return
    }

    notify('Rating updated in database', 'bg-warning')
  } else {
    const { error } = await supabase
      .from('ratings')
      .insert([
        {
          user_id: currentUserId,
          course_id: item.id,
          rating: score
        }
      ])

    if (error) {
      console.error(error)
      notify('Failed to save rating', 'bg-danger')
      return
    }

    notify('Rating saved to database', 'bg-warning')
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