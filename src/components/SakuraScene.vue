<template>
  <div ref="container" class="sakura-scene"></div>
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { onMounted, onUnmounted, ref } from 'vue';
import { useWindowSize } from '@vueuse/core';
import gsap from 'gsap';

const container = ref<HTMLElement | null>(null);
const { width, height } = useWindowSize();

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let frameId: number;
let particles: THREE.Points;
let mouse = new THREE.Vector2();

const init = () => {
  if (!container.value) return;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.value.appendChild(renderer.domElement);

  // Sakura Texture creation via Canvas
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffb7c5';
    ctx.beginPath();
    ctx.moveTo(32, 10);
    ctx.bezierCurveTo(32, 10, 50, 0, 50, 25);
    ctx.bezierCurveTo(50, 45, 32, 60, 32, 60);
    ctx.bezierCurveTo(32, 60, 14, 45, 14, 25);
    ctx.bezierCurveTo(14, 0, 32, 10, 32, 10);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);

  const geometry = new THREE.BufferGeometry();
  const count = 1500;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const rotations = new Float32Array(count);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

    colors[i * 3] = 1.0;     // R
    colors[i * 3 + 1] = 0.72; // G (pinker)
    colors[i * 3 + 2] = 0.82; // B

    sizes[i] = Math.random() * 0.2 + 0.1;
    rotations[i] = Math.random() * Math.PI * 2;
    speeds[i] = Math.random() * 0.02 + 0.01;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 0.15,
    map: texture,
    transparent: true,
    alphaTest: 0.1,
    vertexColors: true,
    blending: THREE.NormalBlending,
    depthWrite: false
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  window.addEventListener('mousemove', onMouseMove);
  animate();
};

const onMouseMove = (event: MouseEvent) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
};

const animate = () => {
  frameId = requestAnimationFrame(animate);
  const time = Date.now() * 0.001;

  if (particles) {
    const positionAttribute = particles.geometry.getAttribute('position');
    for (let i = 0; i < positionAttribute.count; i++) {
      let x = positionAttribute.getX(i);
      let y = positionAttribute.getY(i);
      let z = positionAttribute.getZ(i);

      // Falling movement
      y -= 0.01 + Math.sin(time + x) * 0.005;
      x += Math.cos(time + y) * 0.002;

      // Reset when below screen
      if (y < -10) y = 10;
      if (x < -10) x = 10;
      if (x > 10) x = -10;

      // Mouse repulsion
      const dx = x - mouse.x * 5;
      const dy = y - mouse.y * 5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 2) {
        x += dx * 0.01;
        y += dy * 0.01;
      }

      positionAttribute.setXYZ(i, x, y, z);
    }
    positionAttribute.needsUpdate = true;
    particles.rotation.y += 0.001;
  }

  renderer.render(scene, camera);
};

const onResize = () => {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
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
});
</script>

<style scoped>
.sakura-scene {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  pointer-events: none;
}
</style>
