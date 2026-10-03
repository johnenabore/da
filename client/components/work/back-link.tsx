"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

// Same ease-out-expo as the rest of the site.
const EASE = [0.16, 1, 0.3, 1] as const;
// Same soft ease as the gallery's hover.
const SOFT = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// Small centred "Back" control at the top of the inner pages. It slides down
// and fades in on load; on hover the inner square of the icon grows to fill it
// and the label opens up.
export function BackLink({ href }: { href: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="flex justify-center pt-[4svh]"
      initial={reduceMotion ? false : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion ? { duration: 0 } : { duration: 0.9, delay: 0.2, ease: EASE }
      }
    >
      <Link
        href={href}
        className="group flex flex-col items-center gap-3 outline-none focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-foreground"
      >
        <span
          aria-hidden
          className="flex size-[11px] items-center justify-center border border-foreground"
        >
          <span
            className={`size-[5px] bg-foreground transition-transform duration-900 ${SOFT} group-hover:scale-[2]`}
          />
        </span>
        <span
          className={`text-[10px] uppercase tracking-[0.2em] transition-[letter-spacing] duration-900 ${SOFT} group-hover:tracking-[0.32em]`}
        >
          Back
        </span>
      </Link>
    </motion.div>
  );
}
