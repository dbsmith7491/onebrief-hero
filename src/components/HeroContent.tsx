import { useMemo } from "react";
import type { Theme } from "../types";

interface HeroContentProps {
  title: string[]; // Array of words, each on its own line
  subtitle?: string;
  theme?: Theme;
}

export function HeroContent({
  title,
  subtitle,
  theme = "dark",
}: HeroContentProps) {
  // Memoize color values
  const colors = useMemo(
    () => ({
      title: theme === "dark" ? "#fffffa" : "#191919",
      subtitle: theme === "dark" ? "#ffffff" : "#33414b",
      gradient: theme === "dark" ? "3, 3, 3" : "255, 255, 250",
    }),
    [theme]
  );

  const gradientBg = useMemo(
    () =>
      `radial-gradient(ellipse at center, rgba(${colors.gradient}, 0.95) 50%, rgba(${colors.gradient}, 0) 100%)`,
    [colors.gradient]
  );

  // Memoize title rendering
  const titleElements = useMemo(
    () =>
      title.map((word, i) => (
        <span key={i} className="block">
          {word}
        </span>
      )),
    [title]
  );

  const titleElementsInline = useMemo(
    () =>
      title.map((word, i) => (
        <span key={i} className="inline-block">
          {word}
        </span>
      )),
    [title]
  );

  return (
    <>
      {/* Text content layer - above globe */}
      <div className="relative h-full pointer-events-none">
        <div className="h-full relative px-5 md:px-20 lg:px-16 max-w-screen-xl mx-auto">
          <div className="relative h-full flex flex-col justify-center">
            <div className="relative w-fit mx-auto md:mx-0">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: gradientBg, zIndex: 1 }}
              />
              <div
                className="relative flex flex-col align-start gap-4 md:gap-5"
                style={{ zIndex: 3 }}
              >
                <h1
                  className="text-hero font-regular"
                  style={{ color: colors.title }}
                >
                  {/* Mobile: inline-block, Desktop: block */}
                  {title.map((word, i) => (
                    <span key={i} className="block">
                      {word}
                    </span>
                  ))}
                </h1>
                {subtitle && (
                  <p
                    className="text-sm font-light max-w-xs mx-auto md:mx-0 text-left"
                    style={{ color: colors.subtitle }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
