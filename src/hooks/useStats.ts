import { useEffect, useRef } from "react";
import Stats from "three/examples/jsm/libs/stats.module.js";

/**
 * Hook to add Stats.js performance monitor to a Three.js renderer.
 * Displays FPS counter in bottom-left corner.
 *
 * @param rendererRef - Ref to the renderer (or object with renderer() method like globe)
 * @param showDebugger - Whether to show the stats panel
 */
export function useStats(
  globeRef: React.RefObject<any>,
  showDebugger: boolean
) {
  const statsRef = useRef<Stats | null>(null);
  const wrappedRef = useRef(false);
  const renderWrapperRef = useRef<((scene: any, camera: any) => void) | null>(
    null
  );

  useEffect(() => {
    // Show/hide existing stats
    if (statsRef.current) {
      statsRef.current.dom.style.display = showDebugger ? "block" : "none";
    }

    if (!showDebugger) {
      // Clean up if hiding
      if (statsRef.current && document.body.contains(statsRef.current.dom)) {
        const renderer = globeRef.current?.renderer?.();
        if (renderer && renderWrapperRef.current) {
          // Restore original render function
          renderer.render = renderWrapperRef.current;
        }
        document.body.removeChild(statsRef.current.dom);
        statsRef.current = null;
        wrappedRef.current = false;
        renderWrapperRef.current = null;
      }
      return;
    }

    // Poll until globe/renderer is available
    const checkInterval = setInterval(() => {
      if (wrappedRef.current) {
        clearInterval(checkInterval);
        return;
      }

      const renderer = globeRef.current?.renderer?.();
      if (!renderer) return;

      // Create and mount Stats
      const stats = new Stats();
      stats.dom.style.position = "absolute";
      stats.dom.style.bottom = "10px";
      stats.dom.style.left = "10px";
      stats.dom.style.display = "block";
      document.body.appendChild(stats.dom);
      statsRef.current = stats;
      wrappedRef.current = true;
      clearInterval(checkInterval);

      // Wrap render function
      const originalRender = renderer.render.bind(renderer);
      renderWrapperRef.current = originalRender;
      renderer.render = (scene: any, camera: any) => {
        stats.begin();
        originalRender(scene, camera);
        stats.end();
      };
    }, 100);

    return () => {
      clearInterval(checkInterval);
    };
  }, [globeRef, showDebugger]);
}
