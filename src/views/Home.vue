<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '../services/api'

// --- Task Manager Logic with Database ---
const newTask = ref('')
const tasks = ref([])
const isLoadingTasks = ref(false)
const taskError = ref('')

const loadTasks = async () => {
  try {
    isLoadingTasks.value = true
    taskError.value = ''

    const res = await api.get('/tasks')
    tasks.value = res.data
  } catch (error) {
    console.error('Failed to load tasks:', error)
    taskError.value = 'Failed to load tasks from database.'
  } finally {
    isLoadingTasks.value = false
  }
}

const addTask = async () => {
  const text = newTask.value.trim()

  if (!text) return

  try {
    taskError.value = ''

    const res = await api.post('/tasks', {
      text: text
    })

    tasks.value.unshift(res.data)
    newTask.value = ''
  } catch (error) {
    console.error('Failed to add task:', error)
    taskError.value = 'Failed to add task.'
  }
}

const updateTask = async (task) => {
  try {
    taskError.value = ''

    await api.put(`/tasks/${task.id}`, {
      done: task.done
    })
  } catch (error) {
    console.error('Failed to update task:', error)
    taskError.value = 'Failed to update task.'

    // 如果数据库更新失败，恢复 checkbox 状态
    task.done = !task.done
  }
}

const deleteTask = async (id) => {
  try {
    taskError.value = ''

    await api.delete(`/tasks/${id}`)
    tasks.value = tasks.value.filter(task => task.id !== id)
  } catch (error) {
    console.error('Failed to delete task:', error)
    taskError.value = 'Failed to delete task.'
  }
}

const progress = computed(() => {
  if (tasks.value.length === 0) return 0
  return Math.round((tasks.value.filter(t => t.done).length / tasks.value.length) * 100)
})

// --- Advanced Feature: Study Focus Timer (Pomodoro) ---
const timeLeft = ref(25 * 60)
const isRunning = ref(false)
const timerInterval = ref(null)

const formattedTime = computed(() => {
  const mins = Math.floor(timeLeft.value / 60)
  const secs = timeLeft.value % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

const toggleTimer = () => {
  if (isRunning.value) {
    clearInterval(timerInterval.value)
  } else {
    timerInterval.value = setInterval(() => {
      if (timeLeft.value > 0) timeLeft.value--
      else resetTimer()
    }, 1000)
  }

  isRunning.value = !isRunning.value
}

const resetTimer = () => {
  clearInterval(timerInterval.value)
  isRunning.value = false
  timeLeft.value = 25 * 60
}

onMounted(() => {
  loadTasks()
})

onUnmounted(() => clearInterval(timerInterval.value))
</script>

<template>
  <div class="home">
    <!-- Header Section -->
    <div class="row mb-4 align-items-center">
      <div class="col-md-7">
        <h1 class="display-5 fw-bold">Dashboard</h1>
        <p class="text-secondary">Welcome back! Stay organized and focused on your goals.</p>
      </div>

      <div class="col-md-5">
        <div class="p-3 bg-white shadow-sm rounded-3 border">
          <div class="d-flex justify-content-between mb-1 small fw-bold">
            <span>Overall Task Progress</span>
            <span>{{ progress }}%</span>
          </div>

          <div class="progress" style="height: 8px;">
            <div
              class="progress-bar bg-success transition-all"
              :style="{ width: progress + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <!-- Focus Timer Card -->
      <div class="col-lg-4">
        <div class="card shadow-sm border-0 h-100 bg-dark text-white">
          <div class="card-body text-center d-flex flex-column justify-content-center py-5">
            <h5 class="text-uppercase small mb-4 opacity-75">Focus Session</h5>

            <div class="display-1 fw-bold mb-4 font-monospace">
              {{ formattedTime }}
            </div>

            <div class="d-grid gap-2 d-md-block">
              <button
                @click="toggleTimer"
                :class="['btn px-4 me-md-2', isRunning ? 'btn-outline-warning' : 'btn-primary']"
              >
                {{ isRunning ? 'Pause' : 'Start' }}
              </button>

              <button
                @click="resetTimer"
                class="btn btn-outline-light px-4"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Manager Card -->
      <div class="col-lg-8">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white border-0 py-3">
            <h5 class="mb-0 fw-bold">Daily Tasks</h5>
          </div>

          <div class="card-body pt-0">
            <div class="input-group mb-3">
              <input
                v-model="newTask"
                @keyup.enter="addTask"
                type="text"
                class="form-control border-primary-subtle"
                placeholder="What is your main goal today?"
              >

              <button
                @click="addTask"
                class="btn btn-primary px-4"
              >
                Add Task
              </button>
            </div>

            <div
              v-if="taskError"
              class="alert alert-danger py-2 small"
            >
              {{ taskError }}
            </div>

            <div
              v-if="isLoadingTasks"
              class="text-center py-5 text-muted"
            >
              <p class="mb-0 small">Loading tasks...</p>
            </div>

            <div
              v-else
              class="list-group list-group-flush overflow-auto"
              style="max-height: 200px;"
            >
              <div
                v-for="task in tasks"
                :key="task.id"
                class="list-group-item d-flex justify-content-between align-items-center border-0 px-0"
              >
                <div class="form-check">
                  <input
                    v-model="task.done"
                    @change="updateTask(task)"
                    class="form-check-input shadow-none"
                    type="checkbox"
                    :id="'t-' + task.id"
                  >

                  <label
                    class="form-check-label ms-2"
                    :class="{ 'text-decoration-line-through text-muted': task.done }"
                    :for="'t-' + task.id"
                  >
                    {{ task.text }}
                  </label>
                </div>

                <button
                  @click="deleteTask(task.id)"
                  class="btn btn-sm btn-link text-danger text-decoration-none"
                >
                  Delete
                </button>
              </div>

              <!-- Empty State -->
              <div
                v-if="tasks.length === 0"
                class="text-center py-5 text-muted"
              >
                <p class="mb-0 small italic">
                  Your task list is empty. Add a task to start tracking progress!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Module Navigation Cards -->
    <div class="row g-4">
      <div class="col-md-4">
        <div class="card h-100 shadow-sm border-0 border-top border-primary border-4">
          <div class="card-body">
            <h5 class="card-title text-muted text-uppercase small fw-bold">Course Module</h5>
            <p class="card-text mb-4 text-secondary">View your enrolled courses and learning materials.</p>
            <router-link to="/courses" class="btn btn-outline-primary w-100">
              Explore Courses
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 shadow-sm border-0 border-top border-success border-4">
          <div class="card-body">
            <h5 class="card-title text-muted text-uppercase small fw-bold">Forum Module</h5>
            <p class="card-text mb-4 text-secondary">Discuss topics and share knowledge with others.</p>
            <router-link to="/forum" class="btn btn-outline-success w-100">
              Go to Forum
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 shadow-sm border-0 border-top border-warning border-4">
          <div class="card-body">
            <h5 class="card-title text-muted text-uppercase small fw-bold">Schedule Module</h5>
            <p class="card-text mb-4 text-secondary">Check your personalized study plan and timetable.</p>
            <router-link to="/schedule" class="btn btn-outline-warning w-100">
              View Schedule
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transition-all {
  transition: width 0.4s ease-in-out;
}

.card {
  border-radius: 12px;
}

.btn {
  border-radius: 8px;
  transition: all 0.2s;
}

.btn:hover {
  transform: translateY(-1px);
}

.form-control:focus {
  box-shadow: none;
  border-color: #0d6efd;
}
</style>