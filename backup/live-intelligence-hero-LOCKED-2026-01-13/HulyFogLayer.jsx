'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
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
    vec2 p = uv * 2.25 + vec2(0.0, uTime * 0.06);
    p += wind;

    float n = fbm(p);

    float centerDist = distance(uv, uMouse);
    float clear = smoothstep(0.34, 0.04, centerDist) * clamp(uStrength * 1.25, 0.0, 1.0);

    float fog = smoothstep(0.25, 0.85, n);
    fog *= 0.62;
    fog *= (1.0 - clear);

    vec3 col = mix(vec3(0.07, 0.08, 0.12), vec3(0.55, 0.62, 0.92), fog);

    gl_FragColor = vec4(col, fog);
  }
`;

export default function HulyFogLayer({ mouseRef, strengthRef }) {
  const canvasRef = useRef(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.55) },
      uStrength: { value: 0 },
    }),
    []
  );

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
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let rafId = 0;
    const startedAt = performance.now();

    const resize = () => {
      const parent = canvas.parentElement;
      const rect = (parent || canvas).getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      const dpr = 1;
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
    };

    const tick = () => {
      const now = performance.now();
      uniforms.uTime.value = (now - startedAt) / 1000;

      const m = mouseRef.current;
      if (m) uniforms.uMouse.value.set(m.x, m.y);
      uniforms.uStrength.value = strengthRef.current;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [mouseRef, strengthRef, uniforms]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}
