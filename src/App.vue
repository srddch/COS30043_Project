<script setup>
import { ref, provide, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Toast from './components/Toast.vue'

const toastRef = ref(null)

const notify = (message, type = 'bg-primary') => {
  if (toastRef.value) {
    toastRef.value.showToast(message, type)
  }
}

provide('notify', notify)
</script>

<template>
  <div class="app-wrapper">
    <Navbar />

    <main class="container py-4 flex-grow-1">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="footer mt-auto py-3 bg-light border-top">
      <div class="container text-center">
        <span class="text-muted small">
          © 2026 SmartCanvas LMS | Group 4 Project
        </span>
      </div>
    </footer>

    <Toast ref="toastRef" />
  </div>
</template>

<style>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

.navbar-brand {
  letter-spacing: 0.5px;
}

@media (max-width: 575.98px) {
  .container {
    padding-left: 15px;
    padding-right: 15px;
  }
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>