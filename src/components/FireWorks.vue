<template></template>

<script setup lang="ts">
import { onMounted } from "vue";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/Addons.js";

let scene, camera, renderer;
let rockets: Array<any> = [];
let fireworks: Array<any> = [];

function createRocket(font, text, color1, color2, xOffset) {
  const textGeometry = new TextGeometry(text, {
    font: font,
    size: 5,
    height: 2,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.5,
    bevelSize: 0.3,
    bevelSegments: 5,
  });

  const material = new THREE.ShaderMaterial({
    vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
    fragmentShader: `
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec2 vUv;
            void main() {
                vec3 color = mix(color1, color2, vUv.y);
                gl_FragColor = vec4(color, 1.0);
            }
        `,
    uniforms: {
      color1: { value: new THREE.Color(color1) },
      color2: { value: new THREE.Color(color2) },
    },
    side: THREE.FrontSide,
    transparent: true,
  });

  const rocket = new THREE.Mesh(textGeometry, material);
  rocket.position.set(xOffset, -20, 0);
  scene.add(rocket);

  rockets.push({
    mesh: rocket,
    velocityY: 0.3 + Math.random() * 0.2,
    targetHeight: 15 + Math.random() * 15,
    exploded: false,
    delay: Math.random() * 2,
  });
}

function createFirework(x, y) {
  const particleCount = 200;
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(Math.random() * 2 - 1);
    const distance = Math.random() * 20;

    positions[i * 3] = distance * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = distance * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = distance * Math.cos(phi);

    velocities[i * 3] = positions[i * 3] * 0.1;
    velocities[i * 3 + 1] = positions[i * 3 + 1] * 0.1;
    velocities[i * 3 + 2] = positions[i * 3 + 2] * 0.1;

    colors[i * 3] = Math.random();
    colors[i * 3 + 1] = Math.random();
    colors[i * 3 + 2] = Math.random();
  }

  particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  particles.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));
  particles.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 1.0,
    vertexColors: true,
    transparent: true,
    opacity: 1,
  });

  const particleSystem = new THREE.Points(particles, material);
  particleSystem.position.set(x, y, Math.random() * 10 - 5);
  scene.add(particleSystem);

  fireworks.push(particleSystem);
}

function animate() {
  requestAnimationFrame(animate);

  rockets.forEach((rocket, index) => {
    if (!rocket.exploded) {
      if (performance.now() / 1000 > rocket.delay) {
        rocket.mesh.position.y += rocket.velocityY;
        rocket.mesh.rotation.y += 0.01;
        rocket.mesh.scale.set(1.05, 1.05, 1.05);

        if (rocket.mesh.position.y >= rocket.targetHeight) {
          createFirework(rocket.mesh.position.x, rocket.mesh.position.y);
          scene.remove(rocket.mesh);
          rocket.exploded = true;
        }
      }
    }
  });

  fireworks.forEach((firework) => {
    const positions = firework.geometry.attributes.position.array;
    const velocities = firework.geometry.attributes.velocity.array;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2];

      velocities[i + 1] -= 0.005;
      velocities[i] *= 0.98;
      velocities[i + 1] *= 0.98;
      velocities[i + 2] *= 0.98;
    }

    firework.geometry.attributes.position.needsUpdate = true;
    firework.material.opacity -= 0.01;
    if (firework.material.opacity <= 0) {
      scene.remove(firework);
      fireworks = fireworks.filter((fw) => fw !== firework);
    }
  });

  renderer.render(scene, camera);
}

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x002244); // 深蓝色背景

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 50;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1.5, 100);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);

  const loader = new FontLoader();
  loader.load("./json/STKaiti_Regular.json", function (font) {
    let xOffset = -20; // 起始位置

    const textData = [
      { text: "稀土掘金", color1: 0xff0000, color2: 0xffff00 },
      { text: "开发者社区", color1: 0x00ff00, color2: 0x0000ff },
      { text: "中秋快乐", color1: 0x00ffff, color2: 0xff00ff },
    ];

    textData.forEach((data) => {
      createRocket(font, data.text, data.color1, data.color2, xOffset);
      xOffset += 15; // 每段文字之间的间距
    });
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

onMounted(() => {
  init();
  window.addEventListener("resize", onWindowResize);
  animate();
});
</script>
