<script setup>
const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['page-change'])

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('page-change', page)
  }
}

const getVisiblePages = () => {
  const pages = []
  const delta = 2
  
  if (props.totalPages <= 5) {
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i)
    }
  } else {
    if (props.currentPage <= 3) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
    } else if (props.currentPage >= props.totalPages - 2) {
      for (let i = props.totalPages - 4; i <= props.totalPages; i++) {
        pages.push(i)
      }
    } else {
      for (let i = props.currentPage - delta; i <= props.currentPage + delta; i++) {
        pages.push(i)
      }
    }
  }
  return pages
}
</script>

<template>
  <nav>
    <ul class="pagination justify-content-center">
      <li class="page-item" :class="{ disabled: currentPage === 1 }">
        <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">Previous</button>
      </li>
      <li v-for="page in getVisiblePages()" :key="page" class="page-item" :class="{ active: page === currentPage }">
        <button class="page-link" @click="goToPage(page)">{{ page }}</button>
      </li>
      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
        <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">Next</button>
      </li>
    </ul>
  </nav>
</template>
