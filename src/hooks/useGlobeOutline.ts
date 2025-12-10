import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { hexToNumber } from "../utils/colorUtils";
import type { Theme } from "../types";

interface OutlineControls {
  darkOutlineColor: string;
  darkOutlineThickness: number;
  lightOutlineColor: string;
  lightOutlineThickness: number;
}

interface UseGlobeOutlineOptions {
  theme: Theme;
  outlineControls: OutlineControls;
  dimensions: { width: number; height: number };
  edgeStrength?: number;
  edgeGlow?: number;
}

/**
 * Hook to add an outline effect around the globe using OutlinePass.
 * Computes theme-based color and thickness, then applies the outline effect.
 * Polls for globe readiness and adds the pass to the postProcessingComposer.
 */
export function useGlobeOutline(
  globeEl: React.RefObject<any>,
  {
    theme,
    outlineControls,
    dimensions,
    edgeStrength = 1,
    edgeGlow = 0,
  }: UseGlobeOutlineOptions
) {
  const outlinePassRef = useRef<OutlinePass | null>(null);

  // Compute theme-based color and thickness
  const color = useMemo(() => {
    const colorHex =
      theme === "dark"
        ? outlineControls.darkOutlineColor
        : outlineControls.lightOutlineColor;
    return hexToNumber(colorHex);
  }, [theme, outlineControls]);

  const edgeThickness = useMemo(() => {
    return theme === "dark"
      ? outlineControls.darkOutlineThickness
      : outlineControls.lightOutlineThickness;
  }, [theme, outlineControls]);

  useEffect(() => {
    // Update properties if outline pass exists
    if (outlinePassRef.current) {
      outlinePassRef.current.visibleEdgeColor.set(color);
      outlinePassRef.current.hiddenEdgeColor.set(color);
      outlinePassRef.current.edgeThickness = edgeThickness;
      outlinePassRef.current.edgeStrength = edgeStrength;
      outlinePassRef.current.edgeGlow = edgeGlow;
      return; // Pass exists, just update and exit
    }

    // Poll until globe is ready (stop once pass is created)
    const checkInterval = setInterval(() => {
      if (!globeEl.current || outlinePassRef.current) {
        if (outlinePassRef.current) clearInterval(checkInterval);
        return;
      }

      const scene = globeEl.current.scene();
      const camera = globeEl.current.camera();
      const composer = globeEl.current.postProcessingComposer();

      // Find the visible globe mesh (sphere geometry, visible=true)
      let globeMesh: any = null;
      scene.traverse((child: any) => {
        if (
          child.type === "Mesh" &&
          child.geometry?.type === "SphereGeometry" &&
          child.visible === true
        ) {
          globeMesh = child;
        }
      });

      if (!globeMesh) return;

      clearInterval(checkInterval);

      // Create and add OutlinePass
      const outlinePass = new OutlinePass(
        new THREE.Vector2(dimensions.width, dimensions.height),
        scene,
        camera
      );
      outlinePass.selectedObjects = [globeMesh];
      outlinePass.edgeStrength = edgeStrength;
      outlinePass.edgeGlow = edgeGlow;
      outlinePass.edgeThickness = edgeThickness;
      outlinePass.visibleEdgeColor.set(color);
      outlinePass.hiddenEdgeColor.set(color);

      composer.addPass(outlinePass);
      outlinePassRef.current = outlinePass;
    }, 100);

    return () => {
      clearInterval(checkInterval);
    };
  }, [globeEl, color, edgeThickness, edgeStrength, edgeGlow, dimensions]);
}
