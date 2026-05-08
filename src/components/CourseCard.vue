<script setup>
import { inject } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  course: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const notify = inject('notify')

const viewCourse = () => {
  router.push({ name: 'CourseDetail', params: { id: props.course.id } })
}

const likeCourse = (e) => {
  e.stopPropagation()
  props.course.likes++
  notify('Liked!', 'bg-success')
}
</script>

<template>
  <div class="card shadow-sm border-0 h-100 course-card">
    <div class="card-img-top bg-gradient" :style="{ background: course.color }" style="height: 160px; display: flex; align-items: center; justify-content: center;">
      <span class="display-4 text-white">{{ course.icon }}</span>
    </div>
    <div class="card-body d-flex flex-column">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <span class="badge bg-primary-subtle text-primary">{{ course.category }}</span>
        <div class="d-flex align-items-center text-muted small">
          <i class="bi bi-heart me-1" style="cursor: pointer;" @click="likeCourse"></i>
          <span>{{ course.likes }}</span>
        </div>
      </div>
      <h5 class="card-title fw-bold mb-2">{{ course.title }}</h5>
      <p class="card-text text-secondary small mb-3 flex-grow-1">{{ course.description }}</p>
      <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <img :src="course.instructor.avatar" :alt="course.instructor.name" class="rounded-circle me-2" style="width: 32px; height: 32px;">
          <span class="small text-muted">{{ course.instructor.name }}</span>
        </div>
        <div class="text-right">
          <div class="fw-bold text-primary">${{ course.price }}</div>
          <div class="text-muted small">{{ course.duration }}</div>
        </div>
      </div>
      <button @click="viewCourse" class="btn btn-outline-primary w-100 mt-3">View Details</button>
    </div>
  </div>
</template>

<style scoped>
.course-card {
  transition: transform 0.2s, box-shadow 0.2s;
}
.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}
</style>
