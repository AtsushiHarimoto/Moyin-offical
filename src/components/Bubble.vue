<template>
  <div class="sakura-container">
    <div v-for="n in 30" :key="n" class="petal" :style="petalStyle()"></div>
  </div>
</template>

<script setup lang="ts">
const petalStyle = () => {
  const left = Math.random() * 100 + '%';
  const delay = Math.random() * 10 + 's';
  const duration = (Math.random() * 5 + 5) + 's';
  const size = (Math.random() * 10 + 10) + 'px';
  return {
    left,
    animationDelay: delay,
    animationDuration: duration,
    width: size,
    height: size,
    opacity: Math.random() * 0.5 + 0.3
  };
};
</script>

<style scoped>
.sakura-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.petal {
  position: absolute;
  top: -10%;
  background: #ffb7c5;
  border-radius: 150% 0 150% 0;
  transform-origin: center;
  animation: fall ease-in-out infinite;
}

@keyframes fall {
  0% {
    transform: translateY(0) rotate(0deg) translateX(0);
    opacity: 0;
    animation-timing-function: cubic-bezier(0.5, 0, 0.75, 0); /* Start fast */
  }
  10% {
    opacity: 0.8;
  }
  30% {
    transform: translateY(30vh) rotate(120deg) translateX(30px);
    animation-timing-function: cubic-bezier(0, 0.5, 0.5, 1); /* Slow down */
  }
  100% {
    transform: translateY(110vh) rotate(360deg) translateX(-10px);
    opacity: 0;
  }
}
</style>
