<script setup>
import { ref, provide, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Toast from './components/Toast.vue'
import { useUser } from './views/User/composables/useUser.js'

const { loadUser } = useUser()
loadUser()

const toastRef = ref(null)
const showBackendNotice = ref(false)

const notify = (message, type = 'bg-primary', durationMs) => {
  if (toastRef.value) {
    toastRef.value.showToast(message, type, durationMs)
  }
}

const closeBackendNotice = () => {
  showBackendNotice.value = false
}

provide('notify', notify)

onMounted(() => {
  const key = 'smartcanvas_backend_sleep_notice_v1'
  const shown = sessionStorage.getItem(key)
  if (!shown) {
    showBackendNotice.value = true
    sessionStorage.setItem(key, '1')
  }
})
</script>

<template>
  <div class="app-wrapper">
    <Navbar />

    <div v-if="showBackendNotice" class="backend-notice-backdrop" @click="closeBackendNotice">
      <div class="backend-notice-modal" @click.stop>
        <div class="d-flex justify-content-between align-items-start mb-2">
          <h5 class="mb-0 fw-bold">Please notice:</h5>
          <button type="button" class="btn-close" aria-label="Close" @click="closeBackendNotice"></button>
        </div>
        <p class="mb-3 text-secondary">
          The backend is hosted in the cloud and may enter sleep mode if there is no activity for an extended period. 
          Please allow approximately 30 seconds for the system to resume; we apologise for any inconvenience caused.
        </p>
        <div class="d-flex gap-2 justify-content-end">
          <button class="btn btn-primary" @click="closeBackendNotice">Understand</button>
        </div>
      </div>
    </div>

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

.backend-notice-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
}

.backend-notice-modal {
  width: 100%;
  max-width: 560px;
  background: #fff;
  border-radius: 14px;
  border: 2px solid #212529;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.35);
  padding: 18px 18px 16px;
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
