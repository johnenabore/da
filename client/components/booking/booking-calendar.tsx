"use client";

import { useState, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Same ease-out-expo as the rest of the site.
const EASE = [0.16, 1, 0.3, 1] as const;
// Same soft ease as the gallery's hover.
const SOFT = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// DESIGN ONLY for now: SAMPLE booked dates, copied from the reference calendar
// (key = YYYY-MM-DD, value = number of shoots that day, shown as cameras).
// Later this can be filled from the studio's real calendar feed instead.
const bookedDates: Record<string, number> = {
  "2026-09-29": 1,
  "2026-10-02": 1,
  "2026-10-03": 2,
  "2026-10-05": 1,
  "2026-10-16": 1,
  "2026-10-17": 2,
  "2026-10-24": 1,
};

// Fine diagonal stripes: the fill of a booked day (and the legend swatch), so
// booked reads at a glance against plain free and past days.
const HATCH = {
  backgroundImage:
    "repeating-linear-gradient(135deg, transparent 0 5px, rgba(0,0,0,0.09) 5px 6px)",
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

// The cells of a month's grid: only the weeks the month needs (4 to 6), with
// the days of the neighbouring months filling the first and last week.
function buildCells(year: number, month: number) {
  const startOffset = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = Math.ceil((startOffset + daysInMonth) / 7);
  return Array.from({ length: weeks * 7 }, (_, i) => {
    const date = new Date(year, month, 1 - startOffset + i);
    return {
      y: date.getFullYear(),
      m: date.getMonth(),
      d: date.getDate(),
      inMonth: date.getMonth() === month,
    };
  });
}

// Today's date. The server and the first client render use a fixed date, and
// the browser then switches to the real one, so they can't disagree.
const subscribeNever = () => () => {};
const useTodayIso = () =>
  useSyncExternalStore(
    subscribeNever,
    () => {
      const now = new Date();
      return toIso(now.getFullYear(), now.getMonth(), now.getDate());
    },
    () => "2026-10-03",
  );

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7H8l1.2-2h5.6L16 7h3.5A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
      <circle cx="12" cy="13" r="3.4" />
    </svg>
  );
}

const titleVariants = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 1.2, ease: EASE } },
};

