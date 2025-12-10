/**
 * Globe-related constants
 */

// Fort Hood, Texas coordinates (used for camera positioning when paused)
export const FORT_HOOD_COORDS = {
  lat: 31.1349,
  lng: -97.7756,
} as const;

// Default camera position
export const DEFAULT_CAMERA_POSITION = {
  lat: 25,
  lng: -30,
  altitude: 1.5,
} as const;

// Camera transition duration (ms)
export const CAMERA_TRANSITION_DURATION = 1000;
