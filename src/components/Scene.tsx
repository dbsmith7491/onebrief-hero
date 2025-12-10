import Globe from "react-globe.gl";
import { useRef, useMemo, useCallback } from "react";
import arcsData from "../data/arcs.json";
import { generateGlobeTexture } from "../utils/generateGlobeTexture";
import { createGlobeMaterial } from "../utils/globeMaterial";
import { hexToRgba, adjustOpacity } from "../utils/colorUtils";
import { useStats } from "../hooks/useStats";
import { useGlobeOutline } from "../hooks/useGlobeOutline";
import { useGlobeControls } from "../hooks/useGlobeControls";
import { useRingAnimation } from "../hooks/useRingAnimation";
import { useLevaVisibility } from "../hooks/useLevaVisibility";
import { useGlobeSetup } from "../hooks/useGlobeSetup";
import { useWindowResize } from "../hooks/useWindowResize";
import { useGlobeOutlineConfig } from "../hooks/useGlobeOutlineConfig";
import type { Arc, Theme } from "../types";

interface SceneProps {
  motionEnabled: boolean;
  theme: Theme;
  showDebugger: boolean;
}

export function Scene({ motionEnabled, theme, showDebugger }: SceneProps) {
  const globeEl = useRef<any>(null);
  const dimensions = useWindowResize();

  // Get all Leva controls and theme configs
  const { themeConfigs, motionColors, outlineControls } = useGlobeControls();

  // Generate globe texture canvas based on current theme
  const globeTextureCanvas = useMemo(() => {
    const config = themeConfigs[theme];
    return generateGlobeTexture(config);
  }, [themeConfigs, theme]);

  // Create globe material from texture canvas
  const globeMaterial = useMemo(
    () => createGlobeMaterial(globeTextureCanvas),
    [globeTextureCanvas]
  );

  // Arc colors based on theme
  const allArcs = useMemo(() => {
    const arcColor =
      theme === "dark" ? motionColors.darkArcColor : motionColors.lightArcColor;
    const arcColorRgba = hexToRgba(arcColor, 1.0);
    return (arcsData as Arc[]).map((arc) => ({
      ...arc,
      color: arcColorRgba,
    }));
  }, [theme, motionColors]);

  // Ring animation management
  const activeRings = useRingAnimation(motionEnabled);

  // Ring color callback - fades as ring expands
  // ringColor must be a function that returns a function: (ring) => (t) => color
  // where t is the progress from 0 (start) to 1 (fully expanded)
  const ringColor = useCallback(
    (_ring: any) => {
      const baseColor =
        theme === "dark"
          ? motionColors.darkRingColor
          : motionColors.lightRingColor;

      // Return a function that receives t (progress 0 to 1)
      return (t: number) => {
        // t is the progress from 0 (start) to 1 (fully expanded)
        // Fade from full opacity to 0 as ring expands
        const opacity = Math.max(0, 1 - t);
        return adjustOpacity(baseColor, opacity);
      };
    },
    [theme, motionColors]
  );

  // Globe setup: camera, controls, lights, material
  useGlobeSetup(globeEl, globeMaterial, motionEnabled);

  // Performance monitor
  useStats(globeEl, showDebugger);

  // Hide/show Leva controls panel
  useLevaVisibility(showDebugger);

  // Globe outline configuration
  const { outlineColor, outlineThickness } = useGlobeOutlineConfig(
    theme,
    outlineControls
  );

  useGlobeOutline(globeEl, {
    color: outlineColor,
    edgeThickness: outlineThickness,
    dimensions,
  });

  // Offset globe to the right on desktop (30% of width)
  const globeOffset = useMemo(
    () =>
      dimensions.width >= 768
        ? ([dimensions.width * 0.36, 0] as [number, number])
        : ([0, 0] as [number, number]),
    [dimensions.width]
  );

  return (
    <div className="absolute inset-0" style={{ zIndex: 2 }} aria-hidden="true">
      <Globe
        ref={globeEl}
        backgroundColor="rgba(0,0,0,0)"
        globeMaterial={globeMaterial}
        globeOffset={globeOffset}
        showGlobe={true}
        showAtmosphere={false}
        animateIn={false}
        width={dimensions.width}
        height={dimensions.height}
        // Animated arcs with staggered start (hidden when paused)
        arcsData={motionEnabled ? allArcs : []}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcDashLength={0.8}
        arcDashGap={4}
        arcDashAnimateTime={motionEnabled ? 3000 : 0}
        arcDashInitialGap={(d: any) => d.order * 2}
        arcStroke={0.5}
        arcAltitudeAutoScale={0.25}
        arcsTransitionDuration={0}
        // Rings at arc destinations - pulse once when arc arrives
        ringsData={activeRings}
        ringColor={ringColor}
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        ringAltitude={0.001}
      />
    </div>
  );
}
