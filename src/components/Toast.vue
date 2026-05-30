<script setup>
import { ref, defineExpose, onBeforeUnmount } from 'vue';

const show = ref(false);
const message = ref('');
const type = ref('bg-primary');
const timerId = ref(null);

const showToast = (msg, styleClass = 'bg-primary', durationMs = 3000) => {
  message.value = msg;
  type.value = styleClass;
  show.value = true;

  if (timerId.value) {
    clearTimeout(timerId.value);
    timerId.value = null;
  }

  if (durationMs > 0) {
    timerId.value = setTimeout(() => {
      show.value = false;
      timerId.value = null;
    }, durationMs);
  }
};

onBeforeUnmount(() => {
  if (timerId.value) {
    clearTimeout(timerId.value);
  }
});

defineExpose({ showToast });
</script>

<template>
  <div v-if="show" class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1055">
    <div class="toast show align-items-center border-0 shadow-lg" :class="type">
      <div class="d-flex">
        <div class="toast-body fw-semibold">
          {{ message }}
        </div>
        <button type="button" class="btn-close me-2 m-auto" aria-label="Close" @click="show = false"></button>
      </div>
    </div>
  </div>
</template>