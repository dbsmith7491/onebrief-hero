import { useEffect } from "react";
import type { MeshBasicMaterial } from "three";
import {
  FORT_HOOD_COORDS,
  CAMERA_TRANSITION_DURATION,
} from "../constants/globe";

/**
 * Hook to handle globe initialization: camera, controls, lights, and material application
 */
export function useGlobeSetup(
  globeEl: React.RefObject<any>,
  globeMaterial: MeshBasicMaterial | undefined,
  motionEnabled: boolean
) {
  // Initialize scene controls and camera
  useEffect(() => {
    if (!globeEl.current) return;

    const controls = globeEl.current.controls();
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;

    // Position camera to show most bases prominently
    globeEl.current.pointOfView({ lat: 25, lng: -30, altitude: 1.5 }, 0);
  }, []);

  // Remove all lighting (using MeshBasicMaterial, no lighting needed)
  useEffect(() => {
    if (!globeEl.current) return;

    // Remove all lights using the library's lights() method
    globeEl.current.lights([]);

    // Also remove any lights directly from the scene
    const scene = globeEl.current.scene();
    const lightsToRemove: any[] = [];
    scene.traverse((child: any) => {
      if (child.type?.includes("Light")) {
        lightsToRemove.push(child);
      }
    });
    lightsToRemove.forEach((light) => scene.remove(light));
  }, []);

  // Apply material to globe mesh after globe is ready
  useEffect(() => {
    if (!globeEl.current) return;

    const checkInterval = setInterval(() => {
      const scene = globeEl.current?.scene();
      if (!scene) return;

      // Find the globe mesh
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

      if (globeMesh && globeMaterial) {
        // Force apply our material
        globeMesh.material = globeMaterial;
        globeMesh.material.needsUpdate = true;
        clearInterval(checkInterval);
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, [globeEl, globeMaterial]);

  // Auto-rotate and camera positioning based on motion state
  useEffect(() => {
    if (!globeEl.current) return;
    const controls = globeEl.current.controls();
    controls.autoRotate = motionEnabled;

    // When motion is paused, orbit camera to above Texas (Fort Hood location)
    if (!motionEnabled) {
      globeEl.current.pointOfView(
        { lat: FORT_HOOD_COORDS.lat, lng: FORT_HOOD_COORDS.lng, altitude: 1.5 },
        CAMERA_TRANSITION_DURATION
      );
    }
  }, [globeEl, motionEnabled]);
}
