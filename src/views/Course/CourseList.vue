<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import api from '../../services/api'
import { selectionStore } from '../../store/selection'

const notify = inject('notify')

const units = ref([])
const loading = ref(true)
const selectedUnit = ref(null)
const searchQuery = ref('')
const categoryFilter = ref('all')

const fetchUnits = async () => {
  loading.value = true
  try {
    const response = await api.get('/courses')
    units.value = response.data
  } catch (error) {
    console.error('Error fetching courses:', error)
    notify('Failed to load courses from backend', 'bg-danger')
  } finally {
    loading.value = false
  }
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'Core', label: 'Core' },
  { value: 'Software Development', label: 'Software Development' },
  { value: 'Systems Analysis', label: 'Systems Analysis' }
]

const filteredUnits = computed(() => {
  let result = [...units.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(unit => 
      unit.code.toLowerCase().includes(query) ||
      unit.course_title.toLowerCase().includes(query) ||
      unit.desc.toLowerCase().includes(query)
    )
  }

  if (categoryFilter.value !== 'all') {
    result = result.filter(unit => unit.category === categoryFilter.value)
  }

  return result
})

const stats = computed(() => {
  const total = units.value.length
  const core = units.value.filter(u => u.category === 'Core').length
  const software = units.value.filter(u => u.category === 'Software Development').length
  const systems = units.value.filter(u => u.category === 'Systems Analysis').length
  
  return { total, core, software, systems }
})

const selectUnit = (unit) => {
  selectedUnit.value = unit
}

const handleEnroll = (unit) => {
  const result = selectionStore.toggleEnroll(unit)
  if (result.success) {
    if (result.action === 'enrolled') {
      notify('Enrolled successfully!', 'bg-success')
    } else {
      notify('Removed from enrollment', 'bg-info')
    }
  } else {
    notify(result.message, 'bg-danger')
  }
}

const getCategoryColor = (category) => {
  switch (category) {
    case 'Core': return 'bg-primary-subtle text-primary'
    case 'Software Development': return 'bg-success-subtle text-success'
    case 'Systems Analysis': return 'bg-warning-subtle text-warning'
    default: return 'bg-secondary-subtle text-secondary'
  }
}

const getEnrollmentPercent = (unit) => {
  return Math.round((unit.current_enrollment / unit.enrollment_capacity) * 100)
}

onMounted(() => {
  fetchUnits()
})
</script>

