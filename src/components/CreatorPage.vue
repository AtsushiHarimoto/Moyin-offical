<template>
  <div class="creator-page">
    <SakuraScene class="bg-layer" />
    
    <div class="back-btn-container">
      <UiButton variant="ghost" @click="goHome">
        {{ t('creator.back') }}
      </UiButton>
    </div>

    <div 
      class="layout animate-in" 
      :class="{ 'contemplation-theme': isContemplating }"
    >
      <!-- Global Backdrop Blur Overlay -->
      <div class="blur-overlay"></div>

      <!-- Left Sidebar: Fixed -->
      <aside class="sidebar" @mousemove="handleMapMouseMove">
        <div class="profile-section">
          <div class="avatar-container">
            <div class="avatar-placeholder">
              <div class="earth-continents"></div>
              <div class="earth-glow"></div>
            </div>
            <!-- Star Map Layer around avatar -->
            <div class="star-map">
              <div 
                v-for="(tech, index) in techStack" 
                :key="index"
                class="star-node"
                :style="getStarStyle(index)"
              >
              </div>
            </div>
          </div>
          <h1 class="creator-name">{{ t('creator.name') }}</h1>
          <p class="tagline">{{ t('creator.tagline') }}</p>
        </div>
      </aside>

      <!-- Right Content: Scrollable -->
      <main class="content">
        <div class="content-inner">
          
          <!-- YouthMemory Section -->
          <section class="section">
            <h2 class="section-title">{{ t('creator.memory.title') }}</h2>
            <Card class="memory-card" bg-color="rgba(45, 27, 36, 0.7)">
              <div class="memory-content" @click="nextFrame">
                <div class="frame-narrative">
                  <TypewriterText 
                    v-if="currentFrameData && currentFrameData.text"
                    :key="currentFrameIndex + activeLang"
                    :text="currentFrameData.text"
                    :speed="80"
                    class="glitch-text"
                  />
                  <div v-if="currentFrameData && currentFrameData.html" v-html="currentFrameData.html" class="html-narrative"></div>
                </div>
                
                <div class="click-hint">
                  {{ currentFrameIndex < frames.length - 1 ? t('creator.memory.hint') : t('creator.memory.end') }}
                </div>

                <!-- Particle Layer for 555/552 -->
                <div v-if="showScoreParticles" class="score-overlay animate-pulse">
                  <div class="score-particle">555</div>
                  <div class="score-particle">552</div>
                </div>
              </div>
            </Card>
          </section>

          <!-- About Section -->
          <section class="section">
            <h2 class="section-title">{{ t('creator.about.title') }}</h2>
            <Card class="dissolving-card" bg-color="rgba(255, 255, 255, 0.9)">
              <div class="text-dark narrative kintsugi-text">
                <p>{{ t('creator.about.desc') }}</p>
              </div>
            </Card>
          </section>

          <!-- Staggered Layout for Origin and Philosophy -->
          <div class="masonry-layout">
            <!-- Origin Section -->
            <section class="section masonry-item origin">
              <h2 class="section-title">{{ t('creator.origin.title') }}</h2>
              <Card class="dissolving-card" bg-color="rgba(255, 255, 255, 0.9)">
                <div class="text-dark narrative kintsugi-text">
                  <p>{{ t('creator.origin.desc') }}</p>
                </div>
              </Card>
            </section>

            <section class="section masonry-item reflection">
              <Card class="dissolving-card" bg-color="rgba(20, 20, 30, 0.4)">
                <div class="narrative kintsugi-text soul-quote">
                  <p>{{ t('creator.reflection') }}</p>
                </div>
              </Card>
            </section>
          </div>

          <!-- Growth Philosophy Section -->
          <section ref="philosophySection" class="section">
            <h2 class="section-title">{{ t('creator.philosophy.title') }}</h2>
            <Card class="dissolving-card" bg-color="rgba(20, 20, 30, 0.8)">
              <div class="philosophy-container">
                <div class="philosophy-tabs">
                  <button 
                    v-for="(phase, index) in growthPhases" 
                    :key="index"
                    :class="{ active: activePhase === index }"
                    @click="activePhase = index"
                  >
                    {{ phase.title }}
                  </button>
                </div>
                
                <div class="philosophy-content">
                  <div class="narrative">
                    <p>{{ growthPhases[activePhase].desc }}</p>
                  </div>
                  
                  <div class="wide-quote">
                    <TypewriterText 
                      :key="activePhase + activeLang"
                      :text="growthPhases[activePhase].quote" 
                      :speed="100"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </section>

          <div class="bottom-actions">
            <UiButton variant="primary" @click="goHome" class="reconstruct-btn">
              {{ t('creator.reconstruct.btn') }}
            </UiButton>
            <UiButton variant="ghost" @click="goHome">
              {{ t('creator.home.btn') }}
            </UiButton>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import gsap from 'gsap';
import SakuraScene from './SakuraScene.vue';
import UiButton from './UiButton.vue';
import Card from './Card.vue';
import TypewriterText from './TypewriterText.vue';
import { ui, defaultLang } from '../i18n/ui';

