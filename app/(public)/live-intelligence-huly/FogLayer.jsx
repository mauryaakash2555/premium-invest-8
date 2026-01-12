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

// Lightweight procedural fog (no textures). Mouse adds "wind" displacement.
const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uStrength;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
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
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = m * p;
      a *= 0.55;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;

    // Wind from mouse
    vec2 m = uMouse;
    vec2 wind = (m - vec2(0.5, 0.55)) * vec2(0.35, 0.22);

    // Flow upward
    vec2 p = uv;
    p.y += uTime * 0.03;
    p += wind * 0.25;

    float n1 = fbm(p * 3.0 + vec2(0.0, uTime * 0.02));
    float n2 = fbm((p + vec2(0.12, -0.08)) * 6.0);
    float fog = smoothstep(0.40, 0.90, n1 * 0.75 + n2 * 0.35);

    // Darker fog at top, a bit denser in the middle
    float vertical = smoothstep(0.0, 0.75, uv.y);
    float center = 1.0 - smoothstep(0.0, 0.55, abs(uv.x - 0.5));

    // "Clearing" area around mouse (reveals cards by lowering fog alpha)
    float d = distance(uv, m);
    float clear = smoothstep(0.25, 0.0, d);

    float alpha = fog * (0.20 + center * 0.14) * (0.75 + (1.0 - vertical) * 0.25);
    alpha *= (1.0 - clear * 0.70);
    alpha *= (0.6 + uStrength * 0.7);

    vec3 color = vec3(0.26, 0.28, 0.85); // blue/purple tint
    color *= 0.55;

    gl_FragColor = vec4(color, alpha);
  }
`;

export default function FogLayer({ mouseRef, strengthRef }) {
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
      const dpr = 1; // keep cheap; video provides the detail
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
