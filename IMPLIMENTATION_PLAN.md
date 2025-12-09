# OnebriefHero Component - Implementation Plan

## Overview
A React/TypeScript hero component featuring a Three.js globe with military base visualizations, an SVG vector field background, and comprehensive theming controls.

**Implementation Philosophy:** Incremental build with verification gates at each phase. Each phase ends with specific confirmations before proceeding.

---

## Leva Theming Pattern

Both Light and Dark theme colors are exposed simultaneously in Leva UI via folders. Users can customize both themes at once, and the component picks the active set based on current theme.

```typescript
import { useControls, folder } from 'leva';

const controls = useControls('Globe', {
  Light: folder({
    lightSeaColor: { value: '#f8fafc', label: 'Sea' },
    // ... other light colors
  }, { collapsed: true }),
  Dark: folder({
    darkSeaColor: { value: '#0a0a0f', label: 'Sea' },
    // ... other dark colors
  }, { collapsed: true }),
  // Shared controls (apply to both themes)
  borderWidth: { value: 1, min: 0.5, max: 3, step: 0.5 },
});

// Pick active set based on current theme
const activeColors = useMemo(() => ({
  seaColor: theme === 'dark' ? controls.darkSeaColor : controls.lightSeaColor,
  // ... other active colors
  borderWidth: controls.borderWidth,
}), [theme, controls]);
```

**Benefits:**
- Both color sets always visible in Leva UI
- User can tweak dark mode while viewing light mode (or vice versa)
- No need for `set()` API or theme sync effects
- Shared controls (sizes, widths) apply to both themes

## Phase 1: Project Setup

### Task 1.1: Initialize Vite + React + TypeScript Project
```bash
npm create vite@latest onebrief-hero -- --template react-ts
cd onebrief-hero
npm install
```

**Task Context:**
- https://vite.dev/guide/

---

### Task 1.2: Install All Dependencies
```bash
# Core dependencies
npm install react-globe.gl three leva lucide-react

# Dev dependencies
npm install -D tailwindcss @tailwindcss/vite @types/three
```

---

### Task 1.3: Configure Tailwind CSS v4 with Dark Mode
**File: `vite.config.ts`**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**File: `src/index.css`**
```css
@import "tailwindcss";

@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

**Task Context:**
- https://tailwindcss.com/docs/installation/using-vite
- https://tailwindcss.com/docs/dark-mode

---

### Task 1.4: Create Design Tokens
**File: `src/styles/tokens.css`**

```css
:root {
  /* Typography */
  --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --text-hero: clamp(2.5rem, 5vw, 4rem);
  --text-subhead: clamp(1rem, 2vw, 1.25rem);
  --line-height-hero: 1.1;
  --hero-line-spacing: 12px;
  
  /* Light Mode Colors */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8f9fa;
  --color-text-primary: #0a0a0a;
  --color-text-secondary: #6b7280;
  --color-accent: #3b82f6;
}

[data-theme="dark"] {
  --color-bg-primary: #0a0a0f;
  --color-bg-secondary: #111118;
  --color-text-primary: #f8f9fa;
  --color-text-secondary: #9ca3af;
  --color-accent: #60a5fa;
}
```

Import in `src/index.css`:
```css
@import "./styles/tokens.css";
@import "tailwindcss";
/* ... */
```

---

### Task 1.5: Create Hooks
**File: `src/hooks/useTheme.ts`**
```typescript
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return { theme, setTheme, toggleTheme };
}
```

**File: `src/hooks/useWindowSize.ts`**
```typescript
import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
```

**File: `src/hooks/useDebouncedValue.ts`**
```typescript
import { useState, useEffect } from 'react';

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debounced;
}
```

---

### Task 1.6: Create Military Bases Data
**File: `src/data/militaryBases.ts`**

```typescript
export interface MilitaryBase {
  name: string;
  lat: number;
  lng: number;
  type: 'army' | 'navy' | 'airforce' | 'joint';
}

