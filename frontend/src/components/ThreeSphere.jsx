import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Sparkles, Shield, Cpu, Database, Check } from 'lucide-react';

export const ThreeSphere = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene, Camera, Renderer
    const width = currentMount.clientWidth || 450;
    const height = currentMount.clientHeight || 450;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Group to hold all objects for unified rotation
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Geodesic Wireframe Sphere (Icosahedron)
    const sphereGeo = new THREE.IcosahedronGeometry(1.5, 2);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    mainGroup.add(sphere);

    // 2. Inner Glowing Core
    const innerGeo = new THREE.IcosahedronGeometry(0.85, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerSphere);

    // 3. Orbiting Rings
    const ringGeo1 = new THREE.TorusGeometry(2.1, 0.018, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.7,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    mainGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.3, 0.015, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.6,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 4;
    mainGroup.add(ring2);

    // 4. Floating Particles / Cloud
    const particlesCount = 120;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      const radius = 1.8 + Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: 0xc084fc,
      size: 0.04,
      transparent: true,
      opacity: 0.8,
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    mainGroup.add(particleSystem);

    // Mouse / Touch Interaction for Drag to Rotate
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      previousMousePosition = { x: clientX, y: clientY };
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const deltaX = clientX - previousMousePosition.x;
      const deltaY = clientY - previousMousePosition.y;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.008;

      previousMousePosition = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Handle Resize
    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Auto rotation
      if (!isDragging) {
        targetRotationY += 0.003;
        targetRotationX += 0.001;
      }

      // Smooth damping interpolation
      mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.08;
      mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.08;

      // Internal counter-rotations
      innerSphere.rotation.y -= 0.006;
      sphere.rotation.y += 0.002;
      ring1.rotation.z += 0.004;
      ring2.rotation.z -= 0.003;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full max-w-[480px] h-[440px] sm:h-[480px] mx-auto flex items-center justify-center select-none">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
      />

      {/* Floating Glassmorphism Badge 1: Accuracy (Top Left) */}
      <div className="absolute top-4 left-2 sm:-left-4 bg-slate-900/80 backdrop-blur-md border border-emerald-500/40 rounded-xl px-3 py-1.5 shadow-lg shadow-black/40 flex items-center gap-2 transform hover:scale-105 transition-transform pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-semibold text-white">94% Accuracy</span>
      </div>

      {/* Floating Glassmorphism Badge 2: Low Hallucination (Top Right) */}
      <div className="absolute top-8 right-2 sm:-right-4 bg-slate-900/80 backdrop-blur-md border border-purple-500/40 rounded-xl px-3 py-1.5 shadow-lg shadow-black/40 flex items-center gap-2 transform hover:scale-105 transition-transform pointer-events-none">
        <Shield className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-xs font-semibold text-purple-200">LOW Hallucination</span>
      </div>

      {/* Floating Glassmorphism Badge 3: Completeness (Bottom Left) */}
      <div className="absolute bottom-16 left-2 sm:-left-6 bg-slate-900/80 backdrop-blur-md border border-blue-500/40 rounded-xl px-3 py-1.5 shadow-lg shadow-black/40 flex items-center gap-2 transform hover:scale-105 transition-transform pointer-events-none">
        <Check className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-xs font-semibold text-blue-200">89% Completeness</span>
      </div>

      {/* Floating Glassmorphism Badge 4: Relevance (Bottom Right) */}
      <div className="absolute bottom-14 right-2 sm:-right-4 bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 rounded-xl px-3 py-1.5 shadow-lg shadow-black/40 flex items-center gap-2 transform hover:scale-105 transition-transform pointer-events-none">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-xs font-semibold text-cyan-200">96% Relevance</span>
      </div>

      {/* Floating Glassmorphism Badge 5: Ensemble Online (Top Center) */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-md border border-slate-700 rounded-full px-3.5 py-1 shadow-lg shadow-black/50 flex items-center gap-1.5 pointer-events-none">
        <Cpu className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-[11px] font-mono font-medium text-indigo-300">
          JUDGE_ENSEMBLE: ONLINE [5/5]
        </span>
      </div>

      {/* Floating Glassmorphism Badge 6: ChromaDB Latency (Bottom Center) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-full px-3 py-1 shadow-lg shadow-black/50 flex items-center gap-1.5 pointer-events-none">
        <Database className="w-3 h-3 text-emerald-400" />
        <span className="text-[10px] font-mono font-medium text-slate-300">
          CHROMADB_LATENCY: 18ms
        </span>
      </div>

      {/* Interactive 3D Hint */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-wider uppercase text-slate-400 font-mono flex items-center gap-1 bg-slate-900/60 px-2.5 py-0.5 rounded-full border border-slate-800">
        <span>Click & Drag to Rotate in 3D</span>
      </div>
    </div>
  );
};

export default ThreeSphere;
