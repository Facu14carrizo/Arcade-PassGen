import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function RotatingLogo3D() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 4);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(24, 24);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 1);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    let model = null;
    let animationFrameId = null;

    // Load GLTF model
    const loader = new GLTFLoader();
    loader.load(
      '/3D/waveframelogo3dmodel.glb',
      (gltf) => {
        model = gltf.scene;
        
        // Center model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // Scale model appropriately
        model.scale.set(0.8, 0.8, 0.8);
        scene.add(model);
      },
      undefined,
      (err) => {
        console.warn('Error al cargar modelo 3D:', err);
      }
    );

    // Animation Loop
    let lastTime = performance.now();
    const animate = (currentTime) => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (model) {
        model.rotation.y += delta * 1.5;
      }

      renderer.render(scene, camera);
    };
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <span className="w-6 h-6 inline-flex items-center justify-center align-middle ml-1 relative">
      <span ref={containerRef} className="w-6 h-6 inline-block" />
    </span>
  );
}
