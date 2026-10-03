"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { BackLink } from "@/components/work/back-link";
import { allWorkPhotos, projects } from "@/lib/projects";
import { pickRandomPhotos } from "@/lib/random-cover";

// Same ease-out-expo as the rest of the site.
const EASE = [0.16, 1, 0.3, 1] as const;
// Same soft ease as the gallery's hover.
const SOFT = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// Four columns of tiles: `photo` indexes allWorkPhotos, `ratio` is the crop.
// The ratios are chosen so the columns total about 3.2–3.75 widths tall, so
// the bottoms are uneven like the reference but every column is full.
const columns = [
  [
    { photo: 0, ratio: "4 / 5" },
    { photo: 4, ratio: "1 / 1" },
    { photo: 8, ratio: "3 / 4" },
  ],
  [
    { photo: 1, ratio: "2 / 3" },
    { photo: 5, ratio: "4 / 5" },
    { photo: 9, ratio: "1 / 1" },
  ],
  [
    { photo: 2, ratio: "1 / 1" },
    { photo: 6, ratio: "3 / 2" },
    { photo: 10, ratio: "2 / 3" },
  ],
  [
    { photo: 3, ratio: "2 / 3" },
    { photo: 7, ratio: "1 / 1" },
    { photo: 11, ratio: "5 / 6" },
  ],
];
const total = columns.reduce((n, column) => n + column.length, 0);

const titleVariants = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 1.2, ease: EASE } },
};

export function AllWork() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="min-h-screen bg-background pb-[10svh] text-foreground">
      <BackLink href="/#featured-work" />

      {/* Title row: "All work" at the left, the total at the right, bold and
          large enough to read. */}
      <motion.div
        className="mb-[2.5svh] mt-[6svh] flex items-start justify-between px-4 lg:px-[0.4vw]"
        initial={reduceMotion ? false : "hidden"}
        animate="show"
      >
        <h1 className="font-serif text-[16vw] leading-none tracking-tight lg:text-[6.8vw]">
          <span className="block overflow-hidden py-[0.1em] my-[-0.1em]">
            <motion.span
              className="block"
              variants={reduceMotion ? undefined : titleVariants}
            >
              All work
            </motion.span>
          </span>
        </h1>
        <p
          className="pt-[0.6em] text-lg font-bold tabular-nums lg:pt-[1.2vw] lg:text-[1.6vw]"
          aria-label={`${total} works`}
        >
          ({total})
        </p>
      </motion.div>

      {/* Edge to edge, with the same 0.4vw gutters as the featured grid */}
      <div className="grid grid-cols-2 items-start gap-[0.4vw] px-[0.4vw] lg:grid-cols-4">
        {columns.map((column, i) => (
          <div key={i} className="flex flex-col gap-[0.4vw]">
            {column.map((tile, j) => {
              const id = `${i}-${j}`;
              const photo = allWorkPhotos[tile.photo];
              // Tiles open the project pages (there are six of them).
              const project = projects[tile.photo % projects.length];
              return (
                // The trigger sits on this unclipped wrapper.
                <motion.div
                  key={id}
                  {...(reduceMotion
                    ? {}
                    : {
                        initial: { opacity: 0, y: 40 },
                        whileInView: { opacity: 1, y: 0 },
                        viewport: { once: true, amount: 0.1 },
                        transition: {
                          duration: 1.1,
                          delay: i * 0.08,
                          ease: EASE,
                        },
                      })}
                >
                  <Link
                    href={`/work/${project.slug}`}
                    onClick={() => pickRandomPhotos(project.slug)}
                    aria-label={project.alt}
                    className="group block cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  >
                    <div
                      className="relative w-full overflow-hidden bg-secondary"
                      style={{ aspectRatio: tile.ratio }}
                    >
                      <div
                        className={`absolute inset-0 transition-transform duration-900 ${SOFT} group-hover:scale-105`}
                      >
                        <Image
                          src={photo.src}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 25vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </main>
  );
}
