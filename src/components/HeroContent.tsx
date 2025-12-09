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
      {/* Gradient layer - between vector field (z:0) and globe (z:2) */}
      <div
        className="hidden md:flex absolute inset-0 pointer-events-none h-full flex-col justify-center px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-20"
        style={{ zIndex: 1 }}
      >
        <div
          className="py-24 pr-20 -ml-4 md:-ml-8 lg:-ml-12 xl:-ml-16 2xl:-ml-20 p-4 md:p-8 lg:p-12 xl:p-16 2xl:p-20 w-fit"
          style={{ background: gradientBg }}
        >
          {/* Invisible content to size the gradient */}
          <div className="invisible">
            <h1 className="text-hero font-regular mb-20 text-left">
              {titleElements}
            </h1>
            {subtitle && (
              <p className="text-sm font-light max-w-xs text-left">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Text content layer - above globe */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 3 }}
      >
        <div className="container mx-auto h-full px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          {/* Mobile: Vertically centered, no gradient */}
          <div className="md:hidden h-full flex flex-col justify-center text-center">
            <h1
              className="text-hero font-regular mb-16"
              style={{ color: colors.title }}
            >
              {titleElementsInline}
            </h1>
            {subtitle && (
              <p
                className="text-sm font-light max-w-xs mx-auto"
                style={{ color: colors.subtitle }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Desktop: Left-aligned, vertically centered */}
          <div className="hidden md:flex h-full flex-col justify-center">
            <div className="py-24 pr-20 -ml-4 md:-ml-8 lg:-ml-12 xl:-ml-16 2xl:-ml-20 p-4 md:p-8 lg:p-12 xl:p-16 2xl:p-20 w-fit">
              <h1
                className="text-hero font-regular mb-20 text-left"
                style={{ color: colors.title }}
              >
                {titleElements}
              </h1>
              {subtitle && (
                <p
                  className="text-sm font-light max-w-xs text-left"
                  style={{ color: colors.subtitle }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
