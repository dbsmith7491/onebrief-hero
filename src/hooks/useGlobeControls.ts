import { useMemo } from "react";
import { useControls, folder } from "leva";
import type { GlobeThemeConfig } from "../utils/generateGlobeTexture";

/**
 * Hook to manage all Leva controls for the globe scene
 * Returns theme configurations and motion colors
 */
export function useGlobeControls() {
  // Leva color controls for globe texture
  const globeColors = useControls("Globe Colors", {
    dark: folder({
      darkOcean: { value: "#3d3d3d", label: "Ocean (Body)" },
      darkLand: { value: "#191919", label: "Land (Fill)" },
      darkBorder: { value: "#ffffff33", label: "Border" },
      darkBases: { value: "#ffffff", label: "Bases" },
      darkBorderWidth: {
        value: 2,
        min: 0,
        max: 5,
        step: 0.5,
        label: "Border Width",
      },
      darkBaseRadius: {
        value: 4,
        min: 1,
        max: 10,
        step: 1,
        label: "Base Radius",
      },
      darkBaseBorderColor: { value: "#ffffff", label: "Base Border Color" },
      darkBaseBorderWidth: {
        value: 1,
        min: 0,
        max: 5,
        step: 0.5,
        label: "Base Border Width",
      },
    }),
    light: folder({
      lightOcean: { value: "#79C4FF", label: "Ocean (Body)" },
      lightLand: { value: "#FFFFFA", label: "Land (Fill)" },
      lightBorder: { value: "#3d3d3d", label: "Border" },
      lightBases: { value: "#3a94f9", label: "Bases" },
      lightBorderWidth: {
        value: 2,
        min: 0,
        max: 5,
        step: 0.5,
        label: "Border Width",
      },
      lightBaseRadius: {
        value: 3,
        min: 1,
        max: 10,
        step: 1,
        label: "Base Radius",
      },
      lightBaseBorderColor: { value: "#3d3d3d", label: "Base Border Color" },
      lightBaseBorderWidth: {
        value: 2,
        min: 0,
        max: 5,
        step: 0.5,
        label: "Base Border Width",
      },
    }),
  });

  // Leva color controls for arcs and rings
  const motionColors = useControls("Motion Colors", {
    dark: folder({
      darkArcColor: { value: "#019eff", label: "Arc Color" },
      darkRingColor: { value: "rgba(255, 255, 255, 0.6)", label: "Ring Color" },
    }),
    light: folder({
      lightArcColor: { value: "#019eff", label: "Arc Color" },
      lightRingColor: { value: "#3A94F9", label: "Ring Color" },
    }),
  });

  // Leva controls for globe outline
  const outlineControls = useControls("Globe Outline", {
    dark: folder({
      darkOutlineColor: { value: "#ffffff", label: "Outline Color" },
      darkOutlineThickness: {
        value: 1,
        min: 0,
        max: 5,
        step: 0.1,
        label: "Outline Thickness",
      },
    }),
    light: folder({
      lightOutlineColor: { value: "#a3a099", label: "Outline Color" },
      lightOutlineThickness: {
        value: 1,
        min: 0,
        max: 5,
        step: 0.1,
        label: "Outline Thickness",
      },
    }),
  });

  // Build theme configs from Leva values
  const themeConfigs: Record<"dark" | "light", GlobeThemeConfig> = useMemo(
    () => ({
      dark: {
        ocean: globeColors.darkOcean,
        land: globeColors.darkLand,
        border: globeColors.darkBorder,
        bases: globeColors.darkBases,
        borderWidth: globeColors.darkBorderWidth,
        baseMarkerRadius: globeColors.darkBaseRadius,
        baseBorderColor: globeColors.darkBaseBorderColor,
        baseBorderWidth: globeColors.darkBaseBorderWidth,
      },
      light: {
        ocean: globeColors.lightOcean,
        land: globeColors.lightLand,
        border: globeColors.lightBorder,
        bases: globeColors.lightBases,
        borderWidth: globeColors.lightBorderWidth,
        baseMarkerRadius: globeColors.lightBaseRadius,
        baseBorderColor: globeColors.lightBaseBorderColor,
        baseBorderWidth: globeColors.lightBaseBorderWidth,
      },
    }),
    [globeColors]
  );

  return {
    themeConfigs,
    motionColors,
    outlineControls,
  };
}