const props = defineProps<{
  lang?: string;
}>();

const activeLang = computed(() => {
  return (props.lang && props.lang in ui) ? props.lang as keyof typeof ui : defaultLang;
});

const t = (key: string) => {
  return ui[activeLang.value][key as keyof typeof ui[typeof defaultLang]] || ui[defaultLang][key as keyof typeof ui[typeof defaultLang]];
};

const goHome = () => {
  const homePath = activeLang.value === 'zh-tw' ? '/' : `/${activeLang.value}/`;
  window.location.href = homePath;
};

const techStack = computed(() => [
  t('creator.tech.f1'),
  t('creator.tech.f2'),
  t('creator.tech.f3'),
  t('creator.tech.f4'),
  t('creator.tech.f5'),
  t('creator.tech.f6')
]);

const starDisplacements = ref(techStack.value.map(() => ({ x: 0, y: 0 })));

const getStarStyle = (index: number) => {
  const angle = (index / techStack.value.length) * Math.PI * 2;
  const radius = 180;
  const tx = Math.cos(angle) * radius + (starDisplacements.value[index]?.x || 0);
  const ty = Math.sin(angle) * radius + (starDisplacements.value[index]?.y || 0);
  return {
    transform: `translate(${tx}px, ${ty}px)`
  };
};

const handleMapMouseMove = (e: MouseEvent) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  techStack.value.forEach((_, i) => {
    // Stars gravitate towards center (the avatar) loosely, and react to mouse
    const dx = mx - centerX;
    const dy = my - centerY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    const factor = Math.max(0, 1 - dist / 500);
    gsap.to(starDisplacements.value[i], {
      x: dx * factor * 0.1,
      y: dy * factor * 0.1,
      duration: 1,
      ease: "power2.out"
    });
  });
};

const philosophySection = ref<HTMLElement | null>(null);
const isContemplating = ref(false);

useIntersectionObserver(
  philosophySection,
  ([{ isIntersecting }]) => {
    isContemplating.value = isIntersecting;
  },
  { threshold: 0.3 }
);

const activePhase = ref(0);
const growthPhases = computed(() => [
  {
    title: t('creator.philosophy.f1.title'),
    desc: t('creator.philosophy.f1.desc'),
    quote: t('creator.philosophy.f1.quote')
  },
  {
    title: t('creator.philosophy.f2.title'),
    desc: t('creator.philosophy.f2.desc'),
    quote: t('creator.philosophy.f2.quote')
  },
  {
    title: t('creator.philosophy.f3.title'),
    desc: t('creator.philosophy.f3.desc'),
    quote: t('creator.philosophy.f3.quote')
  }
]);

// YouthMemory Logic
const currentFrameIndex = ref(0);
const showScoreParticles = ref(false);

const frames = computed(() => [
  { text: t('creator.memory.f1') },
  { text: t('creator.memory.f2') },
  { 
    html: t('creator.memory.f3')
  },
  { text: t('creator.memory.f4') },
  { 
    html: t('creator.memory.f5')
  },
  { 
    html: t('creator.memory.f6')
  },
  { text: t('creator.memory.f7') },
  { 
    html: t('creator.memory.f8')
  },
  { 
    html: t('creator.memory.f9')
  },
  { 
    html: t('creator.memory.f10')
  },
  { 
    html: t('creator.memory.f11')
  },
  { 
    text: t('creator.memory.f12'),
    action: () => { showScoreParticles.value = true; }
  },
  { 
    html: t('creator.memory.f13')
  }
]);

const currentFrameData = computed(() => frames.value[currentFrameIndex.value]);

const nextFrame = () => {
  if (currentFrameIndex.value < frames.value.length - 1) {
    currentFrameIndex.value++;
    if (currentFrameData.value.action) {
      currentFrameData.value.action();
    }
  }
};

// Reset indices when lang changes to ensure reactivity works
watch(() => props.lang, () => {
  // Optional: reset memory or just let computed properties update
});
</script>

<style scoped>
@import url('https://fastly.jsdelivr.net/gh/justfont/open-huninn-font@1.0/font/jf-openhuninn.css');

/* ... (keep existing styles) */

.memory-card {
  min-height: 250px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(244, 114, 182, 0.2);
}

.memory-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
}

.frame-narrative {
  font-family: 'jf-openhuninn', sans-serif;
  font-size: 1.25rem;
  line-height: 1.8;
  color: #fce7f3;
  margin-bottom: 2rem;
}

.glitch-text {
  animation: glitch-subtle 3s infinite;
}

@keyframes glitch-subtle {
  0% { transform: translate(0); }
  1% { transform: translate(-1px, 1px) skewX(2deg); }
  2% { transform: translate(1px, -1px) skewX(-2deg); }
  3% { transform: translate(0); }
}

.click-hint {
  font-size: 0.8rem;
  opacity: 0.4;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.score-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  pointer-events: none;
  z-index: 10;
}

