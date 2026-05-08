<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import unitsData from '../../assets/units.json'

// Chart.js imports
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

const notify = inject('notify')

const units = ref([])
const selectedUnit = ref(null)
const searchQuery = ref('')
const categoryFilter = ref('all')

// New state for enrollment selection
const enrolledUnits = ref([])
const leftTab = ref('all') // 'all' or 'my'

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

// Current display list for the left panel
const displayUnits = computed(() => {
  if (leftTab.value === 'my') {
    return enrolledUnits.value
  }
  return filteredUnits.value
})

const stats = computed(() => {
  const total = units.value.length
  const core = units.value.filter(u => u.category === 'Core').length
  const software = units.value.filter(u => u.category === 'Software Development').length
  const systems = units.value.filter(u => u.category === 'Systems Analysis').length
  const totalStudents = units.value.reduce((sum, u) => sum + u.current_enrollment, 0)
  
  return { total, core, software, systems, totalStudents }
})

// Chart Data for All Units
const allUnitsChartData = computed(() => {
  return {
    labels: ['Core', 'Software Development', 'Systems Analysis'],
    datasets: [
      {
        backgroundColor: ['#0d6efd', '#198754', '#ffc107'],
        data: [stats.value.core, stats.value.software, stats.value.systems]
      }
    ]
  }
})

