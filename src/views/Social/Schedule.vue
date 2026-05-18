<script setup>
import { ref, computed, inject } from 'vue'
import {
  getSocialData,
  generateSchedule,
  clearSchedule
} from '../../store/social'

const notify = inject('notify', () => {})
const currentUserId = 1
const socialData = ref(getSocialData())

function refresh() {
  socialData.value = getSocialData()
}

const myFavourites = computed(() => {
  return socialData.value.favourites.filter(item => item.userId === currentUserId)
})

const mySchedule = computed(() => {
  return socialData.value.schedule.filter(item => item.userId === currentUserId)
})

function handleGenerate() {
  generateSchedule(currentUserId)
  refresh()
  notify('Schedule generated successfully', 'bg-success')
}

function handleClear() {
  clearSchedule(currentUserId)
  refresh()
  notify('Schedule cleared successfully', 'bg-danger')
}
</script>

<template>
  <div>
    <div class="mb-4">
      <h1 class="fw-bold">Automatic Schedule Generator</h1>
      <p class="text-muted">
        Advanced Feature 1: the system automatically creates a personal schedule
        based on the user's favourite templates.
      </p>
    </div>

    <div class="alert alert-success">
      This is an advanced feature because it uses stored user interaction data
      and automatically converts favourite templates into a generated schedule.
    </div>

    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <h4 class="fw-bold">My Favourite Templates</h4>

        <div v-if="myFavourites.length === 0" class="text-muted">
          No favourite templates yet. Please add favourites first.
        </div>

        <ul v-else class="list-group">
          <li
            v-for="item in myFavourites"
            :key="item.itemId"
            class="list-group-item d-flex justify-content-between"
          >
            <span>{{ item.title }}</span>
            <span class="badge bg-success">{{ item.type }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="d-flex gap-2 mb-4">
      <button
        class="btn btn-primary"
        :disabled="myFavourites.length === 0"
        @click="handleGenerate"
      >
        Generate Schedule
      </button>

      <button class="btn btn-outline-danger" @click="handleClear">
        Clear Schedule
      </button>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <h4 class="fw-bold">Generated Schedule</h4>

        <div v-if="mySchedule.length === 0" class="text-muted">
          No schedule has been generated yet.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th>Template</th>
                <th>Type</th>
                <th>Suggested Time</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in mySchedule" :key="item.itemId">
                <td>{{ item.title }}</td>
                <td>{{ item.type }}</td>
                <td>{{ item.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>