<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUser } from './User/composables/useUser'
import api from '../services/api'

const { user, loadUser } = useUser()
loadUser()

// --- Drag-and-Drop Study Task Board ---
const newTask = ref('')
const tasks = ref([])
const isLoadingTasks = ref(false)
const taskError = ref('')
const draggedTaskId = ref(null)

const columns = [
  {
    key: 'todo',
    title: 'To Do',
    subtitle: 'Tasks waiting to be started',
    badgeClass: 'bg-secondary',
    borderClass: 'border-secondary'
  },
  {
    key: 'in_progress',
    title: 'In Progress',
    subtitle: 'Tasks currently being worked on',
    badgeClass: 'bg-primary',
    borderClass: 'border-primary'
  },
  {
    key: 'completed',
    title: 'Completed',
    subtitle: 'Finished study goals',
    badgeClass: 'bg-success',
    borderClass: 'border-success'
  }
]

const loadTasks = async () => {
  try {
    isLoadingTasks.value = true
    taskError.value = ''

     const res = await api.get('/tasks', {
      params: { user_id: user.value.id }
    })
    tasks.value = res.data.map(task => ({
      ...task,
      status: task.status || (task.done ? 'completed' : 'todo')
    }))
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
      text,
      user_id: user.value.id  
    })
    tasks.value.unshift({
      ...res.data,
      status: res.data.status || 'todo'
    })

    newTask.value = ''
  } catch (error) {
    console.error('Failed to add task:', error)
    taskError.value = 'Failed to add task.'
  }
}

const deleteTask = async (id) => {
  try {
    taskError.value = ''

    await api.delete(`/tasks/${id}`,{
      data: { user_id: user.value.id }
    })
    tasks.value = tasks.value.filter(task => task.id !== id)
  } catch (error) {
    console.error('Failed to delete task:', error)
    taskError.value = 'Failed to delete task.'
  }
}

const getTasksByStatus = (status) => {
  return tasks.value.filter(task => task.status === status)
}

const startDrag = (task) => {
  draggedTaskId.value = task.id
}

const dropTask = async (newStatus) => {
  if (!draggedTaskId.value) return

  const task = tasks.value.find(item => item.id === draggedTaskId.value)

  if (!task || task.status === newStatus) {
    draggedTaskId.value = null
    return
  }

  const oldStatus = task.status
  task.status = newStatus
  task.done = newStatus === 'completed'

  try {
    taskError.value = ''

    await api.put(`/tasks/${task.id}`, {
      status: newStatus,
      user_id: user.value.id
    })
  } catch (error) {
    console.error('Failed to update task status:', error)
    taskError.value = 'Failed to update task status.'

    task.status = oldStatus
    task.done = oldStatus === 'completed'
  } finally {
    draggedTaskId.value = null
  }
}

const progress = computed(() => {
  if (tasks.value.length === 0) return 0
  return Math.round((getTasksByStatus('completed').length / tasks.value.length) * 100)
})

const totalTasks = computed(() => tasks.value.length)
const completedTasks = computed(() => getTasksByStatus('completed').length)
const inProgressTasks = computed(() => getTasksByStatus('in_progress').length)

onMounted(() => {
  loadTasks()
})
</script>

<template>
  <div class="home">
    <!-- Header Section -->
    <div class="row mb-4 align-items-center">
      <div class="col-md-7">
        <h1 class="display-5 fw-bold">Dashboard</h1>
        <p class="text-secondary">
          Welcome back,
          {{ user?.first_name || 'Student' }}
          {{ user?.last_name || '' }}!
          {{ user?.role === 'teacher' ? 'Manage your courses and students.' : 'Stay organized with your study goals.' }}
        </p>
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

    <!-- Study Summary Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="summary-card bg-white shadow-sm border rounded-3 p-3">
          <div class="text-muted small">Total Tasks</div>
          <div class="h3 fw-bold mb-0">{{ totalTasks }}</div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="summary-card bg-white shadow-sm border rounded-3 p-3">
          <div class="text-muted small">In Progress</div>
          <div class="h3 fw-bold text-primary mb-0">{{ inProgressTasks }}</div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="summary-card bg-white shadow-sm border rounded-3 p-3">
          <div class="text-muted small">Completed</div>
          <div class="h3 fw-bold text-success mb-0">{{ completedTasks }}</div>
        </div>
      </div>
    </div>

    <!-- Drag-and-Drop Task Board -->
    <div class="card shadow-sm border-0 mb-4">
      <div class="card-header bg-white border-0 py-3">
        <div class="d-flex flex-column flex-md-row justify-content-between gap-3">
          <div>
            <h5 class="mb-1 fw-bold">Study Task Board</h5>
            <p class="text-muted small mb-0">
              Drag tasks between columns to manage your study progress.
            </p>
          </div>

          <div class="input-group task-input">
            <input
              v-model="newTask"
              @keyup.enter="addTask"
              type="text"
              class="form-control border-primary-subtle"
              placeholder="Add a new study task..."
            >

            <button
              @click="addTask"
              class="btn btn-primary px-4"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div class="card-body">
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
          class="row g-3"
        >
          <div
            v-for="column in columns"
            :key="column.key"
            class="col-lg-4"
          >
            <div
              class="task-column h-100 rounded-3 border bg-light p-3"
              :class="column.borderClass"
              @dragover.prevent
              @drop="dropTask(column.key)"
            >
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 class="fw-bold mb-1">{{ column.title }}</h6>
                  <p class="text-muted small mb-0">{{ column.subtitle }}</p>
                </div>

                <span class="badge rounded-pill" :class="column.badgeClass">
                  {{ getTasksByStatus(column.key).length }}
                </span>
              </div>

              <div
                v-if="getTasksByStatus(column.key).length === 0"
                class="empty-column text-center text-muted small py-4"
              >
                Drop tasks here
              </div>

              <div
                v-for="task in getTasksByStatus(column.key)"
                :key="task.id"
                class="task-card bg-white rounded-3 shadow-sm border p-3 mb-3"
                draggable="true"
                @dragstart="startDrag(task)"
              >
                <div class="d-flex justify-content-between gap-2">
                  <div>
                    <p
                      class="mb-2 fw-medium"
                      :class="{ 'text-decoration-line-through text-muted': task.status === 'completed' }"
                    >
                      {{ task.text }}
                    </p>

                    <span
                      class="badge small"
                      :class="column.badgeClass"
                    >
                      {{ column.title }}
                    </span>
                  </div>

                  <button
                    @click="deleteTask(task.id)"
                    class="btn btn-sm btn-link text-danger text-decoration-none p-0"
                    title="Delete task"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="tasks.length === 0"
            class="text-center py-4 text-muted"
          >
            <div class="display-6 mb-2">🎯</div>
            <p class="mb-0 small">
              No tasks yet. Add your first study task to start planning.
            </p>
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

.summary-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.task-input {
  max-width: 420px;
}

.task-column {
  min-height: 320px;
  border-width: 2px !important;
  border-style: dashed !important;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.task-column:hover {
  background-color: #f1f5ff !important;
}

.task-card {
  cursor: grab;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.12) !important;
}

.task-card:active {
  cursor: grabbing;
}

.empty-column {
  border: 1px dashed #ced4da;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 767.98px) {
  .task-input {
    max-width: 100%;
  }
}
</style>
