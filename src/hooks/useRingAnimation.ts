import { useState, useEffect } from "react";
import arcsData from "../data/arcs.json";
import type { Arc } from "../types";

export interface RingData {
  lat: number;
  lng: number;
  maxR: number;
  propagationSpeed: number;
  repeatPeriod: number;
}

/**
 * Hook to manage ring animations that pulse at arc endpoints
 * 3 rings pulse at sender AND receiver, then arc fires
 */
export function useRingAnimation(motionEnabled: boolean) {
  const [activeRings, setActiveRings] = useState<RingData[]>([]);

  useEffect(() => {
    if (!motionEnabled) {
      setActiveRings([]);
      return;
    }

    const arcs = arcsData as Arc[];
    const ringPulseInterval = 200; // Time between each of the 3 rings
    const ringDuration = 600; // How long each ring expands
    const ringsBeforeArc = 800; // Total ring animation time before arc starts
    const arcTravelTime = 3000; // Arc travel time
    const staggerInterval = 600; // Time between each arc's sequence

    const activeTimeouts = new Set<ReturnType<typeof setTimeout>>();

    const scheduleRing = (
      lat: number,
      lng: number,
      delay: number,
      maxRadius: number = 3
    ) => {
      const timeout = setTimeout(() => {
        const ring: RingData = {
          lat,
          lng,
          maxR: maxRadius,
          propagationSpeed: 4,
          repeatPeriod: 0, // Single pulse, no repeat
        };

        setActiveRings((prev) => [...prev, ring]);

        // Remove ring after it expands
        const removeTimeout = setTimeout(() => {
          setActiveRings((prev) => prev.filter((r) => r !== ring));
          activeTimeouts.delete(removeTimeout);
        }, ringDuration);
        activeTimeouts.add(removeTimeout);

        activeTimeouts.delete(timeout);
      }, delay);
      activeTimeouts.add(timeout);
    };

    const triggerSequence = () => {
      arcs.forEach((arc) => {
        const sequenceStart = arc.order * staggerInterval;

        // 3 rings at SENDER (staggered)
        for (let i = 0; i < 3; i++) {
          scheduleRing(
            arc.startLat,
            arc.startLng,
            sequenceStart + i * ringPulseInterval,
            2 + i * 0.5 // Increasing radius: 2, 2.5, 3
          );
        }

        // 3 rings at RECEIVER (same timing as sender)
        for (let i = 0; i < 3; i++) {
          scheduleRing(
            arc.endLat,
            arc.endLng,
            sequenceStart + i * ringPulseInterval,
            2 + i * 0.5
          );
        }
      });
    };

    // Initial trigger
    triggerSequence();

    // Calculate total cycle time and loop
    const maxOrder = Math.max(...arcs.map((a) => a.order));
    const totalCycleTime =
      arcTravelTime + maxOrder * staggerInterval + ringsBeforeArc;

    const interval = setInterval(triggerSequence, totalCycleTime);

    return () => {
      // Clear all timeouts
      activeTimeouts.forEach((timeout) => clearTimeout(timeout));
      activeTimeouts.clear();
      // Clear interval
      clearInterval(interval);
      // Clear rings immediately
      setActiveRings([]);
    };
  }, [motionEnabled]);

  return activeRings;
}
