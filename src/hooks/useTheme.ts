import { useState, useEffect } from "react";
import type { Theme } from "../types";

export function useTheme(initialTheme: Theme = "dark") {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    // Apply theme to document root
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return { theme, toggleTheme, setTheme };
}
