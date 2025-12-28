<template>
  <div 
    ref="entrance"
    class="creator-entrance"
    :style="entranceStyle"
  >
    <a :href="props.lang === 'zh-tw' ? '/about' : `/${props.lang}/about`" class="entrance-link">
      <span class="text">{{ t('creator.label') }}</span>
      <div class="glow"></div>
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import gsap from 'gsap';
import { useTranslations } from '../i18n/utils';

interface Props {
  lang: 'en' | 'zh-tw' | 'zh-cn' | 'ja';
}

const props = defineProps<Props>();
const t = useTranslations(props.lang);

const entrance = ref<HTMLElement | null>(null);
const mousePos = ref({ x: 0, y: 0 });
const displacement = ref({ x: 0, y: 0 });

const entranceStyle = computed(() => ({
  transform: `translate(${displacement.value.x}px, ${displacement.value.y}px)`
}));

const handleGlobalMouseMove = (e: MouseEvent) => {
  if (!entrance.value) return;

  const rect = entrance.value.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const dx = e.clientX - centerX;
  const dy = e.clientY - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const range = 300;
  const strength = 30;

  if (distance < range) {
    const factor = Math.pow(1 - distance / range, 2);
    gsap.to(displacement.value, {
      x: (dx / distance) * factor * strength,
      y: (dy / distance) * factor * strength,
      duration: 0.6,
      ease: "power2.out"
    });
  } else {
    gsap.to(displacement.value, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    });
  }
};

onMounted(() => {
  window.addEventListener('mousemove', handleGlobalMouseMove);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleGlobalMouseMove);
});
</script>

<style scoped>
@import url('https://fastly.jsdelivr.net/gh/justfont/open-huninn-font@1.0/font/jf-openhuninn.css');

.creator-entrance {
  position: fixed;
  bottom: 2.5rem;
  right: 2.5rem;
  z-index: 1000;
  pointer-events: auto;
}

.entrance-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.8rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  text-decoration: none;
  color: white;
  font-family: 'jf-openhuninn', 'Zen Kaku Gothic New', sans-serif;
  font-weight: bold;
  font-size: 1rem;
  letter-spacing: 0.05rem;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.entrance-link::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: 50px;
  background: linear-gradient(45deg, #ff0055, #ff00ff);
  -webkit-mask: 
     linear-gradient(#fff 0 0) content-box, 
     linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  pointer-events: none;
}

.text {
  position: relative;
  z-index: 1;
  background: linear-gradient(45deg, #fff, #ffccff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.entrance-link:hover {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 12px 40px rgba(255, 0, 255, 0.2);
  transform: scale(1.05);
}

.glow {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 0, 255, 0.4) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
}

.entrance-link:hover .glow {
  opacity: 1;
}

@media (max-width: 768px) {
  .creator-entrance {
    bottom: 1.5rem;
    right: 1.5rem;
  }
  .entrance-link {
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
  }
}
</style>