export function BookingCalendar() {
  const reduceMotion = useReducedMotion() ?? false;
  const todayIso = useTodayIso();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  // The month on show: today's month, moved by the arrows.
  const [ty, tm] = todayIso.split("-").map(Number);
  const view = new Date(ty, tm - 1 + monthOffset, 1);
  const year = view.getFullYear();
  const month = view.getMonth();
  const cells = buildCells(year, month);

  const selectedLabel = selected
    ? new Date(selected + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : null;

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

  const arrowClass = `flex size-10 cursor-pointer items-center justify-center border border-foreground text-sm text-foreground transition-colors duration-700 ${SOFT} hover:bg-foreground hover:text-background`;

  return (
    <section
      id="availability"
      className="relative w-full overflow-x-clip pb-[14svh] pt-[6svh]"
    >
      {/* Title row: the title at the left, the legend at the right */}
      <div className="flex flex-col gap-6 px-4 lg:flex-row lg:items-end lg:justify-between lg:px-[0.4vw]">
        <motion.h2
          className="font-serif text-[14vw] leading-none tracking-tight text-foreground lg:text-[6.8vw]"
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.8 }}
        >
          <span className="mb-[-0.12em] block overflow-hidden pb-[0.12em]">
            <motion.span
              className="block"
              variants={reduceMotion ? undefined : titleVariants}
            >
              Availability
            </motion.span>
          </span>
        </motion.h2>

        <motion.ul
          {...rise(0.1)}
          className="flex gap-6 pb-[0.6vw] text-xs text-foreground"
          aria-label="Legend"
        >
          <li className="flex items-center gap-2">
            <span className="size-5 border border-foreground/40" aria-hidden />
            Available
          </li>
          <li className="flex items-center gap-2">
            <span
              className="flex size-5 items-center justify-center border border-foreground/40"
              style={HATCH}
              aria-hidden
            >
              <CameraIcon className="size-3.5" />
            </span>
            Booked
          </li>
        </motion.ul>
      </div>

      {/* The calendar spans gallery columns 2–4 (77.6vw) */}
      <motion.div
        {...rise(0.15)}
        className="mt-[8svh] px-4 lg:ml-[11.2vw] lg:w-[77.6vw] lg:px-0"
      >
        {/* Month and controls */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <motion.h3
            key={`${year}-${month}`}
            className="font-serif text-[10vw] leading-none tracking-tight text-foreground lg:text-[3vw]"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            aria-live="polite"
          >
            {MONTHS[month]} <span className="italic">{year}</span>
          </motion.h3>

          <div className="flex items-center justify-between gap-6 lg:justify-end">
            {/* The picked day, beside the controls */}
            <p className="text-xs text-foreground" aria-live="polite">
              {selectedLabel ? (
                <>
                  <span className="text-muted-foreground">Selected </span>
                  {selectedLabel}
                </>
              ) : (
                <span className="text-muted-foreground">
                  Pick a free day to see it here.
                </span>
              )}
            </p>
            <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setMonthOffset((o) => o - 1)}
              className={arrowClass}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => setMonthOffset(0)}
              className={`h-10 cursor-pointer border border-foreground px-4 text-xs uppercase text-foreground transition-colors duration-700 ${SOFT} hover:bg-foreground hover:text-background`}
            >
              Today
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setMonthOffset((o) => o + 1)}
              className={arrowClass}
            >
              →
            </button>
            </div>
          </div>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 border-b border-foreground/15 pb-2 text-right text-[10px] uppercase text-muted-foreground lg:text-xs">
          {WEEKDAYS.map((day) => (
            <span key={day} className="pr-2 lg:pr-3">
              {day}
            </span>
          ))}
        </div>

        {/* Days: hairline grid; booked days carry cameras, free days invert on
            hover, and a picked day stays black. */}
        <motion.div
          key={`${year}-${month}-grid`}
          className="grid grid-cols-7 border-b border-r border-foreground/15"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {cells.map((cell) => {
            const key = toIso(cell.y, cell.m, cell.d);
            const shoots = bookedDates[key] ?? 0;
            const isPast = key < todayIso;
            const isToday = key === todayIso;
            const isBooked = shoots > 0;
            const canPick = cell.inMonth && !isPast && !isBooked;
            const isSelected = selected === key;
            const label = `${MONTHS[cell.m]} ${cell.d}, ${cell.y}${
              isBooked ? ", booked" : isPast ? ", past" : ", available"
            }`;
            return (
              <button
                key={key}
                type="button"
                disabled={!canPick}
                aria-label={label}
                aria-pressed={canPick ? isSelected : undefined}
                onClick={() => setSelected(isSelected ? null : key)}
                style={isBooked && cell.inMonth ? HATCH : undefined}
                className={`flex min-h-[12vw] flex-col items-end justify-between border-l border-t border-foreground/15 p-2 text-right transition-colors duration-700 ${SOFT} lg:min-h-[5vw] lg:p-[0.8vw] ${
                  isSelected
                    ? "bg-foreground text-background"
                    : canPick
                      ? "cursor-pointer text-foreground hover:bg-foreground hover:text-background"
                      : isBooked && cell.inMonth
                        ? "cursor-not-allowed text-foreground"
                        : "cursor-default text-muted-foreground/60"
                }`}
              >
                <span
                  className={`text-xs lg:text-[1vw] ${
                    isToday && !isSelected
                      ? "rounded-full bg-foreground px-2 py-0.5 text-background"
                      : ""
                  } ${isBooked && cell.inMonth ? "line-through decoration-1" : ""}`}
                >
                  {cell.d === 1 ? `${MONTHS[cell.m].slice(0, 3)} 1` : cell.d}
                </span>
                {isBooked && (
                  <span
                    className="flex items-center gap-1 self-start"
                    aria-hidden
                  >
                    {Array.from({ length: shoots }, (_, i) => (
                      <CameraIcon
                        key={i}
                        className="size-[18px] lg:size-[1.6vw]"
                      />
                    ))}
                    <span className="ml-1 hidden text-[10px] uppercase tracking-wide lg:inline">
                      {shoots > 1 ? `${shoots} shoots` : "Booked"}
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
