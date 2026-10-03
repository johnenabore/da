"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import type { MotionValue } from "framer-motion";
import Image from "next/image";
import { useIntro } from "./intro";

// The gallery photos (gallery-placeholder1.png … gallery-placeholder20.png in
// public/). Add or remove files here.
const photos = Array.from(
  { length: 20 },
  (_, i) => `/gallery-placeholder${i + 1}.png`,
);

// Five columns of four rows each; these are the caption/alt texts per slot.
// Keep every column the same length so the bottom of the section stays covered.
const columns: string[][] = [
  ["Debut shoot", "Outdoor session", "Birthday coverage", "Portrait session"],
  ["Portrait session", "Event coverage", "Studio shoot", "Outdoor session"],
  ["Debut shoot", "Portrait session", "Birthday coverage", "Studio shoot"],
  ["Event coverage", "Outdoor session", "Birthday coverage", "Debut shoot"],
  ["Studio shoot", "Event coverage", "Debut shoot", "Outdoor session"],
];
const ROWS = columns[0].length;
const SLOTS = columns.length * ROWS;

// Which photo each slot shows: order[slot] is an index into `photos`. The start
// is fixed (slot n shows photo n) so the server and the browser render the same
// page; it is only reshuffled in the browser, from the timer.
const initialOrder = Array.from({ length: SLOTS }, (_, i) => i % photos.length);

// A fresh random arrangement where every slot gets a different photo from the
// one it has now (so every card visibly changes), and no photo repeats on
// screen. Reshuffles until no slot keeps its photo.
function reshuffle(previous: number[]): number[] {
  let next = previous;
  for (let attempt = 0; attempt < 50; attempt++) {
    next = [...previous];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    if (next.every((photo, slot) => photo !== previous[slot])) return next;
  }
  // Practically unreachable; a shift by one still changes every slot.
  return previous.map((_, slot) => previous[(slot + 1) % previous.length]);
}

// Extra upward travel per px of page scroll. Every column moves up faster than
// the page, so photos pass through the viewport sooner and the scroll feels
// shorter; the different rates between columns are the parallax.
// Mirrored columns (1 & 5, 2 & 4) must share a value so they stay level with
// each other at every scroll position, including the end of the page.
const columnSpeeds = [0.18, 0.1, 0.14, 0.1, 0.18];

// Gives the columns a weighted, eased feel instead of being locked to scroll.
const SPRING = { stiffness: 120, damping: 30, mass: 0.3 };

// Where each column starts, measured from the top of the gallery. The gallery
// itself is pulled up over the hero, so these let the photos step down across
// the hero like the reference.
//
// Below md (phones) only the first two columns show, like the mobile reference:
// the left one starts 10svh down and the right one 26svh (a 16svh step), with
// the other three hidden. Each entry is the column's display and start classes.
const columnStarts = [
  "flex mt-[10svh] md:mt-0",
  "flex mt-[26svh] md:mt-[40svh]",
  "hidden md:flex md:mt-[17svh]",
  "hidden md:flex md:mt-[40svh]",
  "hidden md:flex md:mt-0",
];

// Every CYCLE_MS the photos change. The new photo wipes in left to right across
// each card (WIPE_S), and the columns start one after another (STAGGER_S apart),
// so the change visibly sweeps from the left column to the right. BASE_DELAY_S
// gives each new photo a moment to download before its wipe begins.
const CYCLE_MS = 10000;
const WIPE_S = 1.8;
const STAGGER_S = 0.6;
const BASE_DELAY_S = 0.4;

type Layer = { key: number; src: string; enter: boolean };

type Edge = "left" | "right";

// The outer columns are cropped by 14.8vw (the gallery's negative left margin).
// Hovering one slides the whole row so that column is fully visible (plus half
// a gap), leaving four columns on screen; it eases back on leave. The right side
// adds 1rem to also clear a classic scrollbar, since vw includes its width.
// Full class strings so Tailwind can see them.
const rowShift: Record<Edge, string> = {
  // md: up only, so a mouse on a narrow window doesn't push the two-column phone
  // layout sideways.
  left: "md:translate-x-[15.2vw]",
  right: "md:-translate-x-[calc(15.2vw+1rem)]",
};

