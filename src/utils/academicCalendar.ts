import calendar from "@/data/fall-2026-calendar.json";

/**
 * The next fall tuition due date on or after `today`, as an ISO timestamp at 11:59 PM
 * local time, or null once the last fall payment date has passed.
 */
export function nextPaymentDue(today: Date = new Date()): string | null {
  const day = today.toISOString().slice(0, 10);
  const next = calendar.events.find((e) => e.category === "payment-due" && e.date >= day);
  return next ? new Date(`${next.date}T23:59:00`).toISOString() : null;
}

/** The most recent fall tuition due date before `today`, or null if none has passed yet. */
export function lastPaymentDue(today: Date = new Date()): string | null {
  const day = today.toISOString().slice(0, 10);
  const past = calendar.events.filter((e) => e.category === "payment-due" && e.date < day);
  const last = past.at(-1);
  return last ? new Date(`${last.date}T23:59:00`).toISOString() : null;
}
