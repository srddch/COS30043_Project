<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import { selectionStore } from '../../store/selection'

const notify = inject('notify', () => {})

const user = JSON.parse(localStorage.getItem('user'))
const currentUserId = user ? String(user.id) : null

const favourites = ref([])
const courses = ref([])
const schedule = ref([])

const timeSlots = [
  { day: 'Monday', time: '09:00 - 10:30' },
  { day: 'Wednesday', time: '09:00 - 10:30' },
  { day: 'Tuesday', time: '11:00 - 12:30' },
  { day: 'Thursday', time: '11:00 - 12:30' },
  { day: 'Wednesday', time: '14:00 - 15:30' },
  { day: 'Friday', time: '14:00 - 15:30' },
  { day: 'Monday', time: '16:00 - 17:30' },
  { day: 'Thursday', time: '16:00 - 17:30' }
]

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const times = [
  '09:00 - 10:30',
  '11:00 - 12:30',
  '14:00 - 15:30',
  '16:00 - 17:30'
]

onMounted(async () => {
  await loadData()
})

async function loadData() {
  if (!currentUserId) {
    notify('Please login to use the schedule feature', 'bg-warning')
    return
  }

  await loadCourses()
  await loadFavourites()
  await loadSchedule()
  await selectionStore.fetchSelections()
}

async function loadCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('id, code, desc, cp, type')
    .order('id', { ascending: true })

  if (error) {
    console.error(error)
    notify('Failed to load courses', 'bg-danger')
    return
  }

  courses.value = data || []
}

async function loadFavourites() {
  const { data, error } = await supabase
    .from('favourites')
    .select('*')
    .eq('user_id', currentUserId)

  if (error) {
    console.error(error)
    notify('Failed to load favourites', 'bg-danger')
    return
  }

  favourites.value = data || []
}

async function loadSchedule() {
  const { data, error } = await supabase
    .from('social_schedules')
    .select('*')
    .eq('user_id', currentUserId)
    .order('id', { ascending: true })

  if (error) {
    console.error(error)
    notify('Failed to load schedule', 'bg-danger')
    return
  }

  schedule.value = data || []
}

function getCourse(courseId) {
  return courses.value.find(course => course.id === courseId)
}

const favouriteCourses = computed(() => {
  return favourites.value
    .map(item => getCourse(item.course_id))
    .filter(Boolean)
})

const enrolledCourses = computed(() => {
  return selectionStore.enrolledUnits.map(enrolled => {
    return courses.value.find(c => c.code === enrolled.code)
  }).filter(Boolean)
})

const scheduleCourses = computed(() => {
  return schedule.value.map(item => {
    const course = getCourse(item.course_id)

    return {
      ...item,
      courseCode: course ? course.code : 'Unknown',
      courseTitle: course ? course.desc : 'Unknown Course',
      courseType: course ? course.type : 'Unknown'
    }
  })
})

function getCoursesByDayAndTime(day, time) {
  return scheduleCourses.value.filter(item => {
    return item.day === day && item.time_slot === time
  })
}

function typeBadgeClass(type) {
  if (type === 'Core') return 'bg-primary'
  if (type === 'Software Development') return 'bg-success'
  if (type === 'Systems Analysis') return 'bg-warning text-dark'
  return 'bg-secondary'
}

async function generateSchedule() {
  if (!currentUserId) {
    notify('Please login first', 'bg-warning')
    return
  }

  if (enrolledCourses.value.length === 0) {
    notify('Please select at least one course in Course Catalogue first', 'bg-warning')
    return
  }

  await supabase
    .from('social_schedules')
    .delete()
    .eq('user_id', currentUserId)

  const newSchedule = []

  enrolledCourses.value.forEach((course, courseIndex) => {
    const firstSlot = timeSlots[(courseIndex * 2) % timeSlots.length]
    const secondSlot = timeSlots[(courseIndex * 2 + 1) % timeSlots.length]

    newSchedule.push({
      user_id: currentUserId,
      course_id: course.id,
      day: firstSlot.day,
      time_slot: firstSlot.time
    })

    newSchedule.push({
      user_id: currentUserId,
      course_id: course.id,
      day: secondSlot.day,
      time_slot: secondSlot.time
    })
  })

  const { error } = await supabase
    .from('social_schedules')
    .insert(newSchedule)

  if (error) {
    console.error(error)
    notify('Failed to generate schedule', 'bg-danger')
    return
  }

  notify('Schedule generated and saved to database', 'bg-success')
  await loadSchedule()
}

