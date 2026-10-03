"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { pickRandomPhotos } from "@/lib/random-cover";
import { projects } from "@/lib/projects";
import type { Project } from "@/lib/projects";

// Same ease-out-expo as the gallery, intro and other reveals.
const EASE = [0.16, 1, 0.3, 1] as const;
// Same soft ease as the gallery's edge hover.
const SOFT = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// The work comes from lib/projects.ts (placeholder data, shared with the
// /work/[slug] pages). Three columns, two rows each: the first row's photos
// share one top edge, while the column totals differ so the bottoms are ragged,
// like the reference.
const columns: Project[][] = [0, 1, 2].map((col) => [
  projects[col],
  projects[col + 3],
]);




// Words rise out of their masks one after another.
const wordVariants = {
  hidden: { y: "115%" },
  show: (i: number) => ({
    y: "0%",
    transition: { duration: 1.1, delay: i * 0.035, ease: EASE },
  }),
};
const titleVariants = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 1.2, ease: EASE } },
};

// Rise-and-fade when scrolled into view; empty for reduced motion.
function makeRise(reduceMotion: boolean | null) {
  return (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 40 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.15 },
          transition: { duration: 1.1, delay, ease: EASE },
        };
}

// One piece of work: photo sliding inside its frame, with the caption below.
// The whole card is a link; hovering zooms the photo and underlines the caption.
function WorkCard({
  project,
  rise,
}: {
  project: Project;
  rise: ReturnType<typeof makeRise>;
}) {
  const ref = useRef<HTMLDivElement>(null);
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
    <motion.article {...rise()} className="mb-12">
      {/* Opens the project page */}
      <Link
        href={`/work/${project.slug}`}
        onClick={() => pickRandomPhotos(project.slug)}
        className="group block cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
      >
        <div>
          <div
            ref={ref}
            className="relative w-full overflow-hidden bg-secondary"
            style={{ aspectRatio: project.cardRatio }}
          >
            {/* Scaled up so the slide never exposes the frame edges */}
            <motion.div
              style={{ y, scale: 1.2 }}
              className="absolute inset-0 will-change-transform"
            >
              {/* CSS zoom on hover, separate from the scroll transform above */}
              <div
                className={`absolute inset-0 transition-transform duration-900 ${SOFT} group-hover:scale-105`}
              >
                <Image
                  src={project.cardSrc}
                  alt={project.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
          <p className="mt-2 text-xs font-bold uppercase text-foreground underline-offset-4 group-hover:underline">
            {project.client} x {project.title}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}

export function FeaturedWork() {
  const reduceMotion = useReducedMotion();
  const rise = makeRise(reduceMotion);

  return (
    <section
      id="featured-work"
      className="relative w-full overflow-x-clip pb-[15svh] pt-[14svh]"
    >

      {/* Title, flush with the grid's left margin */}
      <motion.h2
        className="font-serif mt-[22svh] px-4 text-[14vw] leading-none tracking-tight text-foreground lg:px-[0.4vw] lg:text-[5.8vw]"
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.8 }}
      >
        <span className="block overflow-hidden pb-[0.12em] mb-[-0.12em]">
          <motion.span
            className="block"
            variants={reduceMotion ? undefined : titleVariants}
          >
            Featured work
          </motion.span>
        </span>
      </motion.h2>

      {/* Three equal columns, edge to edge with the gallery's 0.4vw gutters.
          No stagger and no column drift, so the first row's photos share one
          top edge and stay level. They stack into one column on small screens. */}
      <div className="mt-[3svh] grid grid-cols-1 items-start gap-x-[0.4vw] px-4 lg:grid-cols-3 lg:px-[0.4vw]">
        {columns.map((column, i) => (
          <div key={i} className="flex flex-col">
            {column.map((project, j) => {
              const id = `${i}-${j}`;
              return (
                <WorkCard
                  key={id}
                  project={project}
                  rise={rise}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* All work */}
      <motion.div {...rise()} className="mt-[6svh] flex justify-center px-4">
        <Link
          href="/work"
          className={`group flex items-center gap-6 border border-foreground px-8 py-3 text-sm text-foreground transition-colors duration-900 ${SOFT} hover:bg-foreground hover:text-background`}
        >
          All work
          <span
            aria-hidden
            className={`transition-transform duration-900 ${SOFT} group-hover:rotate-90`}
          >
            +
          </span>
        </Link>
      </motion.div>
    </section>
  );
}
