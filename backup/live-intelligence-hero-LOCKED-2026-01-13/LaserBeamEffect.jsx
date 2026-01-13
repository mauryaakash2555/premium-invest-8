"use client";

/**
 * LaserBeamEffect.jsx
 * 
 * WebGL recreation of Huly's hero laser beam effect
 * Built with Three.js + custom shaders
 * 
 * Analyzed from: https://huly.io/videos/pages/home/hero/hero.webm
 * 
 * Key visual elements:
 * 1. Central bright beam (white/cream core) - VERY bright horizontal line
 * 2. Wide diffuse warm orange/amber glow spreading up and down
 * 3. Subtle purple-pink outer atmospheric haze
 * 4. Horizontal lens flare with anamorphic stretch
 * 5. Light particles/dust floating
 * 6. Organic pulsing and subtle movement
 * 
 * The beam sits at roughly 65% from top (35% from bottom)
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function LaserBeamEffect({ className }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const animationRef = useRef(null);
  const uniformsRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090a0c);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Shader uniforms - tuned for Huly's exact look
    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(width, height) },
      uBeamPosition: { value: 0.32 }, // Lower on screen - 32% from bottom
      uBeamIntensity: { value: 1.0 },
    };
    uniformsRef.current = uniforms;

    // Vertex shader
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    // Fragment shader - VERTICAL laser beam like Huly
    const fragmentShader = `
      precision highp float;
      
      uniform float uTime;
      uniform vec2 uResolution;
      uniform float uBeamPosition;
      uniform float uBeamIntensity;
      
      varying vec2 vUv;
      
      void main() {
        vec2 uv = vUv;
        float aspect = uResolution.x / uResolution.y;
        
        // Pure dark background
        vec3 color = vec3(0.035, 0.039, 0.047);
        
        // Beam X position (center of screen)
        float beamX = 0.5;
        
        // Horizontal distance from beam (this creates VERTICAL beam)
        float distX = abs(uv.x - beamX);
        
        // Subtle time-based pulse
        float pulse = 0.95 + 0.05 * sin(uTime * 0.4);
        
        // === THE VERTICAL LASER BEAM ===
        
        // Layer 1: Very wide atmospheric glow (purple tint at edges)
        float atmosphere = exp(-distX * 3.0) * 0.06;
        color += vec3(0.4, 0.3, 0.5) * atmosphere;
        
        // Layer 2: Wide warm spread
        float wideGlow = exp(-distX * 6.0) * 0.2;
        color += vec3(0.9, 0.5, 0.3) * wideGlow * pulse;
        
        // Layer 3: Medium orange glow
        float midGlow = exp(-distX * 15.0) * 0.4;
        color += vec3(1.0, 0.6, 0.35) * midGlow * pulse;
        
        // Layer 4: Inner warm glow
        float innerGlow = exp(-distX * 35.0) * 0.5;
        color += vec3(1.0, 0.75, 0.5) * innerGlow * pulse;
        
        // Layer 5: Hot core
        float hotCore = exp(-distX * 80.0) * 0.7;
        color += vec3(1.0, 0.9, 0.7) * hotCore;
        
        // Layer 6: Bright beam core
        float brightCore = exp(-distX * 200.0) * 1.0;
        color += vec3(1.0, 0.95, 0.9) * brightCore;
        
        // Layer 7: Ultra bright center (the actual laser line)
        float laserLine = exp(-distX * 500.0) * 1.2;
        color += vec3(1.0, 1.0, 1.0) * laserLine;
        
        // === VERTICAL LENS FLARE ===
        // Full-height anamorphic flare
        float flare = exp(-distX * 100.0) * 0.3;
        float flareEdgeFade = smoothstep(0.0, 0.1, uv.y) * smoothstep(1.0, 0.9, uv.y);
        color += vec3(1.0, 0.85, 0.7) * flare * flareEdgeFade;
        
        // === BLOOM ===
        float bloom = exp(-distX * 2.0) * 0.04;
        color += vec3(0.7, 0.5, 0.4) * bloom;
        
        // Fade at edges of screen
        color *= smoothstep(0.0, 0.1, uv.x) * smoothstep(1.0, 0.9, uv.x);
        
        // Subtle vignette
        float vig = 1.0 - length((uv - 0.5) * vec2(0.4, 0.6)) * 0.2;
        color *= vig;
        
        // Tone mapping
        color = color / (0.9 + color);
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Create fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation loop
    const clock = new THREE.Clock();
    
    const animate = () => {
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.uResolution.value.set(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (rendererRef.current && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  );
}