async function clearSchedule() {
  if (!currentUserId) {
    notify('Please login first', 'bg-warning')
    return
  }

  const { error } = await supabase
    .from('social_schedules')
    .delete()
    .eq('user_id', currentUserId)

  if (error) {
    console.error(error)
    notify('Failed to clear schedule', 'bg-danger')
    return
  }

  schedule.value = []
  notify('Schedule cleared from database', 'bg-danger')
}
</script>

<template>
  <div>
    <div class="mb-4">
      <h1 class="fw-bold">Automatic Schedule Generator</h1>

      <p class="text-muted">
  This page automatically generates a weekly study schedule based on your <strong>selected units</strong> from the course catalogue.
</p>

      <div
        v-if="!currentUserId"
        class="alert alert-warning"
      >
        Please login to use the schedule feature.
      </div>
    </div>

    <div class="row g-4 mb-4">
      <!-- Left Column: Favourites (Existing Feature) -->
      <div class="col-md-6">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h4 class="fw-bold">My Favourite Courses</h4>
            <div v-if="favouriteCourses.length === 0" class="text-muted">
              No favourite courses yet.
            </div>
            <ul v-else class="list-group list-group-flush">
              <li v-for="course in favouriteCourses" :key="course.id" class="list-group-item d-flex justify-content-between align-items-center px-0">
                <div>
                  <strong>{{ course.code }}</strong>
                  <div class="text-muted small">{{ course.desc }}</div>
                </div>
                <span class="badge" :class="typeBadgeClass(course.type)">{{ course.type }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Right Column: Selections (New Generator Source) -->
      <div class="col-md-6">
        <div class="card shadow-sm h-100 border-primary">
          <div class="card-body">
            <h4 class="fw-bold text-primary">My Selected Units</h4>
            <p class="small text-muted mb-3">These units will be used to generate your schedule.</p>
            <div v-if="enrolledCourses.length === 0" class="text-muted">
              No units selected in Course Catalogue.
            </div>
            <ul v-else class="list-group list-group-flush">
              <li v-for="course in enrolledCourses" :key="course.id" class="list-group-item d-flex justify-content-between align-items-center px-0">
                <div>
                  <strong>{{ course.code }}</strong>
                  <div class="text-muted small">{{ course.desc }}</div>
                </div>
                <span class="badge" :class="typeBadgeClass(course.type)">{{ course.type }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="d-flex gap-2 mb-4">
      <button
        class="btn btn-primary px-4"
        :disabled="!currentUserId || enrolledCourses.length === 0"
        @click="generateSchedule"
      >
        <i class="bi bi-calendar-plus me-2"></i>Generate Schedule
      </button>

      <button
        class="btn btn-outline-danger"
        :disabled="!currentUserId"
        @click="clearSchedule"
      >
        Clear Schedule
      </button>
    </div>

    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <h4 class="fw-bold mb-3">Weekly Calendar View</h4>

        <div class="table-responsive">
          <table class="table table-bordered align-middle text-center calendar-table">
            <thead>
              <tr>
                <th>Time</th>

                <th
                  v-for="day in days"
                  :key="day"
                >
                  {{ day }}
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="time in times"
                :key="time"
              >
                <th class="text-nowrap">
                  {{ time }}
                </th>

                <td
                  v-for="day in days"
                  :key="day + time"
                >
                  <div
                    v-for="item in getCoursesByDayAndTime(day, time)"
                    :key="item.id"
                    class="calendar-course mb-2"
                  >
                    <strong>
                      {{ item.courseCode }}
                    </strong>

                    <div class="small">
                      {{ item.courseTitle }}
                    </div>

                    <div class="mt-2">
                      <span
                        class="badge"
                        :class="typeBadgeClass(item.courseType)"
                      >
                        {{ item.courseType }}
                      </span>
                    </div>
                  </div>

                  <span
                    v-if="getCoursesByDayAndTime(day, time).length === 0"
                    class="text-muted small"
                  >
                    -
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <h4 class="fw-bold">Generated Schedule</h4>

        <div
          v-if="scheduleCourses.length === 0"
          class="text-muted"
        >
          No schedule has been generated yet.
        </div>

        <div
          v-else
          class="table-responsive"
        >
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Type</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="item in scheduleCourses"
                :key="item.id"
              >
                <td>{{ item.day }}</td>
                <td>{{ item.time_slot }}</td>
                <td>{{ item.courseCode }}</td>
                <td>{{ item.courseTitle }}</td>

                <td>
                  <span
                    class="badge"
                    :class="typeBadgeClass(item.courseType)"
                  >
                    {{ item.courseType }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-table th,
.calendar-table td {
  min-width: 160px;
  vertical-align: middle;
}

.calendar-course {
  border-radius: 12px;
  padding: 10px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
}

.calendar-course:last-child {
  margin-bottom: 0 !important;
}
</style>