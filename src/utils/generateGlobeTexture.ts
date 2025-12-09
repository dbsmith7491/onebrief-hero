import countriesData from "../data/custom.geo.json";
import basesData from "../data/bases.json";

// Canvas dimensions (4K for crisp rendering)
const TEXTURE_WIDTH = 4096;
const TEXTURE_HEIGHT = 2048;

/** Theme configuration for globe texture rendering */
export interface GlobeThemeConfig {
  // Colors
  ocean: string;
  land: string;
  border: string;
  bases: string;
  // Styling
  borderWidth: number;
  baseMarkerRadius: number;
  baseBorderColor?: string;
  baseBorderWidth?: number;
  // Dot pattern (optional)
  useDots?: boolean;
  dotRadius?: number;
  dotSpacing?: number;
  dotColor?: string;
  dotBackground?: string;
}

/**
 * Generates a globe texture with countries and base markers baked in.
 * Returns a data URL for use as globeImageUrl.
 *
 * @param config - Theme configuration for colors and styling
 */
export function generateGlobeTexture(
  config: GlobeThemeConfig
): HTMLCanvasElement | null {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Helper: Convert lat/lng to equirectangular x/y
  const project = (lng: number, lat: number): [number, number] => {
    const x = ((lng + 180) / 360) * TEXTURE_WIDTH;
    const y = ((90 - lat) / 180) * TEXTURE_HEIGHT;
    return [x, y];
  };

  // 1. Background
  const oceanColor =
    config.useDots && config.dotBackground
      ? config.dotBackground
      : config.ocean;
  ctx.fillStyle = oceanColor;
  ctx.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

  if (config.useDots) {
    // --- DOT PATTERN MODE ---
    // Create a mask to distinguish land from ocean
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = TEXTURE_WIDTH;
    maskCanvas.height = TEXTURE_HEIGHT;
    const maskCtx = maskCanvas.getContext("2d");
    if (!maskCtx) return null;

    // Draw all land areas as white on black
    maskCtx.fillStyle = "#000000";
    maskCtx.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
    maskCtx.fillStyle = "#ffffff";

    const drawMaskPolygon = (coords: number[][]) => {
      if (!coords || coords.length === 0) return;
      maskCtx.beginPath();
      coords.forEach(([lng, lat], i) => {
        const [x, y] = project(lng, lat);
        if (i === 0) maskCtx.moveTo(x, y);
        else maskCtx.lineTo(x, y);
      });
      maskCtx.closePath();
      maskCtx.fill();
    };

    (countriesData as any).features.forEach((feature: any) => {
      const geom = feature.geometry;
      if (geom.type === "Polygon") {
        geom.coordinates.forEach(drawMaskPolygon);
      } else if (geom.type === "MultiPolygon") {
        geom.coordinates.forEach((polygon: number[][][]) => {
          polygon.forEach(drawMaskPolygon);
        });
      }
    });

    // Get mask image data
    const maskData = maskCtx.getImageData(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

    // Draw dots with different colors for land vs ocean
    const dotRadius = config.dotRadius || 3;
    const dotSpacing = config.dotSpacing || 20;
    const landColor = config.dotColor || config.land;
    const oceanColor = config.ocean;

    for (let y = 0; y < TEXTURE_HEIGHT; y += dotSpacing) {
      for (let x = 0; x < TEXTURE_WIDTH; x += dotSpacing) {
        // Check if this pixel is land (white in mask)
        const pixelIndex = (y * TEXTURE_WIDTH + x) * 4;
        const isLand = maskData.data[pixelIndex] > 128;

        ctx.fillStyle = isLand ? landColor : oceanColor;
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    // --- SOLID FILL MODE ---
    const drawPolygon = (coords: number[][]) => {
      if (!coords || coords.length === 0) return;
      ctx.beginPath();
      coords.forEach(([lng, lat], i) => {
        const [x, y] = project(lng, lat);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    ctx.fillStyle = config.land;
    ctx.strokeStyle = config.border;
    ctx.lineWidth = config.borderWidth;
    ctx.lineJoin = "round";

    (countriesData as any).features.forEach((feature: any) => {
      const geom = feature.geometry;
      if (geom.type === "Polygon") {
        geom.coordinates.forEach(drawPolygon);
      } else if (geom.type === "MultiPolygon") {
        geom.coordinates.forEach((polygon: number[][][]) => {
          polygon.forEach(drawPolygon);
        });
      }
    });
  }

  // 3. Draw base markers
  (basesData as any[]).forEach((base) => {
    const [x, y] = project(base.lng, base.lat);

    // Draw base border if configured
    if (
      config.baseBorderColor &&
      config.baseBorderWidth &&
      config.baseBorderWidth > 0
    ) {
      ctx.strokeStyle = config.baseBorderColor;
      ctx.lineWidth = config.baseBorderWidth;
      ctx.beginPath();
      ctx.arc(x, y, config.baseMarkerRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw base fill
    ctx.fillStyle = config.bases;
    ctx.beginPath();
    ctx.arc(x, y, config.baseMarkerRadius, 0, Math.PI * 2);
    ctx.fill();
  });

  return canvas;
}