.score-particle {
  font-family: 'Orbitron', sans-serif;
  font-size: 5rem;
  font-weight: bold;
  opacity: 0.15;
  color: #f472b6;
  text-shadow: 0 0 20px #f472b6;
}

/* Base CreatorPage styles */
.creator-page {
  width: 100vw;
  height: 100vh;
  background-color: #0f0a12; /* Unified dark base */
  color: white;
  position: relative;
  overflow: hidden;
}

.bg-layer {
  opacity: 0.6; /* Increased visibility for consistency */
  z-index: 0;
}

.back-btn-container {
  position: fixed;
  top: 2rem;
  left: 2rem;
  z-index: 100;
}

.layout {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
  background: transparent; /* No more background shifts */
}

.animate-in {
  animation: slide-up-fade-in 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes slide-up-fade-in {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

.sidebar {
  width: 35%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(15, 10, 18, 0.3); /* Subtle dark overlay for readability */
  backdrop-filter: blur(10px);
}

.avatar-container {
  position: relative;
  width: 400px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder {
  width: 140px;
  height: 140px;
  background: #051025;
  border-radius: 50%;
  z-index: 5;
  position: relative;
  overflow: hidden;
  box-shadow: 
    inset -10px -10px 30px rgba(0, 0, 0, 0.8),
    inset 10px 10px 30px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(0, 204, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.earth-continents {
  position: absolute;
  inset: 0;
  background-image: url('https://unpkg.com/three-globe/example/img/earth-night.jpg');
  background-size: cover;
  background-repeat: repeat-x;
  opacity: 0.6;
  animation: rotate-earth 40s linear infinite;
}

@keyframes rotate-earth {
  from { background-position: 0 0; }
  to { background-position: 280px 0; }
}

.earth-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: inset 0 0 20px rgba(0, 204, 255, 0.4);
  pointer-events: none;
}

.star-map {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.star-node {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px; /* Smaller more elegant stars */
  height: 4px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 10px #fff;
  opacity: 0.8;
}

.creator-name {
  font-family: 'Orbitron', sans-serif;
  font-size: 2.2rem;
  margin-top: 2rem;
  letter-spacing: 4px;
}

.tagline {
  font-family: 'jf-openhuninn', sans-serif;
  opacity: 0.5;
  font-size: 0.9rem;
}

.content {
  width: 65%;
  height: 100%;
  overflow-y: auto;
  padding: 6rem 4rem;
  box-sizing: border-box;
}

.content-inner {
  max-width: 900px;
  margin: 0 auto;
}

.masonry-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.masonry-item.reflection {
  align-self: flex-end;
  margin-top: 40px;
}

.dissolving-card {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  transition: all 0.5s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dissolving-card:hover {
  border-color: rgba(244, 114, 182, 0.3);
  box-shadow: 0 15px 50px rgba(244, 114, 182, 0.1);
}

.section-title {
  font-family: 'jf-openhuninn', sans-serif;
  color: #fff;
  background: rgba(244, 114, 182, 0.3);
  padding: 0.4rem 1.2rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  font-size: 1.2rem;
  display: inline-block;
}

.narrative {
  font-family: 'jf-openhuninn', sans-serif;
  line-height: 2;
  font-size: 1.05rem;
  letter-spacing: 0.05em;
}

.kintsugi-text {
  position: relative;
  overflow: hidden;
}

.kintsugi-text p:hover {
  text-shadow: 0 0 8px rgba(244, 114, 182, 0.6);
  color: white;
}

.soul-quote {
  font-style: italic;
  padding: 2rem;
  text-align: center;
  color: #f472b6 !important;
}

.philosophy-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.philosophy-tabs {
  display: flex;
  gap: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.philosophy-tabs button {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  font-family: 'jf-openhuninn', sans-serif;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 1rem 0;
  transition: all 0.4s;
  position: relative;
}

.philosophy-tabs button.active {
  color: #f472b6;
}

.philosophy-tabs button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #f472b6;
  box-shadow: 0 0 10px #f472b6;
}

.wide-quote {
  width: 85%;
  margin: 3rem auto 0;
  padding: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
  font-size: 1.3rem;
  letter-spacing: 0.12em;
  color: #f472b6;
}

.text-dark { color: #1f2937; }

.bottom-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 4rem 0 6rem;
}

.reconstruct-btn {
  font-size: 1.2rem;
  padding: 1.2rem 3rem !important;
  border-radius: 50px !important;
}

.content::-webkit-scrollbar { width: 4px; }
.content::-webkit-scrollbar-track { background: transparent; }
.content::-webkit-scrollbar-thumb {
  background: rgba(244, 114, 182, 0.2);
  border-radius: 10px;
}

@media (max-width: 1024px) {
  .layout { flex-direction: column; }
  .sidebar { width: 100%; height: auto; padding: 4rem 2rem; border-right: none; }
  .content { width: 100%; padding: 2rem; }
  .masonry-layout { grid-template-columns: 1fr; }
}
</style>

