<template>
  <div class="card" :style="{ backgroundColor: bgColor }">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  bgColor?: string;
}
withDefaults(defineProps<Props>(), {
  bgColor: 'rgba(20, 20, 30, 0.4)'
});
</script>

<style scoped>
.card {
  backdrop-filter: blur(15px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  box-sizing: border-box;
}
</style>
