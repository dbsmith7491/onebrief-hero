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

/**
 * Adjusts the opacity of an rgba or hex color string
 * Handles both rgba() and hex (#) color formats
 */
export function adjustOpacity(color: string, opacity: number): string {
  if (color.startsWith("rgba")) {
    // Already rgba, extract and update opacity
    const rgbaMatch = color.match(/rgba?\(([^)]+)\)/);
    if (rgbaMatch) {
      const parts = rgbaMatch[1].split(",").map((s) => s.trim());
      const baseOpacity = parts.length > 3 ? parseFloat(parts[3]) : 1;
      const finalOpacity = opacity * baseOpacity;
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${finalOpacity.toFixed(3)})`;
    }
  } else if (color.startsWith("#")) {
    // Hex color, convert to rgba with opacity
    return hexToRgba(color, opacity);
  }

  // Fallback: return color as-is
  return color;
}
