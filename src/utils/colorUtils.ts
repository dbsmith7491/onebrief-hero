/**
 * Utility functions for color conversions
 */

/**
 * Converts a hex color string to rgba with specified opacity
 */
export function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity.toFixed(2)})`;
}

/**
 * Converts a hex color string to a number (0x format) for Three.js
 */
export function hexToNumber(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}
