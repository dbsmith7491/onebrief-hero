import Globe from "react-globe.gl";
import { useRef, useMemo } from "react";
import { generateGlobeTexture } from "../utils/generateGlobeTexture";
import { createGlobeMaterial } from "../utils/globeMaterial";
import { useStats } from "../hooks/useStats";
import { useGlobeOutline } from "../hooks/useGlobeOutline";
import { useGlobeControls } from "../hooks/useGlobeControls";
import { useArcAnimation } from "../hooks/useArcAnimation";
import { useRingAnimation } from "../hooks/useRingAnimation";
import { useLevaVisibility } from "../hooks/useLevaVisibility";
import { useGlobeSetup } from "../hooks/useGlobeSetup";
import { useWindowResize } from "../hooks/useWindowResize";
import type { Theme } from "../types";

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

  // Arc animation management (includes color)
  const allArcs = useArcAnimation(theme, motionColors);

  // Ring animation management (includes color callback)
  const { activeRings, ringColor } = useRingAnimation(
    motionEnabled,
    theme,
    motionColors
  );

  // Globe setup: camera, controls, lights, material
  useGlobeSetup(globeEl, globeMaterial, motionEnabled);

  // Performance monitor
  useStats(globeEl, showDebugger);

  // Hide/show Leva controls panel
  useLevaVisibility(showDebugger);

  // Globe outline with theme-based color and thickness
  useGlobeOutline(globeEl, {
    theme,
    outlineControls,
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
