/**
 * Demo persona: Sophia Rodriguez, a junior in B.S. Computer Science. While on, academics come
 * from the curated mock data instead of the live Canvas account in .env, so every screen tells
 * her story. Set to false to show real Canvas data again.
 */
export const DEMO_MODE = true;

/** ISO timestamp `days` from today at a fixed local time, so demo dates always look real. */
export function demoDate(days: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
