
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./CraftScene.css";

function CraftScene() {
  const mountRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return undefined;

    let renderer;
    let observer;
    let resizeObserver;
    let animationFrame = 0;
    let disposed = false;
    let visible = !("IntersectionObserver" in window);
    let reducedMotion = false;

    let handleVisibilityChange = () => {};
    let handleMotionChange = () => {};
    let handleResize = () => {};

    const geometries = [];
    const materials = [];

    const reducedMotionQuery = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    );

    reducedMotion = reducedMotionQuery?.matches ?? false;

    const trackGeometry = (geometry) => {
      geometries.push(geometry);
      return geometry;
    };

    const trackMaterial = (material) => {
      materials.push(material);
      return material;
    };

    const stopAnimation = () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    const disposeResources = () => {
      disposed = true;
      stopAnimation();

      observer?.disconnect();
      resizeObserver?.disconnect();

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      reducedMotionQuery?.removeEventListener?.(
        "change",
        handleMotionChange
      );

      if (handleResize) {
        window.removeEventListener("resize", handleResize);
      }

      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());

      renderer?.dispose();

      if (renderer?.domElement?.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };

    try {
      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        35,
        1,
        0.1,
        100
      );

      camera.position.set(0, 0, 7);

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.5)
      );

      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      container.appendChild(renderer.domElement);

      // Lighting
      scene.add(new THREE.AmbientLight(0xffffff, 1.5));

      const keyLight = new THREE.PointLight(
        0xe7bd7c,
        35,
        20
      );
      keyLight.position.set(3, 3, 4);
      scene.add(keyLight);

      const fillLight = new THREE.PointLight(
        0xb65f42,
        20,
        20
      );
      fillLight.position.set(-3, -1, 3);
      scene.add(fillLight);

      // Handmade terracotta vase
      const sculpture = new THREE.Group();
      scene.add(sculpture);

      const profile = [
        [0, -1.55],
        [0.35, -1.55],
        [0.58, -1.42],
        [0.73, -1.12],
        [0.76, -0.78],
        [0.65, -0.35],
        [0.45, 0.15],
        [0.34, 0.65],
        [0.38, 1.05],
        [0.49, 1.22],
        [0.49, 1.32],
        [0.35, 1.32],
        [0.33, 1.22],
      ].map(([x, y]) => new THREE.Vector2(x, y));

      const vase = new THREE.Mesh(
        trackGeometry(new THREE.LatheGeometry(profile, 96)),
        trackMaterial(
          new THREE.MeshStandardMaterial({
            color: 0x9e5139,
            roughness: 0.42,
            metalness: 0.06,
          })
        )
      );

      sculpture.add(vase);

      // Antique-gold decorative rings
      const goldMaterial = trackMaterial(
        new THREE.MeshStandardMaterial({
          color: 0xc59a55,
          metalness: 0.72,
          roughness: 0.28,
        })
      );

      const ringDetails = [
        { radius: 0.7, y: -1.08 },
        { radius: 0.38, y: 0.98 },
        { radius: 0.43, y: 1.26 },
      ];

      ringDetails.forEach(({ radius, y }) => {
        const ring = new THREE.Mesh(
          trackGeometry(
            new THREE.TorusGeometry(radius, 0.018, 8, 80)
          ),
          goldMaterial
        );

        ring.rotation.x = Math.PI / 2;
        ring.position.y = y;
        sculpture.add(ring);
      });

      // Floating orbit
      const orbit = new THREE.Mesh(
        trackGeometry(
          new THREE.TorusGeometry(1.65, 0.008, 8, 120)
        ),
        trackMaterial(
          new THREE.MeshBasicMaterial({
            color: 0xc49a60,
            transparent: true,
            opacity: 0.55,
          })
        )
      );

      orbit.rotation.set(1.1, 0.2, 0.35);
      sculpture.add(orbit);

      // Floating particles
      const particleCount = 45;
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i += 1) {
        positions[i * 3] = (Math.random() - 0.5) * 4.2;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 4.2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
      }

      const particleGeometry = trackGeometry(
        new THREE.BufferGeometry()
      );

      particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );

      const particles = new THREE.Points(
        particleGeometry,
        trackMaterial(
          new THREE.PointsMaterial({
            color: 0xd6ae76,
            size: 0.022,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true,
          })
        )
      );

      scene.add(particles);

      // Pointer interaction
      let pointerX = 0;
      let pointerY = 0;
      let currentPointerX = 0;
      let currentPointerY = 0;

      const handlePointerMove = (event) => {
        const rect = container.getBoundingClientRect();

        if (!rect.width || !rect.height) return;

        pointerX =
          ((event.clientX - rect.left) / rect.width - 0.5) * 0.22;

        pointerY =
          ((event.clientY - rect.top) / rect.height - 0.5) * 0.14;
      };

      // Rendering
      const render = (time = 0) => {
        if (disposed) return;

        currentPointerX +=
          (pointerX - currentPointerX) * 0.035;

        currentPointerY +=
          (pointerY - currentPointerY) * 0.035;

        sculpture.rotation.y =
          time * 0.00018 + currentPointerX;

        sculpture.rotation.x = currentPointerY;
        sculpture.position.y = Math.sin(time * 0.0007) * 0.07;

        particles.rotation.y = time * 0.000025;

        renderer.render(scene, camera);
      };

      const animate = (time) => {
        if (disposed || !visible || document.hidden) return;

        render(time);
        animationFrame = requestAnimationFrame(animate);
      };

      const startAnimation = () => {
        if (disposed || !visible || document.hidden) return;

        stopAnimation();

        if (reducedMotion) {
          render(0);
          return;
        }

        animationFrame = requestAnimationFrame(animate);
      };

      // Browser visibility and motion preferences
      handleVisibilityChange = () => {
        if (document.hidden) {
          stopAnimation();
        } else {
          startAnimation();
        }
      };

      handleMotionChange = (event) => {
        reducedMotion = event.matches;
        startAnimation();
      };

      // Responsive sizing
      const updateSize = () => {
        if (disposed) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        if (!width || !height) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);

        if (reducedMotion && visible) {
          render(0);
        }
      };

      handleResize = updateSize;

      if ("ResizeObserver" in window) {
        resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(container);
      } else {
        window.addEventListener("resize", handleResize);
      }

      if ("IntersectionObserver" in window) {
        observer = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;

          if (visible) {
            startAnimation();
          } else {
            stopAnimation();
          }
        }, { threshold: 0.05 });

        observer.observe(container);
      }

      container.addEventListener(
        "pointermove",
        handlePointerMove
      );

      document.addEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      reducedMotionQuery?.addEventListener?.(
        "change",
        handleMotionChange
      );

      updateSize();
      render(0);
      startAnimation();

      return () => {
        container.removeEventListener(
          "pointermove",
          handlePointerMove
        );

        disposeResources();
      };
    } catch (error) {
      console.error("Craft scene initialization failed:", error);

      disposeResources();

      queueMicrotask(() => {
        if (mountRef.current === container) {
          setFailed(true);
        }
      });

      return undefined;
    }
  }, []);

  return (
    <div
      ref={mountRef}
      className={`craft-scene ${
        failed ? "craft-scene-fallback" : ""
      }`}
      aria-hidden="true"
    >
      {failed && <div className="craft-fallback-vase" />}
    </div>
  );
}

export default CraftScene;
