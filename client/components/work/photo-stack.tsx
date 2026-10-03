"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import type { Photo } from "@/lib/projects";

// Same ease-out-expo as the rest of the site.
const EASE = [0.16, 1, 0.3, 1] as const;
// Same soft ease as the gallery's hover.
const SOFT = "ease-[cubic-bezier(0.22,1,0.36,1)]";

const frameVariants = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  show: {
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 1.2, ease: EASE },
  },
};
const zoomVariants = {
  hidden: { scale: 1.12 },
  show: { scale: 1, transition: { duration: 1.6, ease: EASE } },
};

// "1/3", "2/3", "3/3": the active photo out of the total, updating as you
// scroll. The number slides up and fades in when it changes.
function Counter({
  active,
  total,
  className,
}: {
  active: number;
  total: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <p
      aria-live="polite"
      aria-label={`Photo ${active + 1} of ${total}`}
      className={`text-[10px] tabular-nums tracking-wide text-foreground ${className ?? ""}`}
    >
      <motion.span
        key={active}
        className="inline-block"
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {active + 1}/{total}
      </motion.span>
    </p>
  );
}

// A centred stack of the project's photos, with a column of thumbnails fixed to
// the right edge (shown while the stack is on screen). The photo at the middle
// of the screen is the active thumbnail; clicking one scrolls to its photo.
export function PhotoStack({ photos, alt }: { photos: Photo[]; alt: string }) {
  const reduceMotion = useReducedMotion();
  const stackRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);

  // Active photo = the one crossing a thin band at the middle of the screen.
  useEffect(() => {
    const observers = itemRefs.current.map((el, i) => {
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(i);
        },
        { rootMargin: "-50% 0px -50% 0px" },
      );
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach((observer) => observer?.disconnect());
  }, [photos]);

  // The thumbnails only show while the stack is on screen.
  useEffect(() => {
    const el = stackRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToPhoto = (index: number) =>
    itemRefs.current[index]?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });

  return (
    <section
      ref={stackRef}
      className="mt-[12svh] flex flex-col items-center gap-4 px-4"
    >
      {photos.map((photo, i) => {
        // Portrait photos are sized by height (one fits on screen at a time);
        // landscape ones by width, like the reference's 42vw column.
        const [w, h] = photo.ratio.split("/").map(Number);
        const portrait = w < h;
        return (
          // The outer element is sized by the photo's shape and carries the
          // in-view trigger. It is never clipped, so the browser always sees it
          // as on screen when it is; the clipped frame inside only follows its
          // "hidden" / "show" state (a fully clipped element can't be the
          // trigger, since it would never count as visible).
          <motion.div
            key={`${photo.src}-${i}`}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className={`relative ${
              portrait
                ? "h-[75svh] max-w-full lg:h-[85svh]"
                : "w-full lg:w-[42vw]"
            }`}
            style={{ aspectRatio: photo.ratio }}
            initial={reduceMotion ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
          >
            {/* Wipes in from left to right */}
            <motion.div
              className="absolute inset-0 overflow-hidden bg-secondary"
              variants={reduceMotion ? undefined : frameVariants}
            >
              {/* Settles from a slight zoom as it is revealed */}
              <motion.div
                className="absolute inset-0"
                variants={reduceMotion ? undefined : zoomVariants}
              >
                <Image
                  src={photo.src}
                  alt={`${alt} — photo ${i + 1}`}
                  fill
                  sizes={portrait ? "(min-width: 1024px) 45vw, 92vw" : "42vw"}
                  className="object-cover"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* Thumbnails, fixed to the right edge on the same margin as the cover */}
      <nav
        aria-label="Project photos"
        className={`fixed right-[1.9vw] top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-1 transition-opacity duration-700 ${SOFT} lg:flex ${
          visible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {photos.map((photo, i) => (
          <button
            key={`${photo.src}-${i}`}
            type="button"
            aria-label={`Show photo ${i + 1}`}
            aria-current={active === i}
            onClick={() => scrollToPhoto(i)}
            className={`relative block w-6 cursor-pointer overflow-hidden outline outline-offset-2 transition-[opacity,outline-color] duration-700 ${SOFT} ${
              active === i
                ? "opacity-100 outline-foreground"
                : "opacity-40 outline-transparent hover:opacity-80"
            }`}
            style={{ aspectRatio: photo.ratio }}
          >
            <Image
              src={photo.src}
              alt=""
              fill
              sizes="24px"
              className="object-cover"
            />
          </button>
        ))}
        <Counter active={active} total={photos.length} className="mt-3 text-center" />
      </nav>

      {/* On small screens, where the thumbnails are hidden, the counter sits in
          the bottom corner instead. */}
      <Counter
        active={active}
        total={photos.length}
        className={`fixed bottom-4 right-4 z-30 transition-opacity duration-700 ${SOFT} lg:hidden ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
    </section>
  );
}
