"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useIntro } from "./intro";

type HeroPhoto = {
  src: string;
  alt: string;
  className: string; // positions this card: top/left/right/bottom + size
};

// Tune these positions to taste — each one overlaps the wordmark at a
// different spot, some bleeding off the viewport edge like the reference.
const photos: HeroPhoto[] = [
  {
    src: "/gallery-placeholder.png",
    alt: "David and Angela Imagery — outdoor session",
    className: "left-[-4vw] top-[8vh] w-[22vw] aspect-[3/4]",
  },
  {
    src: "/gallery-placeholder.png",
    alt: "David and Angela Imagery — debut shoot",
    className: "left-1/2 -translate-x-1/2 top-[34vh] w-[24vw] aspect-[4/5]",
  },
  {
    src: "/gallery-placeholder.png",
    alt: "David and Angela Imagery — event coverage",
    className: "right-[-5vw] top-[14vh] w-[20vw] aspect-[3/4]",
  },
];

export function HeroComponent() {
  const { phase, instant } = useIntro();
  const flying = phase !== "hold";
  const revealed = phase === "reveal" || phase === "done";

  return (
    <section id="top" className="relative h-[100svh] w-full overflow-hidden bg-background">
      {/* Nav — fades in as the wordmark lands */}
      <motion.nav
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 text-sm"
        initial={false}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{
          duration: instant ? 0 : 0.9,
          delay: instant ? 0 : 0.3,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <span className="font-display">David &amp; Angela</span>
        <div className="flex gap-6 text-muted-foreground">
          <a href="#work">Work</a>
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
      </motion.nav>

      {/* Giant wordmark, sits behind the gallery photos.
          top-[30svh] is the gallery's top edge (100svh hero minus the gallery's
          -mt-[70svh] overlap) — keep the two in sync. text-box trims the empty
          space above the capitals so the letters, not the line box, sit on it.

          Intro, all CSS so it runs from the first paint (no wait for hydration):
          it starts centred — the viewport centre (50vw, 50svh) minus its resting
          spot (18vw, 30svh), minus half its own size — rises in (.intro-rise),
          then glides to translate 0 0 when the phase leaves "hold". */}
      <h1
        className={`
          ${instant ? "" : "intro-rise"} font-display absolute left-[18vw] top-[30svh]
          select-none text-[22vw] leading-none tracking-tight text-foreground
          [text-box:trim-both_cap_alphabetic]
          will-change-[translate] transition-[translate] duration-1400
          ease-[cubic-bezier(0.76,0,0.24,1)] motion-reduce:transition-none
          ${
            flying
              ? "translate-x-0 translate-y-0"
              : "translate-x-[calc(32vw-50%)] translate-y-[calc(20svh-50%)]"
          }
        `}
        aria-hidden
      >
        D&amp;A
      </h1>
    </section>
  );
}