export const militaryBases: MilitaryBase[] = [
  { name: "Fort Cavazos", lat: 31.1349, lng: -97.7756, type: "army" },
  { name: "Fort Liberty", lat: 35.1390, lng: -79.0060, type: "army" },
  { name: "Camp Pendleton", lat: 33.3333, lng: -117.4167, type: "navy" },
  { name: "Pearl Harbor-Hickam", lat: 21.3469, lng: -157.9397, type: "joint" },
  { name: "Fort Bliss", lat: 31.8121, lng: -106.4225, type: "army" },
  { name: "Norfolk Naval Station", lat: 36.9466, lng: -76.3013, type: "navy" },
  { name: "Fort Stewart", lat: 31.8691, lng: -81.6095, type: "army" },
  { name: "Lackland AFB", lat: 29.3842, lng: -98.6187, type: "airforce" },
  { name: "Fort Riley", lat: 39.0553, lng: -96.7645, type: "army" },
  { name: "Nellis AFB", lat: 36.2360, lng: -115.0340, type: "airforce" },
  { name: "Eglin AFB", lat: 30.4833, lng: -86.5254, type: "airforce" },
  { name: "Camp Humphreys", lat: 36.9628, lng: 127.0311, type: "army" },
  { name: "Ramstein AB", lat: 49.4369, lng: 7.6003, type: "airforce" },
  { name: "Yokota AB", lat: 35.7485, lng: 139.3487, type: "airforce" },
  { name: "Naval Station Rota", lat: 36.6417, lng: -6.3500, type: "navy" }
];

export interface ShipmentArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  order: number;
  name: string;
}

export const shipmentArcs: ShipmentArc[] = [
  // Norfolk hub - Global projection (order 0-3)
  { startLat: 36.9466, startLng: -76.3013, endLat: 49.4369, endLng: 7.6003, arcAlt: 0.4, order: 0, name: "Norfolk → Ramstein" },
  { startLat: 36.9466, startLng: -76.3013, endLat: 36.6417, endLng: -6.3500, arcAlt: 0.3, order: 1, name: "Norfolk → Rota" },
  { startLat: 36.9466, startLng: -76.3013, endLat: 35.7485, endLng: 139.3487, arcAlt: 0.5, order: 2, name: "Norfolk → Yokota" },
  { startLat: 36.9466, startLng: -76.3013, endLat: 36.9628, endLng: 127.0311, arcAlt: 0.45, order: 3, name: "Norfolk → Humphreys" },
  // Fort Bliss CONUS hub (order 4-6)
  { startLat: 31.8121, startLng: -106.4225, endLat: 31.1349, endLng: -97.7756, arcAlt: 0.15, order: 4, name: "Bliss → Cavazos" },
  { startLat: 31.8121, startLng: -106.4225, endLat: 29.3842, endLng: -98.6187, arcAlt: 0.12, order: 5, name: "Bliss → Lackland" },
  { startLat: 31.8121, startLng: -106.4225, endLat: 39.0553, endLng: -96.7645, arcAlt: 0.2, order: 6, name: "Bliss → Riley" },
  // Pearl Harbor Pacific hub (order 7-8)
  { startLat: 21.3469, startLng: -157.9397, endLat: 35.7485, endLng: 139.3487, arcAlt: 0.35, order: 7, name: "Pearl → Yokota" },
  { startLat: 21.3469, startLng: -157.9397, endLat: 36.9628, endLng: 127.0311, arcAlt: 0.35, order: 8, name: "Pearl → Humphreys" },
];
```

---

### Task 1.7: Download GeoJSON
Download Natural Earth 110m countries GeoJSON to `public/geojson/countries.geojson`:
```bash
mkdir -p public/geojson
curl -o public/geojson/countries.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson
```

---

## Phase 2: Controls + Debug Tools

### Task 2.1: Create Controls Component
**File: `src/components/Controls.tsx`**

```typescript
import { Sun, Moon, Play, Pause, Bug } from 'lucide-react';
import { Leva } from 'leva';

interface ControlsProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  showDebug: boolean;
  onToggleDebug: () => void;
}

export function Controls({
  theme,
  onToggleTheme,
  isPaused,
  onTogglePause,
  showDebug,
  onToggleDebug,
}: ControlsProps) {
  return (
    <>
      {/* Control buttons - top center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg bg-white/10 backdrop-blur hover:bg-white/20 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          onClick={onTogglePause}
          className="p-2 rounded-lg bg-white/10 backdrop-blur hover:bg-white/20 transition-colors"
          aria-label="Toggle animation"
        >
          {isPaused ? <Play size={20} /> : <Pause size={20} />}
        </button>
        <button
          onClick={onToggleDebug}
          className="p-2 rounded-lg bg-white/10 backdrop-blur hover:bg-white/20 transition-colors"
          aria-label="Toggle debug"
        >
          <Bug size={20} />
        </button>
      </div>

      {/* Leva panel - top right, visible only in debug mode */}
      <Leva
        hidden={!showDebug}
        collapsed={false}
        oneLineLabels
        titleBar={{ title: 'Debug Controls' }}
        theme={{
          sizes: { rootWidth: '280px' }
        }}
      />
    </>
  );
}
```

---

### Task 2.2: Create Stats.js Debug Hook
**File: `src/hooks/useStats.ts`**

```typescript
import { useEffect, useRef } from 'react';
import Stats from 'three/examples/jsm/libs/stats.module.js';

