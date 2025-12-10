import { useMemo } from "react";
import arcsData from "../data/arcs.json";
import { hexToRgba } from "../utils/colorUtils";
import type { Arc, Theme } from "../types";

interface MotionColors {
  darkArcColor: string;
  lightArcColor: string;
}

/**
 * Hook to manage arc animations with theme-based coloring
 * Returns arcs with colors applied based on current theme
 */
export function useArcAnimation(theme: Theme, motionColors: MotionColors) {
  const allArcs = useMemo(() => {
    const arcColor =
      theme === "dark" ? motionColors.darkArcColor : motionColors.lightArcColor;
    const arcColorRgba = hexToRgba(arcColor, 1.0);
    return (arcsData as Arc[]).map((arc) => ({
      ...arc,
      color: arcColorRgba,
    }));
  }, [theme, motionColors]);

  return allArcs;
}
