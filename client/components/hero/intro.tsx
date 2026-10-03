"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

// Intro sequence on first load. The wordmark's rise-in is pure CSS (see
// .intro-rise in globals.css), so it starts on the first paint; these phases
// drive what happens after it:
//   hold    wordmark rests, centred
//   fly     wordmark glides to its place in the hero
//   reveal  nav fades in and the gallery photos cascade in
//   done    scroll unlocked, page is normal
export type IntroPhase = "hold" | "fly" | "reveal" | "done";

// Milliseconds. flyAt is measured from the start of the page load (not from
// hydration), so a slow load never leaves a dead white screen. The later stages
// are measured from when the fly actually starts, so they keep their spacing.
export const INTRO = {
  flyAt: 1700,
  revealAfterFly: 700, // the photos start rising while the wordmark is landing
  doneAfterFly: 2200,
};

type IntroState = {
  phase: IntroPhase;
  // True when the intro is skipped (reduced motion, or it already played this
  // visit): nothing should animate.
  instant: boolean;
};

// Set once the intro has played (or been skipped), so navigating back to the
// home page from another page doesn't replay it. A full page reload resets it.
// Only ever set in the browser, never during server rendering.
let introPlayed = false;

// Outside a provider there is no intro.
const IntroContext = createContext<IntroState>({ phase: "done", instant: true });

export const useIntro = () => useContext(IntroContext);

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function IntroProvider({ children }: { children: ReactNode }) {
  // Starts at "hold" on server and client alike so hydration matches.
  const [timedPhase, setPhase] = useState<IntroPhase>("hold");
  // On a full load this is false (matching the server); on a client-side
  // navigation back here it is true.
  const [alreadyPlayed] = useState(() => introPlayed);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
  // Reduced motion, or an intro that already ran, skips it entirely.
  const instant = reducedMotion || alreadyPlayed;
  const phase: IntroPhase = instant ? "done" : timedPhase;

  useLayoutEffect(() => {
    if (instant) {
      introPlayed = true;
      return;
    }

    // Lock the page at the top while the intro plays. scrollbar-gutter keeps the
    // layout width the same when the scrollbar is hidden, so nothing shifts.
    const root = document.documentElement;
    window.scrollTo(0, 0);
    root.style.overflow = "hidden";
    root.style.scrollbarGutter = "stable";

    // performance.now() is time since navigation start. If hydration was late,
    // the fly starts right away, but the later stages still follow it by their
    // full spacing so the transitions aren't skipped.
    const flyIn = Math.max(INTRO.flyAt - performance.now(), 50);
    const unlock = () => {
      root.style.overflow = "";
      root.style.scrollbarGutter = "";
    };
    const timers = [
      setTimeout(() => setPhase("fly"), flyIn),
      setTimeout(() => setPhase("reveal"), flyIn + INTRO.revealAfterFly),
      // Release the scroll lock when the intro ends, not only on unmount.
      setTimeout(() => {
        unlock();
        introPlayed = true;
        setPhase("done");
      }, flyIn + INTRO.doneAfterFly),
    ];

    return () => {
      timers.forEach(clearTimeout);
      unlock();
    };
  }, [instant]);

  const value = useMemo(() => ({ phase, instant }), [phase, instant]);

  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
}
