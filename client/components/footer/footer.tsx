"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Link from "next/link";

// How much of the remaining scroll the footer's content travels while it is
// revealed. Below 1 it rises a little slower than the page, so the page's edge
// keeps overlapping the top of the content (about 0.76 in the reference), and
// the overlap shrinks to nothing at the end. Closer to 1 = less overlap.
const FOOTER_PARALLAX = 0.8;

// PLACEHOLDER copy and contact details — replace with the real ones.
// Each statement line is a list of pieces; `italic` pieces are set in italic.
type Piece = { text: string; italic?: boolean };
const statements: Piece[][][] = [
  [
    [
      { text: "David & Angela", italic: true },
      { text: " is " },
      { text: "photography", italic: true },
      { text: "." },
    ],
    [
      { text: "David & Angela", italic: true },
      { text: " is " },
      { text: "storytelling", italic: true },
      { text: "." },
    ],
  ],
  [
    [
      { text: "We make " },
      { text: "beautiful", italic: true },
      { text: " work." },
    ],
    [{ text: "Come " }, { text: "create", italic: true }, { text: " with us." }],
  ],
];

const EMAIL = "hello@example.com";
const PHONE = "+63 000 000 0000";

type FooterLink = { label: string; href?: string; external?: boolean };
const columns: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "Explore",
    links: [
      { label: "Gallery", href: "#work" },
      { label: "Featured work", href: "#featured-work" },
      { label: "All work", href: "/work" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    // Plain text for now (no `href`): there is no page for each service yet.
    heading: "Services",
    links: [
      { label: "Debut & Birthday" },
      { label: "Outdoor Sessions" },
      { label: "Indoor Studio" },
      { label: "Event Coverage" },
    ],
  },
  {
    heading: "Connect",
    links: [
      { label: "Email", href: `mailto:${EMAIL}` },
      { label: "Phone", href: `tel:${PHONE.replace(/\s/g, "")}` },
      { label: "Instagram", href: "https://instagram.com/", external: true },
      { label: "Facebook", href: "https://facebook.com/", external: true },
    ],
  },
];

const linkClass =
  "text-base leading-tight underline-offset-4 hover:underline lg:text-[1.05vw]";

export function Footer() {
  const reduceMotion = useReducedMotion();

  // Curtain reveal (all sizes): the footer is pinned behind the page, and the
  // page slides up to uncover it. `left` is how many px of scrolling remain to
  // the end of the page, capped at the footer's height; null where the curtain
  // is off (reduced motion).
  const footerRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const uncovered = (y: number) => {
    const footer = footerRef.current;
    if (reduceMotion || !footer) return null;
    const height = footer.offsetHeight;
    const remaining =
      document.documentElement.scrollHeight - window.innerHeight - y;
    return { height, left: Math.min(height, Math.max(0, remaining)) };
  };
  // The footer's content is pushed down by (a fraction of) what is left to
  // scroll, so its top shows first and it rises into place, logo last, as the
  // page slides away. Because it rises slower than the page, the page's edge
  // keeps overlapping the top of the content until the very end.
  const shift = useTransform(
    scrollY,
    (y) => (uncovered(y)?.left ?? 0) * FOOTER_PARALLAX,
  );
  // While only partly uncovered it is dimmed by up to 22%, easing to nothing as
  // it is fully revealed, like the reference.
  const dim = useTransform(scrollY, (y) => {
    const u = uncovered(y);
    return u ? 0.22 * (u.left / u.height) : 0;
  });

  // Fade-in, tied to the same scroll amount so it moves with the rise (and
  // reverses on the way back up). `revealed` runs 0 → 1 as the footer is
  // uncovered; each part fades over its own stretch of it, so the footer builds
  // up: statements first, then the link columns, then the logo and small print.
  // Fully visible where the curtain is off (reduced motion).
  const revealed = (y: number) => {
    const u = uncovered(y);
    return u ? 1 - u.left / u.height : 1;
  };
  const ramp = (t: number, from: number, to: number) =>
    Math.min(1, Math.max(0, (t - from) / (to - from)));
  const fadeStatements = useTransform(scrollY, (y) => ramp(revealed(y), 0, 0.45));
  const fadeColumns = useTransform(scrollY, (y) => ramp(revealed(y), 0.1, 0.55));
  const fadeBottom = useTransform(scrollY, (y) => ramp(revealed(y), 0.4, 0.85));

  return (
    <footer
      ref={footerRef}
      // Pinned to the bottom of the screen, under the page (main is relative
      // z-10 with its own background), so the page slides up to uncover it.
      className="sticky bottom-0 z-0 overflow-hidden bg-[#e8e8e8] text-foreground"
    >
      {/* Dim while the footer is only partly uncovered */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-black"
        style={{ opacity: dim }}
      />

      {/* Everything below moves with the scroll (see `shift`). The padding and
          full-screen height live here so the layout is unchanged. */}
      <motion.div
        style={{ y: shift }}
        className="flex min-h-[100svh] flex-col justify-between px-4 pb-4 pt-[3svh] lg:px-[0.4vw] lg:pb-[0.4vw]"
      >
      {/* Top: statements at the left, link columns from the middle of the page */}
      <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-16">
        <motion.div
          style={{ opacity: fadeStatements }}
          className="flex flex-col gap-[3svh] font-serif text-[9vw] leading-[0.95] tracking-tight lg:text-[2.9vw]"
        >
          {statements.map((block, b) => (
            <p key={b}>
              {block.map((line, l) => (
                <span key={l} className="block">
                  {line.map((piece, p) => (
                    <span key={p} className={piece.italic ? "italic" : ""}>
                      {piece.text}
                    </span>
                  ))}
                </span>
              ))}
            </p>
          ))}
        </motion.div>

        <motion.nav
          aria-label="Footer"
          style={{ opacity: fadeColumns }}
          className="grid grid-cols-2 gap-x-6 gap-y-10 lg:w-[50vw] lg:grid-cols-3 lg:gap-0"
        >
          {columns.map((column) => (
            <div key={column.heading}>
              <h2 className="mb-[1.6vw] text-xs">{column.heading}</h2>
              <ul className="flex flex-col gap-2 lg:gap-[0.5vw]">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {!link.href ? (
                      <span
                        className={`${linkClass} text-muted-foreground hover:no-underline`}
                      >
                        {link.label}
                      </span>
                    ) : link.href.startsWith("/") ? (
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className={linkClass}
                        {...(link.external
                          ? { target: "_blank", rel: "noreferrer" }
                          : {})}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.nav>
      </div>

      {/* Bottom: the giant logo flush with the bottom-left corner, the small
          print at the right. */}
      <motion.div
        style={{ opacity: fadeBottom }}
        className="mt-12 flex flex-col gap-6 lg:mt-24 lg:flex-row lg:items-end lg:justify-between"
      >
        <p
          aria-hidden
          className="font-display text-[30vw] leading-none tracking-tight [text-box:trim-both_cap_alphabetic] sm:text-[24vw] lg:text-[20vw]"
        >
          D&amp;A
        </p>

        {/* On phones this sits under the logo, with the link at the left and
            the copyright at the right; from lg up it is at the logo's right. */}
        <div className="flex shrink-0 items-end justify-between gap-6 text-xs lg:flex-col lg:items-end lg:gap-3 lg:text-right">
          <a href="#top" className="underline-offset-4 hover:underline">
            Back to top ↑
          </a>
          <p>
            © {new Date().getFullYear()} David &amp; Angela Imagery.
            <br />
            All rights reserved.
          </p>
        </div>
      </motion.div>
      </motion.div>
    </footer>
  );
}
