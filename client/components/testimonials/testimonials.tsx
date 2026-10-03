"use client";

import { Fragment, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { photos } from "@/lib/projects";

// Same ease-out-expo as the rest of the site.
const EASE = [0.16, 1, 0.3, 1] as const;
// Same soft ease as the gallery's hover.
const SOFT = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// How long each quote stays before the next one arrives.
const ADVANCE_MS = 8000;

// PLACEHOLDER testimonials — replace with real quotes, names and events. Each
// has a photo from public/ that wipes in beside the quote.
const testimonials = [
  {
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    name: "Client Name",
    event: "Debut · 2025",
    photo: photos[1],
  },
  {
    quote:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    name: "Client Name",
    event: "Birthday · 2025",
    photo: photos[5],
  },
  {
    quote:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint.",
    name: "Client Name",
    event: "Outdoor session · 2024",
    photo: photos[9],
  },
  {
    quote:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
    name: "Client Name",
    event: "Event coverage · 2024",
    photo: photos[10],
  },
];

const titleVariants = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 1.2, ease: EASE } },
};

// Words of the active quote rise out of their masks; the one leaving drops
// back down first, so the two never overlap.
const wordVariants = {
  hidden: { y: "115%", transition: { duration: 0.4, ease: EASE } },
  show: (i: number) => ({
    y: "0%",
    transition: { duration: 0.9, delay: 0.45 + i * 0.02, ease: EASE },
  }),
};

export function Testimonials() {
  const reduceMotion = useReducedMotion() ?? false;
  const [{ active, previous }, setState] = useState({ active: 0, previous: 0 });
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  const goTo = (to: number) =>
    setState((s) => ({ active: (to + count) % count, previous: s.active }));

  // Next quote every few seconds; waits while hovered, and is off for reduced
  // motion. Clicking an arrow (or a new quote arriving) restarts the wait.
  useEffect(() => {
    if (reduceMotion || paused) return;
    const id = setTimeout(() => goTo(active + 1), ADVANCE_MS);
    return () => clearTimeout(id);
    // goTo only reads `count`, which never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, paused, reduceMotion]);

  const photo = testimonials[active].photo;
  const previousPhoto = testimonials[previous].photo;

  return (
    <section
      id="testimonials"
      className="relative w-full overflow-x-clip pb-[20svh] pt-[20svh]"
    >
      {/* Title, flush with the grid's left margin like the other sections */}
      <motion.h2
        className="px-4 font-serif text-[14vw] leading-none tracking-tight text-foreground lg:px-[0.4vw] lg:text-[6.8vw]"
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.8 }}
      >
        <span className="mb-[-0.12em] block overflow-hidden pb-[0.12em]">
          <motion.span
            className="block"
            variants={reduceMotion ? undefined : titleVariants}
          >
            Kind words
          </motion.span>
        </span>
      </motion.h2>

      {/* Photo on gallery column 2 (25.6vw); the quote spans columns 3–4
          (51.6vw), with the gallery's 0.4vw gap between them. */}
      <div
        className="mt-[8svh] flex flex-col gap-10 px-4 lg:ml-[11.2vw] lg:flex-row lg:items-stretch lg:gap-[0.4vw] lg:px-0"
        onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setPaused(false)}
      >
        {/* The new photo wipes in left to right over the one before it */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary lg:w-[25.6vw]">
          <Image
            src={previousPhoto.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 26vw, 92vw"
            className="object-cover"
          />
          <motion.div
            key={active}
            className="absolute inset-0"
            initial={
              reduceMotion || previous === active
                ? false
                : { clipPath: "inset(0 100% 0 0)" }
            }
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: reduceMotion ? 0 : 1.2, ease: EASE }}
          >
            <Image
              src={photo.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 26vw, 92vw"
              className="object-cover"
            />
          </motion.div>
        </div>

        <div className="flex flex-col justify-between gap-10 lg:w-[51.6vw]">
          <div>
            <span
              aria-hidden
              className="block font-serif text-[18vw] leading-[0.7] text-foreground lg:text-[7vw]"
            >
              &ldquo;
            </span>

            {/* All the quotes sit in the same grid cell, so the block is as
                tall as the longest one and nothing jumps when they change. */}
            <div className="mt-4 grid" aria-live="polite">
              {testimonials.map((item, i) => (
                <motion.div
                  key={i}
                  className="col-start-1 row-start-1"
                  aria-hidden={active !== i}
                  initial={false}
                  animate={active === i ? "show" : "hidden"}
                >
                  <p className="font-serif text-3xl leading-[1.1] tracking-tight text-foreground lg:text-[3.2vw]">
                    {item.quote.split(" ").map((word, w) => (
                      <Fragment key={w}>
                        <span className="mx-[-0.05em] my-[-0.1em] inline-block overflow-hidden px-[0.05em] py-[0.1em] align-top">
                          <motion.span
                            className="inline-block"
                            variants={reduceMotion ? undefined : wordVariants}
                            custom={w}
                          >
                            {word}
                          </motion.span>
                        </span>{" "}
                      </Fragment>
                    ))}
                  </p>
                  <motion.p
                    className="mt-8 text-xs uppercase text-foreground"
                    variants={{
                      hidden: { opacity: 0, transition: { duration: 0.3 } },
                      show: {
                        opacity: 1,
                        transition: { duration: 0.8, delay: 0.9 },
                      },
                    }}
                  >
                    <span className="font-bold">{item.name}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      — {item.event}
                    </span>
                  </motion.p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Counter and arrows */}
          <div className="flex items-center gap-6">
            <p className="text-xs tabular-nums text-foreground">
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(count).padStart(2, "0")}
            </p>
            <div className="flex gap-2">
              {(
                [
                  ["Previous quote", "←", active - 1],
                  ["Next quote", "→", active + 1],
                ] as const
              ).map(([label, arrow, to]) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  onClick={() => goTo(to)}
                  className={`flex size-10 cursor-pointer items-center justify-center border border-foreground text-sm text-foreground transition-colors duration-700 ${SOFT} hover:bg-foreground hover:text-background`}
                >
                  {arrow}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