export function useStats(enabled: boolean) {
  const statsRef = useRef<Stats | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (statsRef.current) {
        document.body.removeChild(statsRef.current.dom);
        statsRef.current = null;
      }
      return;
    }

    const stats = new Stats();
    stats.showPanel(0); // FPS
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '0';
    stats.dom.style.left = '0';
    document.body.appendChild(stats.dom);
    statsRef.current = stats;

    const animate = () => {
      stats.begin();
      stats.end();
      requestAnimationFrame(animate);
    };
    const frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      if (statsRef.current) {
        document.body.removeChild(statsRef.current.dom);
        statsRef.current = null;
      }
    };
  }, [enabled]);
}
```

---

### ✅ Phase 2 Verification
1. Create minimal `App.tsx` that renders Controls with state
2. **Confirm:** Clicking debug toggle shows/hides Leva panel (top-right)
3. **Confirm:** Clicking debug toggle shows/hides Stats.js FPS counter (top-left)
4. **Confirm:** Theme toggle changes `data-theme` attribute on document

```typescript
// Minimal App.tsx for Phase 2 verification
import { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { useStats } from './hooks/useStats';
import { Controls } from './components/Controls';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [isPaused, setIsPaused] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  useStats(showDebug);

  return (
    <div className="relative w-full h-screen bg-[var(--color-bg-primary)]">
      <Controls
        theme={theme}
        onToggleTheme={toggleTheme}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(p => !p)}
        showDebug={showDebug}
        onToggleDebug={() => setShowDebug(d => !d)}
      />
      <p className="text-[var(--color-text-primary)] p-8">
        Phase 2 Test - Theme: {theme}, Debug: {showDebug ? 'ON' : 'OFF'}
      </p>
    </div>
  );
}
```

---

## Phase 3: OnebriefHero (Minimal Shell)

### Task 3.1: Create OnebriefHero Component Shell
**File: `src/components/OnebriefHero.tsx`**

```typescript
import { useState, useMemo } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useWindowSize } from '../hooks/useWindowSize';
import { useStats } from '../hooks/useStats';
import { Controls } from './Controls';

interface OnebriefHeroProps {
  mainText?: string[];
  subText?: string;
  className?: string;
}

export function OnebriefHero({
  mainText = ["Command", "Operating", "System"],
  subText = "Unified operational intelligence",
  className = '',
}: OnebriefHeroProps) {
  const { theme, toggleTheme } = useTheme();
  const { width, height } = useWindowSize();
  const [isPaused, setIsPaused] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  useStats(showDebug);

  const isMobile = width < 768;

  // Globe offset (will be used in Phase 7)
  const globeOffset = useMemo((): [number, number] => {
    return isMobile 
      ? [0, height * 0.15]
      : [width * 0.25, 0];
  }, [isMobile, width, height]);

  return (
    <section
      className={`relative w-full h-screen overflow-hidden bg-[var(--color-bg-primary)] ${className}`}
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      onMouseLeave={() => setMousePos(null)}
    >
      {/* Placeholder for GlobeLayer (Phase 7) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center text-[var(--color-text-secondary)]">
        Globe placeholder
      </div>

      {/* Placeholder for VectorField (Phase 4) */}
      <div className="absolute inset-0 z-20 hidden md:flex items-center justify-center text-[var(--color-text-secondary)]">
        VectorField placeholder
      </div>

      {/* Placeholder for HeroContent (Phase 5) */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-30 px-6 md:px-12 lg:px-16 text-[var(--color-text-primary)]">
        HeroContent placeholder
      </div>

      {/* Controls */}
      <Controls
        theme={theme}
        onToggleTheme={toggleTheme}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(p => !p)}
        showDebug={showDebug}
        onToggleDebug={() => setShowDebug(d => !d)}
      />
    </section>
  );
}
```

---

### Task 3.2: Update App.tsx
```typescript
import { OnebriefHero } from './components/OnebriefHero';

export default function App() {
  return <OnebriefHero />;
}
```

---

### ✅ Phase 3 Verification
1. **Confirm:** Component renders with placeholders visible
2. **Confirm:** Controls (theme, pause, debug) all work correctly
3. **Confirm:** Background color changes with theme toggle
4. **Confirm:** VectorField placeholder hidden on mobile (< 768px)

---

## Phase 4: VectorField

### Task 4.1: Create VectorField Component
**File: `src/components/VectorField.tsx`**

```typescript
import { useMemo } from 'react';
import { useControls, folder } from 'leva';

