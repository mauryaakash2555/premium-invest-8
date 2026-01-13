'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function makeCardMaterial({ baseOpacity }) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uBaseOpacity: { value: baseOpacity },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;

      uniform float uTime;
      uniform float uOpacity;
      uniform float uBaseOpacity;

      varying vec2 vUv;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 345.45));
        p += dot(p, p + 34.345);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      void main() {
        // Soft edge mask (no hard borders)
        float edgeX = smoothstep(0.0, 0.08, vUv.x) * (1.0 - smoothstep(0.92, 1.0, vUv.x));
        float edgeY = smoothstep(0.0, 0.10, vUv.y) * (1.0 - smoothstep(0.90, 1.0, vUv.y));
        float edge = edgeX * edgeY;

        // Subtle vertical gradient (luxury glass)
        float grad = mix(0.65, 1.0, vUv.y);

        // Very subtle noise
        float n = noise(vUv * 180.0 + uTime * 0.15);
        float grain = (n - 0.5) * 0.06;

        // Color: no pure white
        vec3 baseCol = vec3(120.0/255.0, 180.0/255.0, 255.0/255.0);
        vec3 col = baseCol * (0.12 + 0.10 * grad) + vec3(grain);

        float a = uBaseOpacity * uOpacity * edge;
        gl_FragColor = vec4(col, a);
      }
    `,
  });
}

function makeFogMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.55) },
      uStrength: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;

      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uStrength;
      varying vec2 vUv;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 345.45));
        p += dot(p, p + 34.345);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.55;
        mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p = m * p;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = vUv;
        vec2 wind = (uMouse - vec2(0.5, 0.55)) * (0.06 + 0.10 * uStrength);
        vec2 p = uv * 2.15 + vec2(0.0, uTime * 0.05);
        p += wind;

        float n = fbm(p);

        float centerDist = distance(uv, uMouse);
        float clear = smoothstep(0.34, 0.05, centerDist) * clamp(uStrength * 1.25, 0.0, 1.0);

        float fog = smoothstep(0.25, 0.85, n);
        fog *= 0.55;
        fog *= (1.0 - clear);

        vec3 col = mix(vec3(0.07, 0.08, 0.12), vec3(0.55, 0.62, 0.92), fog);
        gl_FragColor = vec4(col, fog);
      }
    `,
  });
}

