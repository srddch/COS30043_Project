<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'

const user = JSON.parse(localStorage.getItem('user'))
const currentUserId = user ? String(user.id) : null

const ratings = ref([])

onMounted(async () => {
  await loadRatings()
})

async function loadRatings() {
  if (!currentUserId) {
    ratings.value = []
    return
  }

  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('user_id', currentUserId)

  if (error) {
    console.error(error)
    return
  }

  ratings.value = data || []
}

const myRatings = computed(() => {
  return ratings.value
})

const averageScore = computed(() => {
  if (myRatings.value.length === 0) return 0

  const total = myRatings.value.reduce(
    (sum, item) => sum + Number(item.rating),
    0
  )

  return (total / myRatings.value.length).toFixed(1)
})
</script>

<template>
  <div>
    <div class="mb-4">
      <h1 class="fw-bold">My Rating History</h1>

      <p class="text-muted">
  This page displays the rating history and average rating given by the current user.
</p>

      <div
        v-if="!currentUserId"
        class="alert alert-warning"
      >
        Please login to view your rating history.
      </div>
    </div>

    <div class="card shadow-sm mb-4">
      <div class="card-body text-center">
        <h2>{{ averageScore }}</h2>

        <p class="text-muted mb-0">
          Average Rating Given
        </p>
      </div>
    </div>

    <div
      v-if="currentUserId && myRatings.length === 0"
      class="alert alert-warning"
    >
      You have not rated any course yet.
    </div>

    <div
      v-else-if="currentUserId"
      class="card shadow-sm"
    >
      <div class="card-body">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th>Course ID</th>
              <th>Rating</th>
              <th>Created Time</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in myRatings"
              :key="item.id"
            >
              <td>
                {{ item.course_id }}
              </td>

              <td>
                <span class="badge bg-warning text-dark">
                  {{ item.rating }} Stars
                </span>
              </td>

              <td>
                {{ new Date(item.created_at).toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>