interface VectorFieldProps {
  mousePos: { x: number; y: number } | null;
  theme: 'light' | 'dark';
  className?: string;
}

export function VectorField({ mousePos, theme, className = '' }: VectorFieldProps) {
  // Leva controls - both Light and Dark theme colors visible
  const controls = useControls('Vectors', {
    Light: folder({
      lightVectorColor: { value: '#d1d5db', label: 'Color' },
    }, { collapsed: true }),
    Dark: folder({
      darkVectorColor: { value: '#374151', label: 'Color' },
    }, { collapsed: true }),
    lineLength: { value: 40, min: 20, max: 80, step: 5, label: 'Line Length' },
    spacing: { value: 60, min: 40, max: 100, step: 10, label: 'Spacing' },
  });

  // Pick active color based on current theme
  const color = theme === 'dark' ? controls.darkVectorColor : controls.lightVectorColor;
  const { lineLength, spacing } = controls;

  // Generate grid of vector positions
  const vectors = useMemo(() => {
    const result: { x: number; y: number }[] = [];
    const cols = Math.ceil(window.innerWidth / spacing) + 1;
    const rows = Math.ceil(window.innerHeight / spacing) + 1;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        result.push({
          x: col * spacing,
          y: row * spacing,
        });
      }
    }
    return result;
  }, [spacing]);

  // Calculate angle for each vector pointing toward mouse (or default right)
  const getAngle = (vx: number, vy: number): number => {
    if (!mousePos) {
      // Default: point toward right side of screen (globe area)
      return 0;
    }
    // All vectors point uniformly toward mouse position
    return Math.atan2(mousePos.y - vy, mousePos.x - vx) * (180 / Math.PI);
  };

  return (
    <svg
      className={`pointer-events-none ${className}`}
      width="100%"
      height="100%"
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {vectors.map((v, i) => {
        const angle = getAngle(v.x, v.y);
        return (
          <line
            key={i}
            x1={v.x}
            y1={v.y}
            x2={v.x + lineLength}
            y2={v.y}
            stroke={color}
            strokeWidth={1}
            strokeLinecap="round"
            transform={`rotate(${angle}, ${v.x}, ${v.y})`}
          />
        );
      })}
    </svg>
  );
}
```

---

### Task 4.2: Update OnebriefHero with VectorField
Replace the VectorField placeholder in `OnebriefHero.tsx`:

```typescript
import { VectorField } from './VectorField';

// ... inside the component, replace placeholder:
{/* VectorField - hidden on mobile */}
<VectorField
  mousePos={mousePos}
  theme={theme}
  className="absolute inset-0 z-20 hidden md:block"
/>
```

---

### ✅ Phase 4 Verification
1. **Confirm:** Vector field renders with lines pointing right by default
2. **Confirm:** Moving mouse causes ALL vectors to orient toward cursor uniformly
3. **Confirm:** Leva controls (color, lineLength, spacing) update vectors in real-time
4. **Confirm:** Vector field is NOT visible on mobile (resize to < 768px)
5. **Confirm:** Color updates when theme toggles (via Leva initial values)

---

## Phase 5: HeroContent

### Task 5.1: Create HeroContent Component
**File: `src/components/HeroContent.tsx`**

```typescript
interface HeroContentProps {
  lines: string[];
  subtext: string;
  className?: string;
}

