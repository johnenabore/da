"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Same ease-out-expo as the rest of the site.
const EASE = [0.16, 1, 0.3, 1] as const;
// Same soft ease as the gallery's hover.
const SOFT = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// PLACEHOLDER contact details — replace with the real ones.
const CONTACT_EMAIL = "hello@example.com";
const details = [
  { label: "Email", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { label: "Phone", value: "+63 000 000 0000", href: "tel:+630000000000" },
  { label: "Studio", value: "Liliw, Laguna" },
];

const eventTypes = [
  "Debut & Birthday",
  "Outdoor Sessions",
  "Indoor Studio",
  "Event Coverage",
  "Something else",
];

const titleVariants = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 1.2, ease: EASE } },
};

// Underline-style fields: no box, a hairline that darkens on focus.
const fieldClass = `w-full border-b border-foreground/30 bg-transparent py-3 text-sm text-foreground outline-none transition-colors duration-700 ${SOFT} placeholder:text-muted-foreground focus:border-foreground`;
const labelClass = "mb-1 block text-xs uppercase";

export function Contact() {
  const reduceMotion = useReducedMotion();
  const [opened, setOpened] = useState(false);

  // Rise-and-fade when scrolled into view (nothing for reduced motion).
  const rise = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 40 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.15 },
          transition: { duration: 1.1, delay, ease: EASE },
        };

  // There is no server behind the form yet, so submitting opens the visitor's
  // email app with the message filled in, addressed to CONTACT_EMAIL.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = `Inquiry: ${data.get("type")}`;
    const body = [
      `Name: ${data.get("name")}`,
      `Email: ${data.get("email")}`,
      `Event date: ${data.get("date") || "not set yet"}`,
      "",
      `${data.get("message")}`,
    ].join("\n");
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  return (
    <section
      id="contact"
      className="relative w-full overflow-x-clip pb-[15svh] pt-[20svh]"
    >
      {/* Title, flush with the grid's left margin like Featured work */}
      <motion.h2
        className="px-4 font-serif text-[14vw] leading-none tracking-tight text-foreground lg:px-[0.4vw] lg:text-[6.8vw]"
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.8 }}
      >
        <span className="block overflow-hidden pb-[0.12em] mb-[-0.12em]">
          <motion.span
            className="block"
            variants={reduceMotion ? undefined : titleVariants}
          >
            Let&apos;s work together
          </motion.span>
        </span>
      </motion.h2>

      {/* Details on gallery column 2 (25.6vw); the form spans columns 3–4
          (51.6vw), with the gallery's 0.4vw gap between them. */}
      <div className="mt-[10svh] flex flex-col gap-16 px-4 lg:ml-[11.2vw] lg:flex-row lg:gap-[0.4vw] lg:px-0">
        <div className="lg:w-[25.6vw]">
          <motion.p
            {...rise()}
            className="mb-6 flex items-center gap-2 text-xs text-foreground"
          >
            <span aria-hidden>+</span>
            Contact
          </motion.p>
          <ul className="border-b border-foreground/15 text-sm">
            {details.map((item, i) => (
              <motion.li
                key={item.label}
                {...rise(0.1 + i * 0.08)}
                className="flex items-baseline justify-between gap-6 border-t border-foreground/15 py-3"
              >
                <span className="text-xs uppercase text-muted-foreground">
                  {item.label}
                </span>
                {item.href ? (
                  <a
                    href={item.href}
                    className="underline-offset-4 hover:underline"
                  >
                    {item.value}
                  </a>
                ) : (
                  <span>{item.value}</span>
                )}
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.form
          {...rise(0.1)}
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-x-8 gap-y-8 lg:w-[51.6vw] lg:grid-cols-2"
        >
          <div>
            <label htmlFor="contact-name" className={labelClass}>
              Name
            </label>
            <input
              id="contact-name"
              name="name"
              required
              autoComplete="name"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="contact-email" className={labelClass}>
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="contact-type" className={labelClass}>
              What are we shooting?
            </label>
            <select
              id="contact-type"
              name="type"
              defaultValue={eventTypes[0]}
              className={`${fieldClass} cursor-pointer`}
            >
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="contact-date" className={labelClass}>
              Event date
            </label>
            <input
              id="contact-date"
              name="date"
              type="date"
              className={fieldClass}
            />
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="contact-message" className={labelClass}>
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={4}
              className={`${fieldClass} resize-none`}
            />
          </div>
          <div className="flex items-center gap-6 lg:col-span-2">
            <button
              type="submit"
              className={`group flex cursor-pointer items-center gap-6 border border-foreground px-8 py-3 text-sm text-foreground transition-colors duration-900 ${SOFT} hover:bg-foreground hover:text-background`}
            >
              Send inquiry
              <span
                aria-hidden
                className={`transition-transform duration-900 ${SOFT} group-hover:rotate-90`}
              >
                +
              </span>
            </button>
            {opened && (
              <p className="text-xs text-muted-foreground" role="status">
                Opening your email app with the message filled in.
              </p>
            )}
          </div>
        </motion.form>
      </div>
    </section>
  );
}
