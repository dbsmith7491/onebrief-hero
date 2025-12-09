import { useState } from "react";
import { HeroContent } from "./HeroContent";
import { Controls } from "./Controls";
import { Scene } from "./Scene";
import { VectorField } from "./VectorField";
import { useTheme } from "../hooks/useTheme";
import { useReducedMotion } from "../hooks/useReducedMotion";

export interface OnebriefHeroProps {
  /**
   * Title text displayed on the hero section
   * Can be an array of strings, each rendered on a new line
   */
  title?: string[];
  /**
   * Subtitle text displayed below the title
   */
  subtitle?: string;
  /**
   * Initial theme (defaults to "dark")
   */
  initialTheme?: "dark" | "light";
  /**
   * Whether motion is enabled by default (defaults to true)
   */
  initialMotionEnabled?: boolean;
  /**
   * Whether to show debug controls (defaults to false)
   */
  showDebugControls?: boolean;
  /**
   * Custom className for the wrapper
   */
  className?: string;
}

/**
 * Drop-in hero component with 3D globe, vector field, and controls
 *
 * @example
 * ```tsx
 * <OnebriefHero
 *   title={["Prepare", "Globally."]}
 *   subtitle="See how the Onebrief platform can empower your military logistics planning in hours, not weeks."
 * />
 * ```
 */
export function OnebriefHero({
  title = ["Prepare", "Globally."],
  subtitle = "See how the Onebrief platform can empower your military logistics planning in hours, not weeks.",
  initialTheme = "dark",
  initialMotionEnabled = true,
  showDebugControls = false,
  className = "",
}: OnebriefHeroProps) {
  const { theme, toggleTheme } = useTheme(initialTheme);
  const { motionEnabled, toggleMotion } =
    useReducedMotion(initialMotionEnabled);
  const [showDebugger, setShowDebugger] = useState(false);

  const bgColor = theme === "dark" ? "#030303" : "#fffffa";

  return (
    <div className={`min-h-screen bg-surface-primary ${className}`}>
      <section
        className="relative w-full overflow-hidden"
        style={{ height: "var(--hero-height)", backgroundColor: bgColor }}
      >
        {/* Vector field background */}
        <VectorField theme={theme} />

        {/* 3D Canvas */}
        <Scene
          motionEnabled={motionEnabled}
          theme={theme}
          showDebugger={showDebugger}
        />

        {/* Content Overlay */}
        <HeroContent title={title} subtitle={subtitle} theme={theme} />

        {/* Controls */}
        <Controls
          theme={theme}
          onThemeToggle={toggleTheme}
          motionEnabled={motionEnabled}
          onMotionToggle={toggleMotion}
          showDebugger={showDebugger}
          onShowDebuggerToggle={() => setShowDebugger(!showDebugger)}
          showDebuggerToggle={showDebugControls}
        />
      </section>
    </div>
  );
}
