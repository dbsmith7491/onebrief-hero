import * as THREE from "three";

/**
 * Creates a MeshBasicMaterial with a canvas texture for the globe
 * Uses CanvasTexture directly to avoid color space double-correction
 */
export function createGlobeMaterial(
  canvas: HTMLCanvasElement | null
): THREE.MeshBasicMaterial | undefined {
  if (!canvas) return undefined;

  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = true; // Flip Y for correct equirectangular orientation
  texture.needsUpdate = true;

  return new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.FrontSide,
  });
}