// Chart Data for Selected Units
const enrolledUnitsChartData = computed(() => {
  const coreCount = enrolledUnits.value.filter(u => u.category === 'Core').length
  const softwareCount = enrolledUnits.value.filter(u => u.category === 'Software Development').length
  const systemsCount = enrolledUnits.value.filter(u => u.category === 'Systems Analysis').length
  
  return {
    labels: ['Core', 'Software Development', 'Systems Analysis'],
    datasets: [
      {
        backgroundColor: ['#0d6efd', '#198754', '#ffc107'],
        data: [coreCount, softwareCount, systemsCount]
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}

const selectUnit = (unit) => {
  selectedUnit.value = unit
}

const toggleEnroll = (unit) => {
  const index = enrolledUnits.value.findIndex(u => u.code === unit.code)
  if (index > -1) {
    enrolledUnits.value.splice(index, 1)
    notify('Removed from enrollment', 'bg-info')
  } else {
    if (enrolledUnits.value.length >= 4) {
      notify('Maximum 4 units allowed!', 'bg-danger')
      return
    }
    enrolledUnits.value.push(unit)
    notify('Enrolled successfully!', 'bg-success')
  }
}

const isEnrolled = (code) => {
  return enrolledUnits.value.some(u => u.code === code)
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
  units.value = unitsData
})
</script>

<template>
  <div class="courses-page">
    <div class="row mb-4">
      <div class="col-12">
        <h1 class="display-5 fw-bold">Course Catalogue</h1>
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
          <div class="card-header bg-white border-0 p-0">
            <ul class="nav nav-tabs nav-fill">
              <li class="nav-item">
                <button 
                  class="nav-link border-0 py-3" 
                  :class="{ active: leftTab === 'all' }" 
                  @click="leftTab = 'all'"
                >
                  All Units ({{ filteredUnits.length }})
                </button>
              </li>
              <li class="nav-item">
                <button 
                  class="nav-link border-0 py-3" 
                  :class="{ active: leftTab === 'my' }" 
                  @click="leftTab = 'my'"
                >
                  My Selection ({{ enrolledUnits.length }}/4)
                </button>
              </li>
            </ul>
          </div>
          <div class="card-body p-0" style="max-height: 600px; overflow-y: auto;">
            <div v-if="displayUnits.length === 0" class="text-center py-5">
              <p class="text-muted">{{ leftTab === 'my' ? 'No units selected yet' : 'No units found' }}</p>
            </div>
            <div v-else>
              <div 
                v-for="unit in displayUnits" 
                :key="unit.code"
                @click="selectUnit(unit)"
                class="list-group-item list-group-item-action border-0 border-bottom px-4 py-3 cursor-pointer"
                :class="{ 'bg-primary bg-opacity-10': selectedUnit?.code === unit.code }"
              >
                <div class="d-flex justify-content-between align-items-start mb-1">
                  <span class="fw-bold text-primary">{{ unit.code }}</span>
                  <div class="d-flex align-items-center">
                    <span v-if="isEnrolled(unit.code)" class="badge bg-success me-2">Selected</span>
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

      <!-- Right Panel: Details or Charts -->
      <div class="col-lg-7">
        <div class="card shadow-sm border-0 h-100">
          <!-- Empty State: Show Overall Distribution Chart -->
          <div v-if="!selectedUnit" class="card-body p-4 d-flex flex-column">
            <h4 class="fw-bold mb-4 text-center">Course Overview</h4>
            
            <div class="chart-container mb-4" style="height: 300px; position: relative;">
              <Pie :data="allUnitsChartData" :options="chartOptions" />
            </div>

            <div class="row g-3 mt-auto">
              <div class="col-md-4">
                <div class="card border-0 bg-primary-subtle text-center p-3">
                  <div class="h3 fw-bold mb-0 text-primary">{{ stats.core }}</div>
                  <div class="small text-primary">Core</div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card border-0 bg-success-subtle text-center p-3">
                  <div class="h3 fw-bold mb-0 text-success">{{ stats.software }}</div>
                  <div class="small text-success">Software</div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card border-0 bg-warning-subtle text-center p-3">
                  <div class="h3 fw-bold mb-0 text-warning">{{ stats.systems }}</div>
                  <div class="small text-warning">Systems</div>
                </div>
              </div>
            </div>

            <div v-if="enrolledUnits.length > 0" class="mt-5">
              <h5 class="fw-bold mb-3 text-center">My Selection Analytics</h5>
              <div class="chart-container" style="height: 250px; position: relative;">
                <Pie :data="enrolledUnitsChartData" :options="chartOptions" />
              </div>
            </div>
          </div>

          <!-- Selection State: Show Unit Details -->
          <div v-else class="h-100 d-flex flex-column">
            <div class="card-header bg-white border-0 py-3 px-4">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <span class="badge me-2" :class="getCategoryColor(selectedUnit.category)">{{ selectedUnit.category }}</span>
                  <span class="text-muted small">{{ selectedUnit.semester_offered }}</span>
                </div>
                <button @click="selectedUnit = null" class="btn btn-outline-secondary btn-sm">
                  ✕ Close
                </button>
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
                  <div class="card border-0 bg-light">
                    <div class="card-body">
                      <div class="text-muted small mb-1">Credits</div>
                      <div class="fw-bold">{{ selectedUnit.credits }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card border-0 bg-light">
                    <div class="card-body">
                      <div class="text-muted small mb-1">Instructor</div>
                      <div class="fw-bold">{{ selectedUnit.instructor }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-4">
                <h6 class="fw-bold mb-3">Enrollment</h6>
                <div class="card border-0 bg-light">
                  <div class="card-body">
                    <div class="d-flex justify-content-between mb-2">
                      <span>{{ selectedUnit.current_enrollment }} enrolled</span>
                      <span class="text-muted">Capacity: {{ selectedUnit.enrollment_capacity }}</span>
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
              </div>

              <div v-if="selectedUnit.prerequisites.length > 0" class="mb-4">
                <h6 class="fw-bold mb-2">Prerequisites</h6>
                <div class="d-flex flex-wrap gap-2">
                  <span v-for="prereq in selectedUnit.prerequisites" :key="prereq" class="badge bg-secondary">{{ prereq }}</span>
                </div>
              </div>

              <div class="mb-4">
                <h6 class="fw-bold mb-2">Tags</h6>
                <div class="d-flex flex-wrap gap-2">
                  <span v-for="tag in selectedUnit.tags" :key="tag" class="badge bg-light text-dark">{{ tag }}</span>
                </div>
              </div>
            </div>
            <div class="card-footer bg-white border-0 p-4">
              <button 
                @click="toggleEnroll(selectedUnit)" 
                class="btn w-100" 
                :class="isEnrolled(selectedUnit.code) ? 'btn-danger' : 'btn-primary'"
                style="padding: 12px;"
              >
                {{ isEnrolled(selectedUnit.code) ? 'Remove from My Selection' : 'Enroll in this Unit' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: 12px;
}
.form-control, .form-select {
  border-radius: 8px;
}
.btn {
  border-radius: 8px;
}
.cursor-pointer {
  cursor: pointer;
}
.list-group-item:hover {
  background-color: #f8f9fa;
}
.nav-tabs .nav-link {
  color: #6c757d;
  font-weight: 500;
  border-radius: 0;
}
.nav-tabs .nav-link.active {
  color: #0d6efd;
  border-bottom: 3px solid #0d6efd !important;
  background-color: transparent;
}
.chart-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}
</style>
