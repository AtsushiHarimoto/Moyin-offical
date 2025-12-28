<template>
  <div ref="container" class="three-container"></div>
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { onMounted, onUnmounted, ref } from 'vue';
import { useWindowSize } from '@vueuse/core';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import gsap from 'gsap';

const container = ref<HTMLElement | null>(null);
const { width, height } = useWindowSize();

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let composer: EffectComposer;
let frameId: number;

// Objects
let particles: THREE.Points;
let stars: THREE.Points;
let crystalCore: THREE.Mesh;
let energyRings: THREE.Group;
let mouse = new THREE.Vector2();
let targetMouse = new THREE.Vector2();
let scrollProgress = { val: 0 };

// Shaders (kept from Phases 1 & 2)
const vertexShader = `
  uniform float time;
  uniform vec2 mouse;
  uniform float phase;
  attribute vec3 color;
  attribute float size;
  attribute float speed;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec3 pos = position;
    
    // Slight noise movement
    pos.x += sin(time * speed + pos.y * 0.5) * 0.2;
    pos.y += cos(time * speed + pos.x * 0.5) * 0.2;
    pos.z += sin(time * speed + pos.z * 0.5) * 0.2;

    // Phase transition: Push particles away as phase increases
    pos *= 1.0 + phase * 3.0;

    // Mouse Influence (Repulsion)
    float dist = distance(pos.xy, mouse * 20.0);
    if (dist < 5.0) {
      vec2 dir = normalize(pos.xy - mouse * 20.0);
      pos.xy += dir * (5.0 - dist) * 0.5;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z) * (1.1 - phase);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform float time;
  uniform float phase;
  varying vec3 vColor;
  void main() {
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 3.0);
    
    vec3 finalColor = vColor * strength;
    gl_FragColor = vec4(finalColor, strength * (0.8 - phase));
  }
`;

const init = () => {
  if (!container.value) return;

  // Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.02);
  scene.background = new THREE.Color(0x020205);

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 10;

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ReinhardToneMapping;
  container.value.appendChild(renderer.domElement);

  // --- Particle Mist (Phase 1) ---
  const geometry = new THREE.BufferGeometry();
  const count = 5000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const speeds = new Float32Array(count);

  const color1 = new THREE.Color(0x00ffff);
  const color2 = new THREE.Color(0xff00ff);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

    const mixedColor = color1.clone().lerp(color2, Math.random());
    colors[i * 3] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;

    sizes[i] = Math.random() * 2.0;
    speeds[i] = Math.random() * 1.5;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      mouse: { value: new THREE.Vector2(0, 0) },
      phase: { value: 0 }
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // --- Background Starfield ---
  const starGeo = new THREE.BufferGeometry();
  const starCount = 3000;
  const starPositions = new Float32Array(starCount * 3);
  const starSizes = new Float32Array(starCount);
  
  for (let i = 0; i < starCount; i++) {
    // Distribute stars in a larger sphere
    const r = 50 + Math.random() * 50;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPositions[i * 3 + 2] = r * Math.cos(phi);
    
    starSizes[i] = Math.random() * 0.15;
  }
  
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
  
  const starMat = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      opacity: { value: 0.5 }
    },
    vertexShader: `
      attribute float size;
      uniform float time;
      varying float vOpacity;
      void main() {
        vec3 pos = position;
        // Subtle twinkling
        vOpacity = 0.5 + 0.5 * sin(time * 2.0 + position.x + position.y);
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vOpacity;
      uniform float opacity;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        gl_FragColor = vec4(1.0, 1.0, 1.0, (1.0 - d * 2.0) * vOpacity * opacity);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // --- Crystal Core (Phase 3) ---
  const coreGeo = new THREE.IcosahedronGeometry(1.5, 2);
  const coreMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0xff00ff,
    emissiveIntensity: 2,
    flatShading: true,
    transparent: true,
    opacity: 0
  });
  crystalCore = new THREE.Mesh(coreGeo, coreMat);
  scene.add(crystalCore);

  energyRings = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.TorusGeometry(2.5 + i * 0.5, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.random() * Math.PI;
    ring.rotation.y = Math.random() * Math.PI;
    energyRings.add(ring);
  }
  scene.add(energyRings);

  // Lights for Phase 3
  const pLight = new THREE.PointLight(0xff00ff, 10, 20);
  pLight.position.set(0, 0, 0);
  scene.add(pLight);

  // --- Post-Processing ---
  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.5,
    0.8
  );

  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('scroll', onScroll);
  animate();
};

const onMouseMove = (event: MouseEvent) => {
  targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
};

const onScroll = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const currentScrollProgress = window.scrollY / (maxScroll || 1);
    
    gsap.to(scrollProgress, {
        val: currentScrollProgress,
        duration: 0.8,
        ease: "power2.out"
    });
};

const animate = () => {
  frameId = requestAnimationFrame(animate);

  const time = Date.now() * 0.001;
  const phase = scrollProgress.val;

  mouse.lerp(targetMouse, 0.05);

  // Phase 1: Mist dissipation
  if (particles && particles.material instanceof THREE.ShaderMaterial) {
    particles.material.uniforms.time.value = time;
    particles.material.uniforms.mouse.value = mouse;
    particles.material.uniforms.phase.value = phase;
    particles.rotation.y = time * 0.05;
  }

  // Starfield rotation & Twinkle
  if (stars && stars.material instanceof THREE.ShaderMaterial) {
    stars.rotation.y = time * 0.005;
    stars.material.uniforms.time.value = time;
    // Fade in stars as we scroll away from the initial mist
    stars.material.uniforms.opacity.value = 0.3 + phase * 0.5;
  }


  // Phase 3: Crystal Core & Energy Rings
  if (crystalCore && energyRings) {
    const stage3Trigger = Math.max(0, (phase - 0.6) * 2.5);
    (crystalCore.material as THREE.MeshPhongMaterial).opacity = stage3Trigger;
    crystalCore.scale.setScalar(0.8 + Math.sin(time * 3) * 0.1 * stage3Trigger);
    crystalCore.rotation.y = time * 0.5;
    crystalCore.rotation.z = time * 0.3;

    energyRings.children.forEach((ring, i) => {
      if (ring instanceof THREE.Mesh) {
        ring.material.opacity = stage3Trigger * 0.6;
        ring.rotation.x += 0.01 * (i + 1);
        ring.rotation.y += 0.015 * (i + 1);
        const ringScale = 1 + Math.sin(time * 2 + i) * 0.05;
        ring.scale.setScalar(ringScale);
      }
    });
  }

  // Camera Path
  // Fly towards the core in the final stage
  camera.position.z = 10 - phase * 7.5; 
  camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
  camera.position.y += (mouse.y * 2 - camera.position.y) * 0.02;
  camera.lookAt(0, 0, 0);

  composer.render();
};


const onResize = () => {
  if (!camera || !renderer || !composer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
};

onMounted(() => {
  init();
  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  cancelAnimationFrame(frameId);
  window.removeEventListener('resize', onResize);
  window.removeEventListener('mousemove', onMouseMove);
  renderer?.dispose();
  composer?.dispose();
});
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  overflow: hidden;
  background-color: #000;
}
</style>
