/**
 * Shared type definitions
 */

export type Theme = "dark" | "light";

export interface Arc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  from: string;
  to: string;
  order: number;
}

