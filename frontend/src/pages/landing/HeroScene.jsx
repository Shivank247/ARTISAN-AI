import { useEffect, useRef } from "react";
import { createCraftScene } from "./craftScene";

/*
 * Thin React wrapper around the Three.js scene. This module (and
 * therefore Three.js) is loaded with React.lazy from LandingPage,
 * so it is never part of the main bundle.
 */
function HeroScene({ onReady, onFail }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;

    if (!container) {
      return undefined;
    }

    let scene = null;

    try {
      scene = createCraftScene(container, { onReady, onFail });
    } catch (error) {
      console.warn("3D hero unavailable, using static artwork.", error);

      /* Report asynchronously: parent state is updated outside this effect body. */
      queueMicrotask(() => onFail?.());
    }

    return () => {
      scene?.dispose();
    };
  }, [onReady, onFail]);

  return <div ref={mountRef} className="hero-scene-mount" />;
}

export default HeroScene;
