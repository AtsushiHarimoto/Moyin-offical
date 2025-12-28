<template>
  <button :class="['ui-button', variant]" @click="$emit('click')">
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'ghost' | 'secondary';
}
withDefaults(defineProps<Props>(), {
  variant: 'primary'
});
defineEmits(['click']);
</script>

<style scoped>
.ui-button {
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-family: 'Orbitron', sans-serif;
  font-weight: bold;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  outline: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.primary {
  background: linear-gradient(45deg, #ff0055, #ff00ff);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 0, 85, 0.3);
}

.primary:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 0, 85, 0.4);
}

.ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(5px);
}

.ghost:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: white;
}

.secondary {
  background: transparent;
  border: 1px solid rgba(0, 255, 255, 0.4);
  color: #00ffff;
}
</style>
