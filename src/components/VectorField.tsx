import { useEffect, useRef, useState } from "react";
import { useControls, folder } from "leva";
import { hexToRgba } from "../utils/colorUtils";
import type { Theme } from "../types";

interface VectorFieldProps {
  theme: Theme;
}

interface Vector {
  x: number;
  y: number;
  angle: number;
}

export function VectorField({ theme }: VectorFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [vectors, setVectors] = useState<Vector[]>([]);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const vectorsRef = useRef<Vector[]>([]);
  const frameCountRef = useRef(0);

  // Leva controls for vector field colors
  const vectorColors = useControls("Vector Field", {
    dark: folder({
      darkVectorColor: { value: "#ffffff", label: "Color" },
      darkVectorOpacity: {
        value: 0.12,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Opacity",
      },
    }),
    light: folder({
      lightVectorColor: { value: "#191919", label: "Color" },
      lightVectorOpacity: {
        value: 0.3,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Opacity",
      },
    }),
  });

  // Generate grid of vectors (full screen - globe will occlude)
  useEffect(() => {
    const spacing = 40;

    const generateVectors = (): Vector[] => {
      const cols = Math.ceil(window.innerWidth / spacing) + 1;
      const rows = Math.ceil(window.innerHeight / spacing) + 1;
      const newVectors: Vector[] = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          newVectors.push({
            x: col * spacing + spacing / 2,
            y: row * spacing + spacing / 2,
            angle: Math.random() * 360,
          });
        }
      }
      return newVectors;
    };

    // Initial generation
    const initialVectors = generateVectors();
    vectorsRef.current = initialVectors;
    setVectors(initialVectors);

    // Regenerate on resize
    const handleResize = () => {
      const resizedVectors = generateVectors();
      vectorsRef.current = resizedVectors;
      setVectors(resizedVectors);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Track mouse position with ref (no re-renders)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Continuous animation loop - updates state every 3rd frame
  useEffect(() => {
    let animationId: number;

    const animate = () => {
      frameCountRef.current++;
      const mousePos = mousePosRef.current;

      // Update angles in ref every frame
      vectorsRef.current = vectorsRef.current.map((v) => {
        const dx = mousePos.x - v.x;
        const dy = mousePos.y - v.y;
        const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);

        let currentAngle = v.angle;
        let diff = targetAngle - currentAngle;

        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;

        const newAngle = currentAngle + diff * 0.08;
        return { ...v, angle: newAngle };
      });

      // Only trigger React re-render every 3rd frame
      if (frameCountRef.current % 3 === 0) {
        setVectors([...vectorsRef.current]);
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []); // Empty deps - never restarts

  const strokeColor =
    theme === "dark"
      ? hexToRgba(vectorColors.darkVectorColor, vectorColors.darkVectorOpacity)
      : hexToRgba(
          vectorColors.lightVectorColor,
          vectorColors.lightVectorOpacity
        );

  return (
    <div
      ref={containerRef}
      className="hidden md:block absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <svg width="100%" height="100%" className="absolute inset-0">
        {vectors.map((v, i) => (
          <g key={i} transform={`translate(${v.x}, ${v.y}) rotate(${v.angle})`}>
            <line
              x1="-4"
              y1="0"
              x2="4"
              y2="0"
              stroke={strokeColor}
              strokeWidth="1"
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
