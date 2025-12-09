import { useEffect } from "react";

/**
 * Hook to show/hide Leva controls panel based on debugger state
 */
export function useLevaVisibility(showDebugger: boolean) {
  useEffect(() => {
    const findAndToggleLeva = (): HTMLElement | null => {
      // Method 1: Find by content (most reliable) - look for the root container
      const allDivs = document.querySelectorAll("div");
      for (const div of allDivs) {
        const style = window.getComputedStyle(div);
        if (
          style.position === "fixed" &&
          (div.textContent?.includes("Globe Colors") ||
            div.textContent?.includes("Motion Colors") ||
            div.textContent?.includes("Globe Outline") ||
            div.textContent?.includes("Vector Field"))
        ) {
          return div as HTMLElement;
        }
      }

      // Method 2: Look for Leva-specific classes (fallback)
      const levaByClass = document.querySelector(
        'body > div[class*="leva"]'
      ) as HTMLElement;
      if (levaByClass) {
        return levaByClass;
      }

      // Method 3: Look for fixed position divs on the left side
      const fixedDivs = document.querySelectorAll(
        'div[style*="position: fixed"]'
      );
      for (const div of fixedDivs) {
        const rect = div.getBoundingClientRect();
        // Leva panel is usually on the left side and has a certain width
        if (rect.left < 300 && rect.width > 200 && rect.height > 100) {
          return div as HTMLElement;
        }
      }

      return null;
    };

    const updateLevaVisibility = (levaPanel: HTMLElement) => {
      if (showDebugger) {
        levaPanel.style.setProperty("visibility", "visible", "important");
        levaPanel.style.setProperty("opacity", "1", "important");
        levaPanel.style.setProperty("pointer-events", "auto", "important");
        levaPanel.setAttribute("data-leva-visible", "true");
      } else {
        levaPanel.style.setProperty("visibility", "hidden", "important");
        levaPanel.style.setProperty("opacity", "0", "important");
        levaPanel.style.setProperty("pointer-events", "none", "important");
        levaPanel.removeAttribute("data-leva-visible");
      }
    };

    // Try immediately
    let levaPanel = findAndToggleLeva();
    if (levaPanel) {
      updateLevaVisibility(levaPanel);
    }

    // Poll until found, then stop
    const checkInterval = setInterval(() => {
      if (!levaPanel) {
        levaPanel = findAndToggleLeva();
        if (levaPanel) {
          updateLevaVisibility(levaPanel);
          clearInterval(checkInterval);
        }
      } else {
        // Update visibility if already found (in case it was recreated)
        updateLevaVisibility(levaPanel);
      }
    }, 100);

    // Also check periodically in case Leva recreates the element
    const syncInterval = setInterval(() => {
      const currentPanel = findAndToggleLeva();
      if (currentPanel && currentPanel !== levaPanel) {
        levaPanel = currentPanel;
        updateLevaVisibility(levaPanel);
      } else if (levaPanel) {
        updateLevaVisibility(levaPanel);
      }
    }, 1000); // Less frequent sync check

    return () => {
      clearInterval(checkInterval);
      clearInterval(syncInterval);
    };
  }, [showDebugger]);
}
