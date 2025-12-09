import { Moon, Sun, Play, Pause } from "lucide-react";
import type { Theme } from "../types";

interface ControlsProps {
  theme: Theme;
  onThemeToggle: () => void;
  motionEnabled: boolean;
  onMotionToggle: () => void;
  showDebugger: boolean;
  onShowDebuggerToggle: () => void;
  showDebuggerToggle?: boolean;
}

export function Controls({
  theme,
  onThemeToggle,
  motionEnabled,
  onMotionToggle,
  showDebugger,
  onShowDebuggerToggle,
  showDebuggerToggle = true,
}: ControlsProps) {
  return (
    <div
      className="absolute top-2.5 left-1/2 -translate-x-1/2 pointer-events-auto"
      style={{ zIndex: "var(--z-navigation)" }}
    >
      {/* White control bar with depth */}
      <div
        className="bg-white rounded-2xl px-4 py-2 flex items-center gap-4 shadow-lg"
        style={{
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          borderRadius: "16px",
        }}
      >
        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="w-12 h-12 rounded-full hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-gray-800" />
          ) : (
            <Moon className="w-5 h-5 text-gray-800" />
          )}
        </button>

        {/* Motion Toggle */}
        <button
          onClick={onMotionToggle}
          className="w-12 h-12 rounded-full hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label={motionEnabled ? "Pause motion" : "Play motion"}
        >
          {motionEnabled ? (
            <Pause className="w-5 h-5 text-gray-800" />
          ) : (
            <Play className="w-5 h-5 text-gray-800" />
          )}
        </button>

        {/* Debugger Toggle - only show if enabled */}
        {showDebuggerToggle && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showDebugger}
              onChange={onShowDebuggerToggle}
              className="w-4 h-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-gray-300 cursor-pointer"
            />
            <span className="text-xs text-gray-700 font-medium">
              Show Debugger
            </span>
          </label>
        )}
      </div>
    </div>
  );
}
