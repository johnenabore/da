"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useIntro } from "@/components/hero/intro";

// Smooth, inertial page scrolling. Lenis eases the wheel scroll and the nav
// anchor jumps; framer-motion's useScroll just reads the resulting position, so
// the gallery parallax follows automatically. Lenis honours the user's
// reduced-motion setting itself (scroll then tracks the input 1:1).
export function SmoothScroll() {
  const { phase } = useIntro();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2, // default exponential ease-out, a little longer = softer glide
      smoothWheel: true,
      anchors: true, // the "Work" nav link glides too
      autoRaf: true,
    });
    lenisRef.current = lenis;
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Wheel and touch scrolling stay off while the intro plays.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (phase === "done") lenis.start();
    else lenis.stop();
  }, [phase]);

  return null;
}
