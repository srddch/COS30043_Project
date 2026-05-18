<script setup>
import { ref, computed } from 'vue'
import { getSocialData } from '../../store/social'

const currentUserId = 1
const socialData = ref(getSocialData())

const myRatings = computed(() => {
  return socialData.value.ratings.filter(item => item.userId === currentUserId)
})

const averageScore = computed(() => {
  if (myRatings.value.length === 0) return 0

  const total = myRatings.value.reduce((sum, item) => sum + item.score, 0)
  return (total / myRatings.value.length).toFixed(1)
})
</script>

<template>
  <div>
    <div class="mb-4">
      <h1 class="fw-bold">My Rating History</h1>
      <p class="text-muted">
        This page records the templates rated by the current user.
      </p>
    </div>

    <div class="card shadow-sm mb-4">
      <div class="card-body text-center">
        <h2>{{ averageScore }}</h2>
        <p class="text-muted mb-0">Average Rating Given</p>
      </div>
    </div>

    <div v-if="myRatings.length === 0" class="alert alert-warning">
      You have not rated any template yet.
    </div>

    <div v-else class="card shadow-sm">
      <div class="card-body">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th>Template</th>
              <th>Type</th>
              <th>Score</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in myRatings" :key="item.itemId">
              <td>{{ item.title }}</td>
              <td>{{ item.type }}</td>
              <td>
                <span class="badge bg-warning text-dark">
                  {{ item.score }} Stars
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>