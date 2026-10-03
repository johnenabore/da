"use client";

import { Fragment, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { photos } from "@/lib/projects";

// Same ease-out-expo as the rest of the site.
const EASE = [0.16, 1, 0.3, 1] as const;
// Same soft ease as the gallery's hover.
const SOFT = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// Swap these for portraits of David and Angela when you have them (any file in
// public/, with its pixel ratio). For now they are two of the numbered photos.
const photoMain = photos[3];
const photoSecond = photos[8];

const headlineLines = ["We’re David", "& Angela."];
const statement =
  "Two photographers, one shared eye for the moments people actually want to remember.";
const services = [
  "Debut & Birthday",
  "Outdoor Sessions",
  "Indoor Studio",
  "Event Coverage",
];
// The gliding word band under the composition.
const bandWords = ["Debuts", "Birthdays", "Outdoor", "Studio", "Events"];

const lineVariants = { hidden: { y: "110%" }, show: { y: "0%" } };

// A photo that slides inside its frame as it crosses the screen.
function ScrollPhoto({
  src,
  ratio,
  sizes,
  reduceMotion,
}: {
  src: string;
  ratio: string;
  sizes: string;
  reduceMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
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
    <div
      ref={ref}
      className="relative w-full overflow-hidden bg-secondary"
      style={{ aspectRatio: ratio }}
    >
      {/* Scaled up so the slide never exposes the frame edges */}
      <motion.div
        style={{ y, scale: 1.2 }}
        className="absolute inset-0 will-change-transform"
      >
        <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
      </motion.div>
    </div>
  );
}

// A band of oversized words that glides sideways while it is on screen: solid
// and outlined words alternate, so it reads clearly in both. It has its own
// scroll progress (it moves across its own pass through the screen), so it
// moves at the moment you are looking at it.
function WordBand({ reduceMotion }: { reduceMotion: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? ["0%", "0%"] : ["0%", "-22%"],
  );
  return (
    <div ref={ref} aria-hidden className="overflow-hidden">
      <motion.div
        style={{ x }}
        className="flex w-max items-center whitespace-nowrap font-serif text-[18vw] leading-none tracking-tight lg:text-[12vw]"
      >
        {[0, 1, 2].flatMap((repeat) =>
          bandWords.map((word, i) => (
            <Fragment key={`${repeat}-${word}`}>
              <span
                className={
                  i % 2
                    ? "italic text-transparent [-webkit-text-stroke:2px_var(--foreground)]"
                    : "text-foreground"
                }
              >
                {word}
              </span>
              <span className="mx-[0.3em] text-[0.35em] text-foreground">✦</span>
            </Fragment>
          )),
        )}
      </motion.div>
    </div>
  );
}

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion() ?? false;

  // Section progress drives the headline's sideways drift and the second
  // photo's drift against the first.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const range = <T,>(from: T, to: T, still: T): [T, T] =>
    reduceMotion ? [still, still] : [from, to];
  const headlineX = useTransform(
    scrollYProgress,
    [0, 1],
    range("4vw", "-4vw", "0vw"),
  );
  const secondY = useTransform(
    scrollYProgress,
    [0, 1],
    range("6svh", "-6svh", "0svh"),
  );

  // Rise-and-fade when scrolled into view (nothing for reduced motion).
  const rise = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 40 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: { duration: 1.1, delay, ease: EASE },
        };

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full overflow-x-clip pb-[20svh] pt-[14svh]"
    >
      {/* The word band opens the section, so it is on screen as you arrive */}
      <WordBand reduceMotion={reduceMotion} />

      {/* Headline — same left edge as the hero wordmark */}
      <motion.h2
        style={{ x: headlineX }}
        className="mt-[14svh] ml-4 font-serif text-[15vw] leading-[0.95] tracking-tight text-foreground lg:ml-[18vw] lg:text-[9vw]"
      >
        {headlineLines.map((line, i) => (
          // The viewport trigger lives on this visible, masked line; the inner
          // span rises out of it.
          <motion.span
            key={line}
            className="mb-[-0.08em] block overflow-hidden pb-[0.08em]"
            initial={reduceMotion ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.8 }}
          >
            <motion.span
              className="block"
              variants={reduceMotion ? undefined : lineVariants}
              transition={{ duration: 1.2, delay: i * 0.12, ease: EASE }}
            >
              {line}
            </motion.span>
          </motion.span>
        ))}
      </motion.h2>

      {/* Composition on the gallery's columns 2, 3 and 4 (25.6vw wide, 0.4vw
          gaps). The first photo and the text share a top edge; the second photo
          starts lower, like the gallery's staggered columns. */}
      <div className="mt-[10svh] flex flex-col gap-16 px-4 lg:ml-[11.2vw] lg:flex-row lg:items-start lg:gap-[0.4vw] lg:px-0">
        <motion.div {...rise()} className="relative lg:w-[25.6vw]">
          <ScrollPhoto
            src={photoMain.src}
            ratio="4 / 5"
            sizes="(min-width: 1024px) 26vw, 92vw"
            reduceMotion={reduceMotion}
          />
          {/* Overlaps the photo's bottom-left corner */}
          <p className="absolute -bottom-3 left-3 bg-background px-2 py-1 text-xs text-foreground">
            Est. in Liliw, Laguna
          </p>
        </motion.div>

        <div className="flex flex-col lg:w-[25.6vw]">
          <motion.p
            {...rise()}
            className="mb-6 flex items-center gap-2 text-xs text-foreground"
          >
            <span aria-hidden>+</span>
            About
          </motion.p>
          <motion.p
            {...rise(0.1)}
            className="font-serif text-3xl leading-[1.1] tracking-tight text-foreground lg:text-[2vw]"
          >
            {statement}
          </motion.p>
          <motion.p
            {...rise(0.2)}
            className="mt-4 text-xs text-muted-foreground"
          >
            Liliw, Laguna
          </motion.p>

          <ul className="mt-10 border-b border-foreground/15 text-sm text-foreground">
            {services.map((service, i) => (
              <motion.li
                key={service}
                {...rise(0.25 + i * 0.07)}
                className={`flex gap-4 border-t border-foreground/15 py-3 transition-[padding] duration-900 ${SOFT} hover:pl-3`}
              >
                <span className="tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {service}
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.div
          style={{ y: secondY }}
          className="lg:mt-[18svh] lg:w-[25.6vw]"
        >
          <motion.div {...rise(0.15)}>
            <ScrollPhoto
              src={photoSecond.src}
              ratio="1 / 1"
              sizes="(min-width: 1024px) 26vw, 92vw"
              reduceMotion={reduceMotion}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
