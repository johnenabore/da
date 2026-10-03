"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { useIntro } from "@/components/hero/intro";

// Same ease-out-expo as the rest of the site.
const EASE = [0.16, 1, 0.3, 1] as const;
// Same soft ease as the gallery's hover.
const SOFT = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// Only sections that exist on the page. Add "Contact" back when that section
// is on the page again.
const links = [
  { label: "Work", id: "featured-work" },
  { label: "About", id: "about" },
  { label: "Reviews", id: "testimonials" },
  { label: "Availability", id: "availability" },
];
// Sections above the links: while one of these is on screen, no link is active.
const aboveLinks = ["top", "work"];

// PLACEHOLDER contact details for the menu — same ones as the footer.
const EMAIL = "hello@example.com";
const PHONE = "+63 000 000 0000";
const social = [
  { label: "Instagram", href: "https://instagram.com/" },
  { label: "Facebook", href: "https://facebook.com/" },
];

// The site nav: a fixed bar with the logo and the section links. It slides away
// when you scroll down and back when you scroll up, and its text blends
// (difference) so it reads on white, on photos and on the grey footer. The line
// under a link follows the section on screen. On phones the links become a
// "Menu" button that opens a full-screen menu.
export function SiteNav() {
  const reduceMotion = useReducedMotion() ?? false;
  const { phase, instant } = useIntro();
  const revealed = phase === "reveal" || phase === "done";

  // Hide on scroll down, show on scroll up (never hidden for reduced motion).
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (reduceMotion) return;
    if (y > previous && y > 120) setHidden(true);
    else if (y < previous) setHidden(false);
  });

  // The section on screen: whichever crosses a thin band at the middle.
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const ids = [...aboveLinks, ...links.map((link) => link.id)];
    const observers = ids.flatMap((id) => {
      const el = document.getElementById(id);
      if (!el) return [];
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActive(aboveLinks.includes(id) ? null : id);
          }
        },
        { rootMargin: "-45% 0px -50% 0px" },
      );
      observer.observe(el);
      return [observer];
    });
    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  // The phone menu: locks the page behind it, closes on Esc, and puts focus on
  // its Close button.
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const visible = revealed && !hidden;

  return (
    <>
      <motion.header
        className={`fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 py-4 text-white mix-blend-difference lg:px-[0.4vw] lg:py-[1.2vw] ${
          visible ? "" : "pointer-events-none"
        }`}
        initial={false}
        animate={{ opacity: revealed ? 1 : 0, y: hidden ? "-100%" : "0%" }}
        transition={{
          opacity: {
            duration: instant ? 0 : 0.9,
            delay: instant ? 0 : 0.3,
            ease: EASE,
          },
          y: { duration: reduceMotion ? 0 : 0.6, ease: EASE },
        }}
      >
        <a
          href="#top"
          className="font-serif text-2xl leading-none tracking-tight md:text-[1.5vw]"
        >
          David &amp; Angela
        </a>

        <nav aria-label="Main" className="hidden gap-[2.2vw] md:flex">
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="group relative font-serif text-[1.2vw] leading-none"
              aria-current={active === link.id ? "location" : undefined}
            >
              {link.label}
              <span
                aria-hidden
                className={`absolute -bottom-1 left-0 h-px w-full origin-left bg-white transition-transform duration-700 ${SOFT} ${
                  active === link.id
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </a>
          ))}
        </nav>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen(true)}
          className="cursor-pointer font-serif text-2xl leading-none md:hidden"
        >
          Menu +
        </button>
      </motion.header>

      {/* Full-screen menu (phones) */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            data-lenis-prevent
            className="fixed inset-0 z-50 flex flex-col bg-background px-4 py-4 text-foreground md:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: reduceMotion ? 0 : 0.8, ease: EASE }}
          >
            <div className="flex items-center justify-between">
              <span className="font-serif text-2xl leading-none tracking-tight">
                David &amp; Angela
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="cursor-pointer font-serif text-2xl leading-none"
              >
                Close ×
              </button>
            </div>

            <nav
              aria-label="Menu"
              className="mt-[10svh] flex flex-1 flex-col gap-1"
            >
              {links.map((link, i) => (
                <span key={link.id} className="block overflow-hidden py-[0.06em]">
                  <motion.a
                    href={`#${link.id}`}
                    onClick={() => setOpen(false)}
                    className="block font-serif text-[16vw] leading-[1.02] tracking-tight"
                    initial={reduceMotion ? false : { y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.9,
                      delay: reduceMotion ? 0 : 0.25 + i * 0.07,
                      ease: EASE,
                    }}
                  >
                    {link.label}
                  </motion.a>
                </span>
              ))}
            </nav>

            <div className="flex flex-col gap-3 text-sm">
              <a href={`mailto:${EMAIL}`} className="underline-offset-4 hover:underline">
                {EMAIL}
              </a>
              <a
                href={`tel:${PHONE.replace(/\s/g, "")}`}
                className="underline-offset-4 hover:underline"
              >
                {PHONE}
              </a>
              <div className="flex gap-6">
                {social.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
