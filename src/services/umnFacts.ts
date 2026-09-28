import calendar from "@/data/fall-2026-calendar.json";

/**
 * UMN Twin Cities rules and dates Goldy may state as fact, each from an official One Stop
 * page. Sent with every question, so keep it short. Server-only.
 */

const RULES = `
UMN Twin Cities rules (official; you may state these):
- Late tuition payment: a $40 late fee for each billing cycle the bill isn't paid, plus a hold on the student record. Holds can block registration, bookstore charges and financial aid. (onestop.umn.edu/finances/billing-and-payment/late-payment-consequences)
- Payment plan: split fall or spring charges into 3 installments for a $20 fee per semester. Needs an amount due of $300 or more and degree-seeking status; enroll each semester in MyU > My Finances. (onestop.umn.edu/finances/billing-and-payment/payment-plan)
- The student's exact amount due is in MyU > My Finances.
- Parents or guests can view and pay the bill once the student authorizes them (One Stop: "Authorize access to your student record"). (family.umn.edu/billing-tuition)
- Transfer students who completed the Minnesota Transfer Curriculum (MnTC) have finished the Liberal Education core and theme requirements, but still need writing-intensive (WI) courses. (cla.umn.edu, transfer Liberal Education credits)
`.trim();

/** Formats "2026-09-24" as "Thu Sep 24", read as a calendar date (no timezone shift). */
function shortDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

const CALENDAR = [
  `${calendar.term} academic calendar (official, ${calendar.source}). Compare dates with today's date in the student data before saying something is still possible:`,
  ...calendar.events.map((e) => `- ${shortDate(e.date)}: ${e.event}`),
].join("\n");

export const UMN_FACTS = `${RULES}\n\n${CALENDAR}`;