// A card whose photo slides inside its frame as the card crosses the viewport.
// `caption` is only passed for the last card in a column, like the reference.
function ParallaxCard({
  alt,
  src,
  caption,
  step,
  delay,
  eager,
  revealed,
  instant,
  revealDelay,
}: {
  alt: string;
  // The photo this card shows right now; it changes when `step` does.
  src: string;
  caption?: string;
  step: number;
  delay: number;
  // Load the first photo straight away (cards that are on screen at the start).
  eager: boolean;
  revealed: boolean;
  instant: boolean;
  revealDelay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // On each step a new layer is stacked over the old one and wipes in; the old
  // layer is dropped once the wipe finishes. Updated during render (not in an
  // effect) when `step` changes.
  const [layers, setLayers] = useState<Layer[]>([
    { key: step, src, enter: false },
  ]);
  const [seenStep, setSeenStep] = useState(step);
  if (step !== seenStep) {
    setSeenStep(step);
    setLayers((l) => [...l.slice(-1), { key: step, src, enter: true }]);
  }
  const wipe = { duration: WIPE_S, delay, ease: [0.65, 0, 0.35, 1] as const };

  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? ["0%", "0%"] : ["-8%", "8%"],
  );

  return (
    // Intro: starts hidden (also in the server HTML) and rises in when revealed.
    <motion.div
      initial={false}
      animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 70 }}
      transition={{
        duration: instant ? 0 : 1.1,
        delay: instant ? 0 : revealDelay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div
        ref={ref}
        className="relative aspect-[3/4] w-full overflow-hidden bg-secondary md:aspect-[4/5]"
      >
        {/* Scaled up so the slide never exposes the card edges */}
        <motion.div
          style={{ y, scale: 1.2 }}
          className="absolute inset-0 will-change-transform"
        >
          {layers.map((layer) => (
            <motion.div
              key={layer.key}
              className="absolute inset-0"
              initial={layer.enter ? { clipPath: "inset(0 100% 0 0)" } : false}
              animate={{ clipPath: "inset(0 0% 0 0)" }}
              transition={wipe}
              onAnimationComplete={() => {
                if (layer.enter) {
                  setLayers((l) => l.filter((x) => x.key >= layer.key));
                }
              }}
            >
              <motion.div
                className="absolute inset-0"
                initial={layer.enter ? { scale: 1.35 } : false}
                animate={{ scale: 1 }}
                transition={wipe}
              >
                <Image
                  src={layer.src}
                  alt={alt}
                  fill
                  sizes="(min-width: 768px) 26vw, 47vw"
                  loading={eager && !layer.enter ? "eager" : "lazy"}
                  className="object-cover"
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      {caption && <p className="mt-2 text-xs text-foreground">{caption}</p>}
    </motion.div>
  );
}

function Column({
  alts,
  order,
  speed,
  start,
  scrollY,
  col,
  tick,
  revealed,
  instant,
  edge,
  onEdgeHover,
}: {
  alts: string[];
  order: number[];
  speed: number;
  start: string;
  scrollY: MotionValue<number>;
  col: number;
  tick: number;
  revealed: boolean;
  instant: boolean;
  edge?: Edge;
  onEdgeHover: (edge: Edge | null) => void;
}) {
  const reduceMotion = useReducedMotion();
  const target = useTransform(scrollY, (v) => (reduceMotion ? 0 : -v * speed));
  const y = useSpring(target, SPRING);

  return (
    <motion.div
      style={{ y }}
      className={`${start} w-[46.7vw] shrink-0 flex-col gap-[2.3vw] will-change-transform md:w-[25.6vw] md:gap-2`}
      // Mouse only, so touch taps don't leave the row stuck in the shifted state
      onPointerEnter={
        edge
          ? (e) => e.pointerType === "mouse" && onEdgeHover(edge)
          : undefined
      }
      onPointerLeave={
        edge
          ? (e) => e.pointerType === "mouse" && onEdgeHover(null)
          : undefined
      }
    >
      {alts.map((alt, idx) => {
        const slot = col * ROWS + idx;
        return (
          <ParallaxCard
            key={slot}
            alt={alt}
            src={photos[order[slot] % photos.length]}
            caption={idx === alts.length - 1 ? alt : undefined}
            step={tick}
            delay={BASE_DELAY_S + col * STAGGER_S}
            eager={idx < 2}
            revealed={revealed}
            instant={instant}
            // Cascade in left to right, then top to bottom
            revealDelay={col * 0.15 + idx * 0.07}
          />
        );
      })}
    </motion.div>
  );
}

export function ParallaxGallery() {
  // Page scroll, not section progress: the gallery already sits on screen at
  // load (overlapping the hero), so the columns must start at rest.
  const { scrollY } = useScroll();
  const [shift, setShift] = useState<Edge | null>(null);
  const { phase, instant } = useIntro();
  const revealed = phase === "reveal" || phase === "done";

  // One clock for the whole gallery; columns stagger themselves from it. Each
  // tick also deals the photos out in a new random order. Off for
  // reduced-motion users, who keep a static gallery.
  const reduceMotion = useReducedMotion();
  const [tick, setTick] = useState(0);
  const [order, setOrder] = useState(initialOrder);
  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setOrder(reshuffle);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [reduceMotion]);

  return (
    // Height comes from the content: every column is the same length, so the
    // staggered starts above leave the same ragged, staggered ends below.
    // overflow-x-clip hides the bleed without clipping the ends vertically, and
    // the negative bottom margin pulls the page end up by roughly the distance the
    // inner columns gain from drifting upward, so the scroll is shorter, and the
    // padding keeps the white tail under the last captions.
    // (The intro reveal happens per card, see ParallaxCard.)
    <section
      id="work"
      className="relative z-10 mt-[-70svh] w-full overflow-x-clip pb-[15svh] mb-[-18svh]"
    >
      {/* Wider than the viewport so the outer columns bleed off both edges */}
      <div
        className={`ml-[2vw] flex items-start gap-[2.3vw] transition-[translate] md:ml-[-14.8vw] md:gap-2 duration-900 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          shift ? rowShift[shift] : ""
        }`}
      >
        {columns.map((alts, i) => (
          <Column
            key={i}
            alts={alts}
            order={order}
            speed={columnSpeeds[i % columnSpeeds.length]}
            start={columnStarts[i % columnStarts.length]}
            scrollY={scrollY}
            col={i}
            tick={tick}
            revealed={revealed}
            instant={instant}
            edge={i === 0 ? "left" : i === columns.length - 1 ? "right" : undefined}
            onEdgeHover={setShift}
          />
        ))}
      </div>
    </section>
  );
}
