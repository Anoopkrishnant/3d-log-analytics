"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";


export default function ThreeScene() {
  const mountRef = useRef(null);
  const mixersRef = useRef([]); 

  useEffect(() => {
    // Sizes
    let w = window.innerWidth;
    let h = window.innerHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    mountRef.current.appendChild(renderer.domElement);

    // OrbitControls
    const ctrls = new OrbitControls(camera, renderer.domElement);
    ctrls.enableDamping = true;

    // Load FBX Model function
    async function loadFbx() {
      const loader = new FBXLoader();
      const fbx = await loader.loadAsync("/assets/Treading-Water-astro.fbx"); // Adjust path for your app public folder
      const mat = new THREE.MeshStandardMaterial({
        roughness: 0.2,
        metalness: 1.0,
        flatShading: false,
      });
      fbx.position.set(0, -2.0, 0);
      fbx.traverse((c) => {
        if (c.isMesh) {
          c.material = mat;
        }
      });

      const mixer = new THREE.AnimationMixer(fbx);
      const anim = fbx.animations[0];
      const action = mixer.clipAction(anim);
      action.play();

      // Save mixer for updating
      mixersRef.current.push(mixer);

      // Attach update function for convenience
      fbx.userData.update = () => {
        mixer.update(0.015);
      };

      return fbx;
    }

    // Firefly helper functions
    function getFirefly() {
      let hue = 0.6 + Math.random() * 0.2;
      if (Math.random() < 0.02) {
        hue = 0.25; // rare green one
      }
      const color = new THREE.Color().setHSL(hue, 1, 0.5);

      const light = new THREE.SpotLight(color, 2);

      const geo = new THREE.IcosahedronGeometry(0.02, 2);
      const mat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.add(light);

      function _getOrbitObj(mesh) {
        const orbitObj = new THREE.Object3D();
        const radius = 2.5;
        mesh.position.x = radius;
        orbitObj.rotation.x = THREE.MathUtils.degToRad(90);
        orbitObj.rotation.y = Math.random() * Math.PI * 2;
        orbitObj.add(mesh);
        const rate = Math.random() * 0.01 + 0.005;
        const offset = Math.floor(Math.random() * 6);
        let roteZ = 0;
        orbitObj.userData.update = () => {
          roteZ += rate;
          orbitObj.rotation.z = roteZ + offset;
        };
        return orbitObj;
      }

      function _addGlow(mesh) {
        const glowMat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.15,
        });
        const glowMesh = new THREE.Mesh(geo, glowMat);
        glowMesh.scale.multiplyScalar(1.5);
        const glowMesh2 = new THREE.Mesh(geo, glowMat);
        glowMesh2.scale.multiplyScalar(2.5);
        const glowMesh3 = new THREE.Mesh(geo, glowMat);
        glowMesh3.scale.multiplyScalar(4);
        const glowMesh4 = new THREE.Mesh(geo, glowMat);
        glowMesh4.scale.multiplyScalar(6);

        mesh.add(glowMesh);
        mesh.add(glowMesh2);
        mesh.add(glowMesh3);
        mesh.add(glowMesh4);
      }

      const orbitObj = _getOrbitObj(mesh);
      _addGlow(mesh);

      return orbitObj;
    }

    // Initialize fireflies array
    const pLights = [];
    for (let i = 0; i < 20; i++) {
      const pLight = getFirefly();
      scene.add(pLight);
      pLights.push(pLight);
    }



    // Load FBX and add to scene
    loadFbx().then((fbx) => {
      scene.add(fbx);
      mixersRef.current.push(fbx.userData);
    });

    // Animation loop
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      pLights.forEach((l) => l.userData.update());

      // Update all mixers
      mixersRef.current.forEach((m) => {
        if (typeof m.update === "function") {
          m.update(clock.getDelta() * 0.5);
        }
      });

      ctrls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Handle resizing
    function handleWindowResize() {
      w = window.innerWidth;
      h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", handleWindowResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleWindowResize);

      // Dispose Three.js objects to prevent memory leaks
      renderer.dispose();
      ctrls.dispose();

      mixersRef.current = [];

      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
}
