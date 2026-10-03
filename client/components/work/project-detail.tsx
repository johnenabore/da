"use client";

import { useState } from "react";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import Image from "next/image";
import { BackLink } from "@/components/work/back-link";
import { PhotoStack } from "@/components/work/photo-stack";
import { getPickedPhotos } from "@/lib/random-cover";
import type { Project } from "@/lib/projects";

// Same ease-out-expo as the rest of the site.
const EASE = [0.16, 1, 0.3, 1] as const;

export function ProjectDetail({ project }: { project: Project }) {
  const reduceMotion = useReducedMotion();
  // Entrance timings; all zero for reduced motion.
  const t = (duration: number, delay = 0) =>
    reduceMotion ? { duration: 0 } : { duration, delay, ease: EASE };

  // Clicking a featured-work card picks random photos for this page: the cover
  // and the three-photo stack (see lib/random-cover.ts). A direct visit or
  // reload shows the project's own.
  const [picked] = useState(
    () =>
      getPickedPhotos(project.slug) ?? {
        cover: { src: project.heroSrc, ratio: project.heroRatio },
        gallery: project.gallery,
      },
  );
  const cover = picked.cover;

  // Reading progress: a thin bar down the left edge that grows with the scroll.
  const { scrollYProgress } = useScroll();

  // The cover frame follows the photo's shape. A portrait photo gets a centred
  // frame at its own ratio (cropping it into a wide band would lose the subject
  // and blow it up); a landscape one gets the full-width frame.
  const [ratioW, ratioH] = cover.ratio.split("/").map(Number);
  const portrait = ratioW < ratioH;

  return (
    <main className="min-h-screen bg-[#f6f5f1] pb-[10svh] text-foreground">
      <motion.div
        aria-hidden
        className="fixed left-0 top-0 z-40 h-svh w-[3px] origin-top bg-foreground"
        style={{ scaleY: scrollYProgress }}
      />

      <BackLink href="/#featured-work" />

      {/* Cover: wipes up from the bottom while settling from a slight zoom.
          Portrait: a centred flex row, so the frame's width comes from its
          height and ratio. Landscape: full width with a height cap. */}
      <div
        className={
          portrait
            ? "mt-[2.5svh] flex justify-center px-4"
            : "mx-4 mt-[2.5svh] lg:mx-[1.9vw]"
        }
      >
        <motion.div
          className={`relative overflow-hidden bg-secondary ${
            portrait
              ? "h-[70svh] max-w-full lg:h-[80svh]"
              : "max-h-[60svh] w-full lg:max-h-[80svh]"
          }`}
          style={{ aspectRatio: cover.ratio }}
          initial={reduceMotion ? false : { clipPath: "inset(100% 0 0 0)" }}
          animate={{ clipPath: "inset(0% 0 0 0)" }}
          transition={t(1.4, 0.35)}
        >
          <motion.div
            className="absolute inset-0"
            initial={reduceMotion ? false : { scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={t(1.8, 0.35)}
          >
            <Image
              src={cover.src}
              alt={project.alt}
              fill
              sizes={portrait ? "(min-width: 1024px) 45vw, 92vw" : "96vw"}
              fetchPriority="high"
              loading="eager"
              className="object-cover"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Title and tagline, centred under the cover */}
      <div className="mt-[2svh] px-4 text-center">
        <h1 className="font-serif text-[13vw] leading-none tracking-tight lg:text-[5.5vw]">
          {/* The mask has a little padding so descenders aren't clipped */}
          <span className="block overflow-hidden py-[0.1em] my-[-0.1em]">
            <motion.span
              className="block"
              initial={reduceMotion ? false : { y: "110%" }}
              animate={{ y: "0%" }}
              transition={t(1.2, 0.9)}
            >
              {project.title}
            </motion.span>
          </span>
        </h1>
        <motion.p
          className="mt-4 font-serif text-xl leading-tight lg:text-[1.5vw]"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(1, 1.2)}
        >
          {project.tagline}
        </motion.p>
      </div>

      {/* Details, on the same side margins as the cover: description and
          credits in muted grey, then the meta line in black. */}
      <motion.div
        className="mt-[6svh] px-4 text-sm lg:px-[1.9vw]"
        initial={reduceMotion ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={t(1, 0)}
      >
        <p className="text-muted-foreground">{project.description}</p>
        <p className="mt-3 text-muted-foreground">{project.credits}</p>
        <p className="mt-8 text-foreground">
          {project.client}, {project.year} · {project.role}
        </p>
      </motion.div>

      <PhotoStack photos={picked.gallery} alt={project.alt} />
    </main>
  );
}
