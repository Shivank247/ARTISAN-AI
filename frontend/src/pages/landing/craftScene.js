/*
 * Scene controller for the landing-page hero.
 *
 * Responsibilities:
 * - renderer, camera, lights, image-based reflections
 * - render loop that only runs while the canvas is visible
 * - pointer parallax, responsive fitting, reduced-motion handling
 * - complete cleanup (geometries, materials, textures, renderer,
 *   observers and event listeners)
 */
import {
  ACESFilmicToneMapping,
  AmbientLight,
  DirectionalLight,
  PCFShadowMap,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import { createCraftCollection, disposeObject } from "./craftModels";

const FOV = 28;
const TARGET = new Vector3(0, 1.05, 0);
const BASE_ELEVATION = 0.2;
const INTRO_SECONDS = 1.8;

const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

export function createCraftScene(container, { onReady, onFail } = {}) {
  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const compact =
    window.matchMedia("(max-width: 700px)").matches ||
    (navigator.hardwareConcurrency || 8) <= 4;

  const quality = compact ? "low" : "high";

  let reducedMotion = reducedMotionQuery.matches;
  let visible = true;
  let running = false;
  let disposed = false;
  let readyNotified = false;
  let startTime = 0;

  /* ----- renderer ----- */
  const renderer = new WebGLRenderer({
    antialias: !compact,
    alpha: true,
    powerPreference: "default",
  });

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  canvas.className = "hero-canvas";
  container.appendChild(canvas);

  /* ----- scene ----- */
  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 60);

  const pmrem = new PMREMGenerator(renderer);
  const roomEnvironment = new RoomEnvironment();
  const environmentTarget = pmrem.fromScene(roomEnvironment, 0.04);
  scene.environment = environmentTarget.texture;
  scene.environmentIntensity = 0.75;
  roomEnvironment.traverse((object) => {
    object.geometry?.dispose();
    object.material?.dispose?.();
  });

  scene.add(new AmbientLight(0xf2eddf, 0.25));

  const key = new DirectionalLight(0xfff0d6, 2.6);
  key.position.set(4.5, 7, 5.5);
  key.castShadow = true;
  key.shadow.mapSize.set(compact ? 1024 : 2048, compact ? 1024 : 2048);
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -5;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 22;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  scene.add(key);

  const rim = new DirectionalLight(0xbcd8c8, 0.9);
  rim.position.set(-5, 3.5, -5);
  scene.add(rim);

  const candle = new PointLight(0xffa955, 2.2, 5, 2);
  candle.position.set(0.7, 0.55, 1.2);
  scene.add(candle);

  const collection = createCraftCollection({ quality });
  scene.add(collection.root);

  /* ----- sizing & camera framing ----- */
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let azimuth = 0;
  let elevation = BASE_ELEVATION;
  let distance = 12;

  const updateSize = () => {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    const aspect = width / height;
    const halfFov = Math.tan((FOV * Math.PI) / 360);

    renderer.setSize(width, height, false);
    camera.aspect = aspect;

    /* Fit the whole still life, whichever axis is tighter. */
    distance = Math.max(2.75 / halfFov, 3.55 / (halfFov * aspect));
    camera.updateProjectionMatrix();
  };

  const updateCamera = () => {
    const horizontal = Math.cos(elevation) * distance;

    camera.position.set(
      TARGET.x + Math.sin(azimuth) * horizontal,
      TARGET.y + Math.sin(elevation) * distance,
      TARGET.z + Math.cos(azimuth) * horizontal
    );
    camera.lookAt(TARGET);
  };

  /* ----- frame ----- */
  const renderFrame = (now) => {
    const seconds = (now - startTime) / 1000;

    const intro = reducedMotion
      ? 1
      : easeOutCubic(Math.min(seconds / INTRO_SECONDS, 1));

    if (reducedMotion) {
      pointer.x = 0;
      pointer.y = 0;
    } else {
      pointer.x += (pointer.targetX - pointer.x) * 0.05;
      pointer.y += (pointer.targetY - pointer.y) * 0.05;
    }

    azimuth = pointer.x * 0.2;
    elevation = BASE_ELEVATION - pointer.y * 0.05;

    const sway = reducedMotion ? 0 : Math.sin(seconds * 0.25) * 0.1;
    const float = reducedMotion ? 0 : Math.sin(seconds * 0.7) * 0.035;

    collection.root.rotation.y = sway - 0.12;
    collection.root.position.y = float - (1 - intro) * 0.9;
    collection.root.scale.setScalar(0.94 + intro * 0.06);

    if (!reducedMotion) {
      collection.update(seconds);
      candle.intensity = 2.2 + Math.sin(seconds * 9) * 0.25;
    }

    updateCamera();
    renderer.render(scene, camera);

    if (!readyNotified) {
      readyNotified = true;
      requestAnimationFrame(() => {
        if (!disposed) {
          onReady?.();
        }
      });
    }
  };

  const renderStill = () => {
    if (!disposed) {
      renderFrame(startTime + INTRO_SECONDS * 1000);
    }
  };

  /* ----- loop control (only render while useful) ----- */
  const shouldRun = () =>
    !disposed && visible && !document.hidden && !reducedMotion;

  const syncLoop = () => {
    if (shouldRun() && !running) {
      running = true;
      renderer.setAnimationLoop(renderFrame);
    } else if (!shouldRun() && running) {
      running = false;
      renderer.setAnimationLoop(null);
    }

    if (!running && !disposed && visible) {
      renderStill();
    }
  };

  /* ----- listeners ----- */
  const handlePointerMove = (event) => {
    if (reducedMotion || event.pointerType === "touch") {
      return;
    }

    pointer.targetX = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.targetY = (event.clientY / window.innerHeight) * 2 - 1;
  };

  const handlePointerLeave = () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
  };

  const handleMotionChange = (event) => {
    reducedMotion = event.matches;
    syncLoop();
  };

  const handleContextLost = (event) => {
    event.preventDefault();
    running = false;
    renderer.setAnimationLoop(null);
    onFail?.();
  };

  const resizeObserver =
    "ResizeObserver" in window
      ? new ResizeObserver(() => {
          updateSize();

          if (!running) {
            renderStill();
          }
        })
      : null;

  const visibilityObserver =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
            syncLoop();
          },
          { threshold: 0.05 }
        )
      : null;

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", handlePointerLeave);
  document.addEventListener("visibilitychange", syncLoop);
  reducedMotionQuery.addEventListener?.("change", handleMotionChange);
  canvas.addEventListener("webglcontextlost", handleContextLost);
  resizeObserver?.observe(container);
  visibilityObserver?.observe(container);

  /* ----- start ----- */
  startTime = performance.now();
  updateSize();
  syncLoop();

  /* ----- cleanup ----- */
  const dispose = () => {
    if (disposed) {
      return;
    }

    disposed = true;
    running = false;
    renderer.setAnimationLoop(null);

    window.removeEventListener("pointermove", handlePointerMove);
    document.documentElement.removeEventListener(
      "pointerleave",
      handlePointerLeave
    );
    document.removeEventListener("visibilitychange", syncLoop);
    reducedMotionQuery.removeEventListener?.("change", handleMotionChange);
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    resizeObserver?.disconnect();
    visibilityObserver?.disconnect();

    disposeObject(collection.root);
    scene.remove(collection.root);

    key.shadow.map?.dispose();
    environmentTarget.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.forceContextLoss();

    if (canvas.parentElement === container) {
      container.removeChild(canvas);
    }
  };

  return { dispose };
}