<template>
  <div class="courses-page">
    <div class="row mb-4">
      <div class="col-12">
        <h1 class="display-5 fw-bold">Course Catalogue</h1>
        <p class="text-secondary">Explore all available units and courses</p>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="card shadow-sm border-0 mb-4 p-4">
      <div class="row g-3">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text bg-light">🔍</span>
            <input v-model="searchQuery" type="text" class="form-control" placeholder="Search by code or title...">
          </div>
        </div>
        <div class="col-md-4">
          <select v-model="categoryFilter" class="form-select">
            <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
          </select>
        </div>
        <div class="col-md-2">
          <button @click="searchQuery = ''; categoryFilter = 'all'" class="btn btn-outline-secondary w-100">Reset</button>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- Left Panel: Units List -->
      <div class="col-lg-5">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
            <h5 class="mb-0 fw-bold">Available Units</h5>
            <span class="badge bg-primary rounded-pill">{{ filteredUnits.length }}</span>
          </div>
          <div class="card-body p-0" style="max-height: 600px; overflow-y: auto;">
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2 text-muted">Fetching units...</p>
            </div>
            <div v-else-if="filteredUnits.length === 0" class="text-center py-5">
              <p class="text-muted">No units found</p>
            </div>
            <div v-else>
              <div 
                v-for="unit in filteredUnits" 
                :key="unit.code"
                @click="selectUnit(unit)"
                class="list-group-item list-group-item-action border-0 border-bottom px-4 py-3 cursor-pointer"
                :class="{ 'bg-primary bg-opacity-10': selectedUnit?.code === unit.code }"
              >
                <div class="d-flex justify-content-between align-items-start mb-1">
                  <span class="fw-bold text-primary">{{ unit.code }}</span>
                  <div class="d-flex align-items-center">
                    <span v-if="selectionStore.isEnrolled(unit.code)" class="badge bg-success me-2">Enrolled</span>
                    <span class="badge" :class="getCategoryColor(unit.category)">{{ unit.category }}</span>
                  </div>
                </div>
                <div class="fw-medium mb-1">{{ unit.course_title }}</div>
                <div class="d-flex justify-content-between align-items-center text-muted small">
                  <span>👨‍🏫 {{ unit.instructor }}</span>
                  <span>{{ unit.credits }} credits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Unit Details -->
      <div class="col-lg-7">
        <div class="card shadow-sm border-0 h-100">
          <div v-if="!selectedUnit" class="card-body p-5 text-center d-flex flex-column justify-content-center">
            <div class="display-1 mb-3">📚</div>
            <h3 class="fw-bold mb-3">Select a unit to view details</h3>
            <p class="text-muted mb-4">You can enroll in up to 4 units per semester.</p>
            <div class="row g-3">
              <div class="col-4">
                <div class="p-3 bg-light rounded">
                  <div class="h4 mb-0 fw-bold">{{ stats.core }}</div>
                  <div class="small text-muted">Core</div>
                </div>
              </div>
              <div class="col-4">
                <div class="p-3 bg-light rounded">
                  <div class="h4 mb-0 fw-bold">{{ stats.software }}</div>
                  <div class="small text-muted">Software</div>
                </div>
              </div>
              <div class="col-4">
                <div class="p-3 bg-light rounded">
                  <div class="h4 mb-0 fw-bold">{{ stats.systems }}</div>
                  <div class="small text-muted">Systems</div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="h-100 d-flex flex-column">
            <div class="card-header bg-white border-0 py-3 px-4">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <span class="badge me-2" :class="getCategoryColor(selectedUnit.category)">{{ selectedUnit.category }}</span>
                  <span class="text-muted small">{{ selectedUnit.semester_offered }}</span>
                </div>
                <button @click="selectedUnit = null" class="btn btn-outline-secondary btn-sm">✕ Close</button>
              </div>
            </div>
            <div class="card-body flex-grow-1 overflow-auto p-4">
              <div class="mb-4">
                <h2 class="fw-bold mb-1">{{ selectedUnit.code }}</h2>
                <h4 class="text-primary mb-3">{{ selectedUnit.course_title }}</h4>
                <p class="text-secondary">{{ selectedUnit.detailed_description }}</p>
              </div>

              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <div class="card border-0 bg-light p-3">
                    <div class="text-muted small mb-1">Credits</div>
                    <div class="fw-bold">{{ selectedUnit.credits }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card border-0 bg-light p-3">
                    <div class="text-muted small mb-1">Instructor</div>
                    <div class="fw-bold">{{ selectedUnit.instructor }}</div>
                  </div>
                </div>
              </div>

              <div class="mb-4">
                <h6 class="fw-bold mb-3">Enrollment Status</h6>
                <div class="card border-0 bg-light p-3">
                  <div class="d-flex justify-content-between mb-2 small">
                    <span>{{ selectedUnit.current_enrollment }} / {{ selectedUnit.enrollment_capacity }} students</span>
                    <span>{{ getEnrollmentPercent(selectedUnit) }}%</span>
                  </div>
                  <div class="progress" style="height: 8px;">
                    <div 
                      class="progress-bar" 
                      :class="getEnrollmentPercent(selectedUnit) > 80 ? 'bg-danger' : getEnrollmentPercent(selectedUnit) > 50 ? 'bg-warning' : 'bg-success'"
                      :style="{ width: getEnrollmentPercent(selectedUnit) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>

              <div v-if="selectedUnit.prerequisites.length > 0" class="mb-4">
                <h6 class="fw-bold mb-2">Prerequisites</h6>
                <div class="d-flex flex-wrap gap-2">
                  <span v-for="prereq in selectedUnit.prerequisites" :key="prereq" class="badge bg-secondary">{{ prereq }}</span>
                </div>
              </div>

              <div>
                <h6 class="fw-bold mb-2">Unit Tags</h6>
                <div class="d-flex flex-wrap gap-2">
                  <span v-for="tag in selectedUnit.tags" :key="tag" class="badge bg-light text-dark">{{ tag }}</span>
                </div>
              </div>
            </div>
            <div class="card-footer bg-white border-0 p-4">
              <button 
                @click="handleEnroll(selectedUnit)" 
                class="btn w-100 py-3 fw-bold" 
                :class="selectionStore.isEnrolled(selectedUnit.code) ? 'btn-danger' : 'btn-primary'"
              >
                {{ selectionStore.isEnrolled(selectedUnit.code) ? 'Remove from Selection' : 'Enroll in this Unit' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card { border-radius: 12px; }
.form-control, .form-select { border-radius: 8px; }
.btn { border-radius: 8px; transition: all 0.2s; }
.cursor-pointer { cursor: pointer; }
.list-group-item:hover { background-color: #f8f9fa; }
</style>
