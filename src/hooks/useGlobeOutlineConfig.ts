import { useMemo } from "react";
import { hexToNumber } from "../utils/colorUtils";
import type { Theme } from "../types";

interface OutlineControls {
  darkOutlineColor: string;
  darkOutlineThickness: number;
  lightOutlineColor: string;
  lightOutlineThickness: number;
}

/**
 * Hook to compute globe outline color and thickness from Leva controls
 */
export function useGlobeOutlineConfig(
  theme: Theme,
  outlineControls: OutlineControls
) {
  const outlineColor = useMemo(() => {
    const colorHex =
      theme === "dark"
        ? outlineControls.darkOutlineColor
        : outlineControls.lightOutlineColor;
    return hexToNumber(colorHex);
  }, [theme, outlineControls]);

  const outlineThickness = useMemo(() => {
    return theme === "dark"
      ? outlineControls.darkOutlineThickness
      : outlineControls.lightOutlineThickness;
  }, [theme, outlineControls]);

  return { outlineColor, outlineThickness };
}