export default function HeroWebGLBackground({ videoSrc }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    mouseN: { x: 0.5, y: 0.55 },
    mousePx: { x: 0, y: 0 },
    lastMouseN: { x: 0.5, y: 0.55 },
    velocity: 0,
    strength: 0,
    activityTarget: 0,
    activity: 0,
    revealT: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();

    let width = 1;
    let height = 1;
    const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -100, 100);
    camera.position.z = 10;

    // Video texture background
    const video = document.createElement('video');
    video.src = videoSrc;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';

    const videoTex = new THREE.VideoTexture(video);
    videoTex.colorSpace = THREE.SRGBColorSpace;
    videoTex.minFilter = THREE.LinearFilter;
    videoTex.magFilter = THREE.LinearFilter;
    videoTex.generateMipmaps = false;

    const videoMat = new THREE.MeshBasicMaterial({ map: videoTex, transparent: false });
    const videoGeo = new THREE.PlaneGeometry(1, 1);
    const videoMesh = new THREE.Mesh(videoGeo, videoMat);
    videoMesh.position.z = -10;
    scene.add(videoMesh);

    // Fog plane
    const fogMat = makeFogMaterial();
    const fogGeo = new THREE.PlaneGeometry(1, 1);
    const fogMesh = new THREE.Mesh(fogGeo, fogMat);
    fogMesh.position.z = -5;
    scene.add(fogMesh);

    // Dashboard planes (WebGL, not DOM)
    const dashboards = [];
    const corridor = new THREE.Group();
    corridor.position.z = 0;
    scene.add(corridor);

    const layers = [
      { name: 'near', w: 140, h: 420, count: 3, x: 180, opacity: 0.18, mult: 0.18 },
      { name: 'mid', w: 120, h: 360, count: 4, x: 260, opacity: 0.12, mult: 0.12 },
      { name: 'far', w: 100, h: 300, count: 5, x: 340, opacity: 0.07, mult: 0.08 },
    ];

    for (const layer of layers) {
      for (let i = 0; i < layer.count; i += 1) {
        const mat = makeCardMaterial({ baseOpacity: layer.opacity });
        const geo = new THREE.PlaneGeometry(layer.w, layer.h);
        const mesh = new THREE.Mesh(geo, mat);

        const sign = i % 2 === 0 ? 1 : -1;
        const jitterY = (i - (layer.count - 1) / 2) * (layer.h * 0.28) + (Math.random() - 0.5) * 60;
        const jitterX = layer.x + sign * (Math.random() * 24);

        mesh.position.x = jitterX;
        mesh.position.y = jitterY;
        mesh.position.z = -2; // flat plane stack; depth comes from multipliers
        mesh.rotation.z = (Math.random() - 0.5) * 0.02;

        corridor.add(mesh);
        dashboards.push({ mesh, mat, layer, base: { x: mesh.position.x, y: mesh.position.y } });
      }
    }

    // Micro particles
    const particleCount = 260;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 1200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 700;
      positions[i * 3 + 2] = -3;
      sizes[i] = 1 + Math.random() * 2.5;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMat = new THREE.PointsMaterial({
      color: new THREE.Color(0.75, 0.82, 1.0),
      size: 2.0,
      transparent: true,
      opacity: 0.10,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: false,
    });

    const particles = new THREE.Points(particlesGeo, particlesMat);
    particles.position.z = -4;
    scene.add(particles);

    const resize = () => {
      const parent = canvas.parentElement;
      const rect = (parent || canvas).getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);

      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();

      // Cover fit video plane based on intrinsic aspect (once known)
      const vw = video.videoWidth || 1920;
      const vh = video.videoHeight || 1080;
      const vAspect = vw / Math.max(1, vh);
      const sAspect = width / Math.max(1, height);

      let planeW = width;
      let planeH = height;
      if (sAspect > vAspect) {
        planeW = width;
        planeH = width / vAspect;
      } else {
        planeH = height;
        planeW = height * vAspect;
      }

      videoMesh.scale.set(planeW, planeH, 1);
      fogMesh.scale.set(width, height, 1);
    };

    const onPointerMove = (event) => {
      const parent = canvas.parentElement;
      const rect = (parent || canvas).getBoundingClientRect();
      const xN = clamp01((event.clientX - rect.left) / Math.max(1, rect.width));
      const yN = clamp01((event.clientY - rect.top) / Math.max(1, rect.height));

      const st = stateRef.current;
      const dx = xN - st.lastMouseN.x;
      const dy = yN - st.lastMouseN.y;
      const v = Math.min(1, Math.sqrt(dx * dx + dy * dy) * 10);

      st.lastMouseN = { x: xN, y: yN };
      st.mouseN = { x: xN, y: yN };
      st.mousePx = { x: xN * width, y: yN * height };
      st.velocity = v;
      st.strength = Math.max(st.strength * 0.9, v);

      st.activityTarget = v > 0.02 ? 1 : 0;
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    let rafId = 0;
    const startedAt = performance.now();

    const tick = () => {
      const now = performance.now();
      const t = (now - startedAt) / 1000;

      const st = stateRef.current;

      // Activity envelope (show cards only when moving)
      st.activity += (st.activityTarget - st.activity) * 0.08;
      st.revealT += (st.activity - st.revealT) * 0.08;
      const reveal = easeOutExpo(clamp01(st.revealT));

      // Fog uniforms
      fogMat.uniforms.uTime.value = t;
      fogMat.uniforms.uMouse.value.set(st.mouseN.x, st.mouseN.y);
      fogMat.uniforms.uStrength.value = st.strength;

      // Parallax corridor (camera feel)
      const mx = (st.mouseN.x - 0.5);
      const my = (st.mouseN.y - 0.55);

      // Laser is the background; keep it subtle
      const laserMult = 0.03;
      videoMesh.position.x = mx * width * laserMult;
      videoMesh.position.y = -my * height * laserMult;

      // Fog a bit more
      fogMesh.position.x = mx * width * 0.06;
      fogMesh.position.y = -my * height * 0.06;

      // Dashboard planes: per-depth multiplier and entry rise
      for (const item of dashboards) {
        const m = item.layer.mult;
        item.mesh.position.x = item.base.x + mx * width * m;
        item.mesh.position.y = item.base.y - my * height * m + (1.0 - reveal) * 10.0;
        item.mat.uniforms.uTime.value = t;
        item.mat.uniforms.uOpacity.value = reveal;
      }

      // Particles drift
      particles.position.x = mx * width * 0.08;
      particles.position.y = -my * height * 0.08;
      particles.rotation.z = t * 0.02;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };

    // Start
    resize();
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);

      try {
        video.pause();
      } catch {}

      videoTex.dispose();
      videoMat.dispose();
      videoGeo.dispose();

      fogMat.dispose();
      fogGeo.dispose();

      particlesGeo.dispose();
      particlesMat.dispose();

      for (const item of dashboards) {
        item.mesh.geometry.dispose();
        item.mat.dispose();
      }

      renderer.dispose();
    };
  }, [videoSrc]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}
