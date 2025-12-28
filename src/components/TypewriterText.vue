<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  speed: {
    type: Number,
    default: 150
  }
});

const displayText = ref('');
const isTyping = ref(false);

const type = async () => {
  if (isTyping.value) return;
  isTyping.value = true;
  displayText.value = '';
  const textToType = props.text || '';
  for (let i = 0; i < textToType.length; i++) {
    displayText.value += textToType.charAt(i);
    await new Promise(resolve => setTimeout(resolve, props.speed));
  }
  isTyping.value = false;
};

onMounted(() => {
  type();
});

watch(() => props.text, () => {
  type();
});
</script>

<template>
  <span class="typewriter">{{ displayText }}<span class="cursor" v-if="isTyping">|</span></span>
</template>

<style scoped>
.typewriter {
  display: inline-block;
  min-height: 1.2em;
}
.cursor {
  animation: blink 1s infinite;
  margin-left: 2px;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