export function HeroContent({ lines, subtext, className = '' }: HeroContentProps) {
  return (
    <div className={`relative max-w-2xl ${className}`}>
      {/* Radial gradient backdrop for text legibility */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(
            ellipse 80% 70% at 0% 50%,
            var(--color-bg-primary) 0%,
            color-mix(in srgb, var(--color-bg-primary) 80%, transparent) 50%,
            transparent 100%
          )`,
          transform: 'scale(1.5)',
          transformOrigin: 'left center',
        }}
      />

      {/* Hero text */}
      <h1
        className="font-sans font-bold text-[var(--color-text-primary)]"
        style={{
          fontSize: 'var(--text-hero)',
          lineHeight: 'var(--line-height-hero)',
        }}
      >
        {lines.map((line, i) => (
          <span
            key={i}
            className="block"
            style={{ marginBottom: i < lines.length - 1 ? 'var(--hero-line-spacing)' : 0 }}
          >
            {line}
          </span>
        ))}
      </h1>

      <p
        className="mt-6 text-[var(--color-text-secondary)] max-w-md"
        style={{ fontSize: 'var(--text-subhead)' }}
      >
        {subtext}
      </p>
    </div>
  );
}
```

---

### Task 5.2: Update OnebriefHero with HeroContent
Replace the HeroContent placeholder in `OnebriefHero.tsx`:

```typescript
import { HeroContent } from './HeroContent';

// ... inside the component, replace placeholder:
{/* Hero content - left aligned overlay */}
<HeroContent
  lines={mainText}
  subtext={subText}
  className="absolute left-0 top-1/2 -translate-y-1/2 z-30 px-6 md:px-12 lg:px-16"
/>
```

---

### ✅ Phase 5 Verification
1. **Confirm:** Hero text renders with correct typography
2. **Confirm:** Text color changes with theme toggle (light = dark text, dark = light text)
3. **Confirm:** Radial gradient backdrop visible (fades from solid to transparent)
4. **Confirm:** Text size responsive (smaller on mobile via clamp)
5. **Confirm:** Text positioned left, vertically centered

---

## Phase 6: Globe Texture Generator

### Task 6.1: Create Texture Generator Utility
**File: `src/utils/generateGlobeTexture.ts`**

```typescript
import { MilitaryBase } from '../data/militaryBases';

export interface GlobeTextureOptions {
  width?: number;
  height?: number;
  seaColor: string;
  landColor: string;
  borderColor: string;
  borderWidth?: number;
  pointColor: string;
  pointRadius?: number;
}

export function generateGlobeTexture(
  geojson: GeoJSON.FeatureCollection,
  bases: MilitaryBase[],
  options: GlobeTextureOptions
): string {
  const {
    width = 4096,
    height = 2048,
    seaColor,
    landColor,
    borderColor,
    borderWidth = 1,
    pointColor,
    pointRadius = 6,
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Fill sea/ocean background
  ctx.fillStyle = seaColor;
  ctx.fillRect(0, 0, width, height);

  // 2. Draw countries (land + borders)
  ctx.fillStyle = landColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;

  for (const feature of geojson.features) {
    drawFeature(ctx, feature.geometry as GeoJSON.Geometry, width, height);
  }

  // 3. Draw military base points on top
  ctx.fillStyle = pointColor;
  for (const base of bases) {
    const [x, y] = lngLatToXY(base.lng, base.lat, width, height);
    ctx.beginPath();
    ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas.toDataURL('image/png');
}

function lngLatToXY(lng: number, lat: number, width: number, height: number): [number, number] {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}

function drawFeature(ctx: CanvasRenderingContext2D, geometry: GeoJSON.Geometry, w: number, h: number) {
  if (geometry.type === 'Polygon') {
    drawPolygon(ctx, geometry.coordinates as number[][][], w, h);
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates as number[][][][]) {
      drawPolygon(ctx, polygon, w, h);
    }
  }
}

function drawPolygon(ctx: CanvasRenderingContext2D, rings: number[][][], w: number, h: number) {
  ctx.beginPath();
  for (const ring of rings) {
    const [startX, startY] = lngLatToXY(ring[0][0], ring[0][1], w, h);
    ctx.moveTo(startX, startY);
    for (let i = 1; i < ring.length; i++) {
      const [x, y] = lngLatToXY(ring[i][0], ring[i][1], w, h);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
  ctx.fill();
  ctx.stroke();
}
```

---

### ✅ Phase 6 Verification
Create a test component to verify texture generation:

```typescript
// Temporary test in App.tsx
import { useEffect, useState } from 'react';
import { generateGlobeTexture } from './utils/generateGlobeTexture';
import { militaryBases } from './data/militaryBases';

export default function App() {
  const [textureUrl, setTextureUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/geojson/countries.geojson')
      .then(r => r.json())
      .then(geojson => {
        const url = generateGlobeTexture(geojson, militaryBases, {
          seaColor: '#0a0a0f',
          landColor: '#1e293b',
          borderColor: '#334155',
          pointColor: '#93c5fd',
          pointRadius: 8,
        });
        setTextureUrl(url);
      });
  }, []);

  return (
    <div className="p-8">
      <h1>Texture Test</h1>
      {textureUrl && (
        <img 
          src={textureUrl} 
          alt="Globe texture" 
          style={{ width: '100%', maxWidth: 800, border: '1px solid white' }}
        />
      )}
    </div>
  );
}
```

1. **Confirm:** Texture image renders as equirectangular projection
2. **Confirm:** Country borders visible with correct colors
3. **Confirm:** Military base points appear at correct geographic locations
4. **Confirm:** Points are visually distinguishable (check Norfolk, Pearl Harbor, overseas bases)

---

## Phase 7: GlobeLayer (Textured Globe)

### Task 7.1: Create GlobeLayer Component (Texture Only)
**File: `src/components/GlobeLayer.tsx`**

```typescript
import { useEffect, useState, useRef, forwardRef, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { useControls, folder } from 'leva';
import { generateGlobeTexture } from '../utils/generateGlobeTexture';
import { militaryBases } from '../data/militaryBases';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import * as THREE from 'three';

interface GlobeLayerProps {
  theme: 'light' | 'dark';
  isPaused: boolean;
  globeOffset: [number, number];
  className?: string;
}

export const GlobeLayer = forwardRef<GlobeMethods, GlobeLayerProps>(
  ({ theme, isPaused, globeOffset, className = '' }, ref) => {
    const localRef = useRef<GlobeMethods>(null);
    const globeRef = (ref as React.RefObject<GlobeMethods>) || localRef;

    // Leva controls - both Light and Dark theme colors visible simultaneously
    const controls = useControls('Globe', {
      Light: folder({
        lightSeaColor: { value: '#f8fafc', label: 'Sea' },
        lightLandColor: { value: '#e2e8f0', label: 'Land' },
        lightBorderColor: { value: '#94a3b8', label: 'Borders' },
        lightPointColor: { value: '#3b82f6', label: 'Base Points' },
        lightArcColor: { value: '#3b82f6', label: 'Arcs' },
        lightRingColor: { value: '#60a5fa', label: 'Rings' },
      }, { collapsed: true }),
      Dark: folder({
        darkSeaColor: { value: '#0a0a0f', label: 'Sea' },
        darkLandColor: { value: '#1e293b', label: 'Land' },
        darkBorderColor: { value: '#334155', label: 'Borders' },
        darkPointColor: { value: '#93c5fd', label: 'Base Points' },
        darkArcColor: { value: '#9cff00', label: 'Arcs' },
        darkRingColor: { value: '#93c5fd', label: 'Rings' },
      }, { collapsed: true }),
      // Shared controls (apply to both themes)
      borderWidth: { value: 1, min: 0.5, max: 3, step: 0.5, label: 'Border Width' },
      pointRadius: { value: 6, min: 2, max: 12, step: 1, label: 'Base Point Size' },
      ringMaxRadius: { value: 3, min: 1, max: 8, step: 0.5, label: 'Ring Max Radius' },
    });

    // Pick active color set based on current theme
    const activeColors = useMemo(() => ({
      seaColor: theme === 'dark' ? controls.darkSeaColor : controls.lightSeaColor,
      landColor: theme === 'dark' ? controls.darkLandColor : controls.lightLandColor,
      borderColor: theme === 'dark' ? controls.darkBorderColor : controls.lightBorderColor,
      pointColor: theme === 'dark' ? controls.darkPointColor : controls.lightPointColor,
      arcColor: theme === 'dark' ? controls.darkArcColor : controls.lightArcColor,
      ringColor: theme === 'dark' ? controls.darkRingColor : controls.lightRingColor,
      borderWidth: controls.borderWidth,
      pointRadius: controls.pointRadius,
      ringMaxRadius: controls.ringMaxRadius,
    }), [theme, controls]);

    // Debounce colors to prevent rapid texture regeneration
    const debouncedColors = useDebouncedValue(activeColors, 100);

    // State for texture and geojson
    const [textureUrl, setTextureUrl] = useState<string | null>(null);
    const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection | null>(null);

    // Load GeoJSON once
    useEffect(() => {
      fetch('/geojson/countries.geojson')
        .then(r => r.json())
        .then(setGeojson);
    }, []);

    // Generate texture when geojson loads or colors change
    useEffect(() => {
      if (!geojson) return;

      const url = generateGlobeTexture(geojson, militaryBases, {
        seaColor: debouncedColors.seaColor,
        landColor: debouncedColors.landColor,
        borderColor: debouncedColors.borderColor,
        borderWidth: debouncedColors.borderWidth,
        pointColor: debouncedColors.pointColor,
        pointRadius: debouncedColors.pointRadius,
      });
      setTextureUrl(url);
    }, [geojson, debouncedColors]);

    // Handle pause/resume animation
    useEffect(() => {
      if (!globeRef.current) return;
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = !isPaused;
      }
    }, [isPaused, globeRef]);

    // Custom globe material (no lighting response)
    const globeMaterial = new THREE.MeshBasicMaterial();

    if (!textureUrl) {
      return <div className={className}>Loading globe...</div>;
    }

    return (
      <div className={className}>
        <Globe
          ref={globeRef}
          globeImageUrl={textureUrl}
          globeMaterial={globeMaterial}
          globeOffset={globeOffset}
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere={false}
          animateIn={false}
        />
      </div>
    );
  }
);

GlobeLayer.displayName = 'GlobeLayer';
```

---

### Task 7.2: Update OnebriefHero with GlobeLayer
Replace the Globe placeholder:

```typescript
import { GlobeLayer } from './GlobeLayer';

// ... inside the component, replace placeholder:
{/* Globe - fills viewport, offset via prop */}
<GlobeLayer
  theme={theme}
  isPaused={isPaused}
  globeOffset={globeOffset}
  className="absolute inset-0 z-10"
/>
```

---

### ✅ Phase 7 Verification
1. **Confirm:** Globe renders with dynamically generated texture
2. **Confirm:** Globe auto-rotates when not paused
3. **Confirm:** Pause button stops/starts rotation
4. **Confirm:** Leva color controls update texture in real-time (with debounce)
5. **Confirm:** Theme toggle updates all globe colors via Leva sync
6. **Confirm:** Globe is offset (right on desktop, down on mobile)
7. **Confirm:** Military base points visible on globe surface

---

## Phase 8: GlobeLayer (Arc Animation)

### Task 8.1: Add Arc Paths to GlobeLayer
Update `GlobeLayer.tsx` to include arc animation:

```typescript
import { shipmentArcs } from '../data/militaryBases';

// Inside the Globe component, add arc props:
<Globe
  ref={globeRef}
  globeImageUrl={textureUrl}
  globeMaterial={globeMaterial}
  globeOffset={globeOffset}
  backgroundColor="rgba(0,0,0,0)"
  showAtmosphere={false}
  animateIn={false}
  
  // Arc layer - GitHub globe style
  arcsData={shipmentArcs}
  arcStartLat="startLat"
  arcStartLng="startLng"
  arcEndLat="endLat"
  arcEndLng="endLng"
  arcColor={() => debouncedColors.arcColor}
  arcAltitude="arcAlt"
  arcStroke={0.5}
  arcDashLength={0.9}
  arcDashGap={4}
  arcDashAnimateTime={1000}
  arcDashInitialGap={(d: ShipmentArc) => d.order * 1}
  arcsTransitionDuration={0}
/>
```

---

### ✅ Phase 8 Verification
1. **Confirm:** Arc paths render between military bases
2. **Confirm:** Arcs animate with traveling "pulse" effect (GitHub globe style)
3. **Confirm:** Arcs fire in staggered sequence (Norfolk first, then Bliss, then Pearl Harbor)
4. **Confirm:** Arc color updates via Leva control
5. **Confirm:** Arc color changes with theme toggle

---

## Phase 9: GlobeLayer (Rings Animation)

### Task 9.1: Add Rings Layer to GlobeLayer
Update `GlobeLayer.tsx` to include emanating rings:

```typescript
// Create rings data from military bases (uses Leva-controlled maxR)
const ringsData = useMemo(() => 
  militaryBases.map(base => ({
    lat: base.lat,
    lng: base.lng,
    maxR: debouncedColors.ringMaxRadius,  // Leva-controlled
    propagationSpeed: 2,
    repeatPeriod: 1200,
  })),
  [debouncedColors.ringMaxRadius]
);

// Inside the Globe component, add ring props:
<Globe
  // ... existing props
  
  // Rings layer - emanating pulses from bases
  ringsData={ringsData}
  ringLat="lat"
  ringLng="lng"
  ringMaxRadius="maxR"
  ringPropagationSpeed="propagationSpeed"
  ringRepeatPeriod="repeatPeriod"
  ringColor={() => (t: number) => {
    // Fade out as ring expands
    const rgb = debouncedColors.ringColor;
    // Convert hex to rgba with fading opacity
    const r = parseInt(rgb.slice(1, 3), 16);
    const g = parseInt(rgb.slice(3, 5), 16);
    const b = parseInt(rgb.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${1 - t})`;
  }}
/>
```

---

### ✅ Phase 9 Verification
1. **Confirm:** Rings emanate from each military base location
2. **Confirm:** Multiple rings visible per base (repeat period creates ~3 ring effect)
3. **Confirm:** Rings fade out as they expand
4. **Confirm:** Ring color updates via Leva control
5. **Confirm:** Ring color changes with theme toggle

---

## Final Verification Checklist

After completing all phases:

- [ ] **Controls:** Theme toggle, pause/play, debug toggle all functional
- [ ] **Debug mode:** Leva panel (top-right) + Stats.js (top-left) appear when enabled
- [ ] **VectorField:** Renders on desktop, hidden on mobile, vectors follow mouse
- [ ] **HeroContent:** Responsive text, theme-aware colors, gradient backdrop
- [ ] **Globe texture:** Dynamic generation with countries + base points
- [ ] **Globe rendering:** Offset positioning, auto-rotation, pause control
- [ ] **Arcs:** Staggered animation, theme-responsive colors
- [ ] **Rings:** Emanating pulses, fade-out effect, theme-responsive colors
- [ ] **Leva integration:** All color controls update visuals in real-time
- [ ] **Theme sync:** Toggling theme resets all Leva values to theme defaults
- [ ] **Performance:** Smooth animation, debounced texture regeneration

## File Structure

```
onebrief-hero/
├── src/
│   ├── components/
│   │   ├── OnebriefHero.tsx
│   │   ├── GlobeLayer.tsx
│   │   ├── VectorField.tsx
│   │   ├── HeroContent.tsx
│   │   └── Controls.tsx
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   ├── useWindowSize.ts
│   │   └── useDebouncedValue.ts
│   ├── utils/
│   │   └── generateGlobeTexture.ts
│   ├── data/
│   │   └── militaryBases.ts
│   ├── styles/
│   │   ├── tokens.css
│   │   └── index.css
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── geojson/
│       └── countries.geojson
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Dependencies Summary

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-globe.gl": "^2.37.0",
    "three": "^0.160.0",
    "leva": "^0.9.x",
    "lucide-react": "^0.460.0"
  },
  "devDependencies": {
    "@types/react": "^18.x",
    "@types/three": "^0.160.0",
    "@vitejs/plugin-react": "^4.x",
    "tailwindcss": "^4.x",
    "@tailwindcss/vite": "^4.x",
    "typescript": "^5.x",
    "vite": "^5.x"
  }
}
```

---

## Revision Log

| Date | Change | Author |
|------|--------|--------|
| 2024-12-09 | Initial plan creation | Claude + Dan |
| 2024-12-09 | Resolved all design decisions: arc animation (traveling dash), vector field (uniform mouse tracking), responsive layout (2-col desktop, stacked mobile), Leva top-right | Claude + Dan |
| 2024-12-09 | Added Points Layer configuration for rendering military base markers on globe | Claude + Dan |
| 2024-12-09 | Added GitHub globe-style arc animation with staggered timing via `arcDashInitialGap` and `order` property | Claude + Dan |
| 2024-12-09 | Flattened component file structure - removed unnecessary barrel files (index.ts) | Claude + Dan |
| 2024-12-09 | Replaced static texture approach with dynamic canvas-generated equirectangular projection. Texture regenerates reactively from Leva color controls with debouncing. Added `generateGlobeTexture` utility and `useDebouncedValue` hook. | Claude + Dan |
| 2024-12-09 | Replaced CSS grid layout with `globeOffset` prop approach. Globe fills viewport and is offset in pixels. Added `useWindowSize` hook for responsive offset calculations. | Claude + Dan |
| 2024-12-09 | Baked military base points directly into generated texture. Removed `pointsData` layer — points are now drawn via Canvas 2D during texture generation. Added `pointRadius` to Leva controls. | Claude + Dan |
| 2024-12-09 | Restructured Leva controls with dual Light/Dark folders. Both theme color sets visible simultaneously in UI. User customizes both themes, component picks active set based on current theme. Added `ringMaxRadius` control. Removed need for `set()` API and theme sync effects. | Claude + Dan |

---

## Resolved Design Decisions

- [x] **Globe texture**: Dynamic canvas-generated from Natural Earth 110m GeoJSON with military base points baked in (single texture = better performance than polygon + points layers)
- [x] **Arc animation**: GitHub globe-style staggered pulses
  - `arcDashLength={0.9}` / `arcDashGap={4}` / `arcDashAnimateTime={1000}`
  - `arcDashInitialGap={(e) => e.order * 1}` for staggered timing
- [x] **Vector field**: All vectors uniformly orient toward mouse position (no distance falloff)
- [x] **Responsive layout via `globeOffset`**: 
  - Desktop: Globe offset right 25% of viewport width (`[width * 0.25, 0]`)
  - Mobile: Globe offset down 15% of viewport height (`[0, height * 0.15]`)
  - Vector field hidden on mobile
- [x] **Leva panel**: Top-right corner, visible only in debug mode
- [x] **Texture generation**: Reactive to Leva color controls with 100ms debounce
- [x] **3D layers**: Only arcs and rings remain as Three.js geometry (they animate); points baked into texture
