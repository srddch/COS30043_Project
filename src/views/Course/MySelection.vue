<script setup>
import { computed, inject } from 'vue'
import { selectionStore } from '../../store/selection'

// Chart.js imports
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

const notify = inject('notify')

const enrolledUnits = computed(() => selectionStore.enrolledUnits)
const isLoading = computed(() => selectionStore.loading)

// Chart Data for Selected Units
const chartData = computed(() => {
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

const handleRemove = async (unit) => {
  const result = await selectionStore.toggleEnroll(unit)
  if (result.success) {
    notify('Removed! Unit removed from your selection.', 'bg-info')
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
</script>

<template>
  <div class="my-selection-page">
    <div class="row mb-4">
      <div class="col-12">
        <h1 class="display-5 fw-bold">My Selection</h1>
        <p class="text-secondary">Manage your enrolled units and view analytics</p>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Syncing with backend...</p>
    </div>

    <div v-else-if="enrolledUnits.length === 0" class="text-center py-5">
      <div class="display-1 mb-3">📋</div>
      <h3 class="fw-bold">No units selected yet</h3>
      <p class="text-muted mb-4">Go to the course catalogue to select units you're interested in.</p>
      <router-link to="/courses" class="btn btn-primary px-4 py-2">Browse Courses</router-link>
    </div>

    <div v-else class="row g-4">
      <!-- Selected Units List -->
      <div class="col-lg-7">
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-header bg-white border-0 py-3 px-4">
            <h5 class="mb-0 fw-bold">Enrolled Units ({{ enrolledUnits.length }}/4)</h5>
          </div>
          <div class="card-body p-0">
            <div v-for="unit in enrolledUnits" :key="unit.code" class="p-4 border-bottom">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h5 class="fw-bold text-primary mb-1">{{ unit.code }}</h5>
                  <h6 class="fw-bold mb-2">{{ unit.course_title }}</h6>
                </div>
                <button @click="handleRemove(unit)" class="btn btn-outline-danger btn-sm">Remove</button>
              </div>
              <div class="d-flex gap-2 mb-3">
                <span class="badge" :class="getCategoryColor(unit.category)">{{ unit.category }}</span>
                <span class="badge bg-light text-dark border">{{ unit.semester_offered }}</span>
                <span class="badge bg-light text-dark border">{{ unit.credits }} Credits</span>
              </div>
              <p class="text-secondary small mb-0">{{ unit.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Analytics Column -->
      <div class="col-lg-5">
        <div class="card shadow-sm border-0 sticky-top" style="top: 20px;">
          <div class="card-header bg-white border-0 py-3 px-4 text-center">
            <h5 class="mb-0 fw-bold">Selection Analytics</h5>
          </div>
          <div class="card-body p-4">
            <div class="chart-container" style="height: 300px; position: relative;">
              <Pie :data="chartData" :options="chartOptions" />
            </div>
            
            <div class="mt-4">
              <h6 class="fw-bold mb-3 small text-uppercase text-muted">Category Breakdown</h6>
              <div class="d-flex flex-column gap-2">
                <div v-for="(count, index) in chartData.datasets[0].data" :key="index" class="d-flex justify-content-between align-items-center p-2 rounded bg-light">
                  <span class="small">{{ chartData.labels[index] }}</span>
                  <span class="badge rounded-pill" :style="{ backgroundColor: chartData.datasets[0].backgroundColor[index] }">{{ count }}</span>
                </div>
              </div>
            </div>

            <div class="alert alert-info mt-4 mb-0 small border-0">
              <i class="bi bi-info-circle me-2"></i>
              You have used <strong>{{ enrolledUnits.length }}</strong> of your 4 allowed slots for this semester.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card { border-radius: 12px; }
.btn { border-radius: 8px; }
.chart-container { width: 100%; max-width: 300px; margin: 0 auto; }
</style>
