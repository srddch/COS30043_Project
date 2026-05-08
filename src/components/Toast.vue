<script setup>
import { ref, defineExpose } from 'vue';

const show = ref(false);
const message = ref('');
const type = ref('bg-primary');

const showToast = (msg, styleClass = 'bg-primary') => {
  message.value = msg;
  type.value = styleClass;
  show.value = true;
  setTimeout(() => (show.value = false), 3000);
};

defineExpose({ showToast });
</script>

<template>
  <div v-if="show" class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1055">
    <div class="toast show align-items-center text-white border-0" :class="type">
      <div class="d-flex">
        <div class="toast-body">
          {{ message }}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="show.value = false"></button>
      </div>
    </div>
  </div>
</template>