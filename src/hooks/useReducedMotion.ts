import { useState, useEffect } from "react";

export function useReducedMotion(initialMotionEnabled?: boolean) {
  // Check OS preference (with SSR safety)
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // Use provided initial value, or default to OS preference
  const [motionEnabled, setMotionEnabled] = useState(
    initialMotionEnabled !== undefined
      ? initialMotionEnabled
      : !prefersReducedMotion
  );

  useEffect(() => {
    // Listen for OS preference changes
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (e: MediaQueryListEvent) => {
      setMotionEnabled(!e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleMotion = () => {
    setMotionEnabled((prev) => !prev);
  };

  return { motionEnabled, toggleMotion, setMotionEnabled };
}
