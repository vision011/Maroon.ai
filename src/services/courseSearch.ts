import snapshot from "@/data/his-fall-2026.json";

/**
 * Searches the Fall 2026 Historical Perspectives snapshot (scripts/build-his-snapshot.mjs).
 * Server-only: imported by the assistant server function, so the 120 KB file never ships
 * to the browser.
 */

type Snapshot = typeof snapshot;
type Course = Snapshot["courses"][number];
type Section = Course["sections"][number];

export interface CourseSearchInput {
  /** Other requirement tags the course should also carry, e.g. ["WI"] or ["GP"]. */
  alsoCountsFor?: string[];
  /** Lectures must end strictly before this "HH:MM" 24-hour time, e.g. "17:00" for a 5 PM shift. */
  endsBefore?: string;
  /** Days the student can't attend, e.g. ["Fri"]. */
  avoidDays?: string[];
  /** Highest course level, e.g. 3000 for 3xxx and below. */
  maxLevel?: number;
  onlineOnly?: boolean;
  limit?: number;
}

/** JSON schema handed to Claude; mirrors CourseSearchInput. */
export const COURSE_SEARCH_TOOL = {
  name: "search_courses",
  description:
    `Find ${snapshot.term} Twin Cities courses that count for the Historical Perspectives (HIS) ` +
    "Liberal Education requirement, below the 4000 level. Returns the best matches with " +
    "lecture times, other requirement tags (WI = writing intensive, GP = global perspectives, " +
    "DSJ = diversity and social justice, ENV = environment, CIV = civic life), past grade " +
    "stats (aRate = share of letter grades that were A or A-) and student survey ratings " +
    "(wouldRecommend, 1–6 scale). Use it whenever the student asks which history or HIS " +
    "course to take.",
  input_schema: {
    type: "object" as const,
    properties: {
      alsoCountsFor: {
        type: "array",
        items: { type: "string" },
        description: 'Requirement tags the course must also carry, e.g. ["WI"].',
      },
      endsBefore: {
        type: "string",
        description:
          'Lectures must end strictly before this 24-hour "HH:MM" time, e.g. "17:00" for a student who starts work at 5 PM.',
      },
      avoidDays: {
        type: "array",
        items: { type: "string", enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
      },
      maxLevel: { type: "integer", description: "Highest course level, e.g. 2000 or 3000." },
      onlineOnly: { type: "boolean" },
      limit: { type: "integer", description: "How many courses to return (default 5, max 8)." },
    },
    additionalProperties: false,
  },
};

function level(code: string): number {
  const digits = code.split(" ")[1]?.replace(/\D/g, "").slice(0, 4) ?? "";
  return Number(digits) || 0;
}

function sectionFits(section: Section, input: CourseSearchInput): boolean {
  const online = section.mode === "Completely Online";
  if (input.onlineOnly && !online) return false;
  if (input.avoidDays?.some((d) => (section.days as string[]).includes(d))) return false;
  // Online sections without set meeting times always fit the schedule.
  if (input.endsBefore && section.end && section.end >= input.endsBefore) return false;
  return true;
}

/** Validates Claude's tool input; unknown or mistyped fields are dropped, not trusted. */
export function parseCourseSearchInput(raw: unknown): CourseSearchInput {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const strings = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : undefined;
  const parsed: CourseSearchInput = {};
  const also = strings(input["alsoCountsFor"]);
  if (also?.length) parsed.alsoCountsFor = also.map((t) => t.toUpperCase());
  const avoid = strings(input["avoidDays"]);
  if (avoid?.length) parsed.avoidDays = avoid;
  const endsBefore = input["endsBefore"];
  if (typeof endsBefore === "string" && /^\d{2}:\d{2}$/.test(endsBefore)) {
    parsed.endsBefore = endsBefore;
  }
  if (typeof input["maxLevel"] === "number") parsed.maxLevel = input["maxLevel"];
  if (typeof input["onlineOnly"] === "boolean") parsed.onlineOnly = input["onlineOnly"];
  if (typeof input["limit"] === "number") parsed.limit = input["limit"];
  return parsed;
}

export function searchCourses(input: CourseSearchInput) {
  // "3000" means 3xxx and below; the snapshot itself stops at 3999.
  const requested = input.maxLevel ?? 3999;
  const maxLevel = Math.min(requested % 1000 === 0 ? requested + 999 : requested, 3999);
  const limit = Math.min(Math.max(input.limit ?? 5, 1), 8);

  const matches = snapshot.courses.flatMap((course) => {
    if (level(course.code) > maxLevel) return [];
    if (input.alsoCountsFor?.some((tag) => !course.attributes.includes(tag))) return [];
    const sections = course.sections.filter((s) => sectionFits(s, input));
    return sections.length ? [{ ...course, sections }] : [];
  });

  // Best-supported picks first: highest A rate, then highest recommend score; courses
  // with no history go last rather than being dropped.
  matches.sort(
    (a, b) =>
      (b.grades?.aRate ?? -1) - (a.grades?.aRate ?? -1) ||
      (b.ratings?.wouldRecommend ?? -1) - (a.ratings?.wouldRecommend ?? -1),
  );

  return {
    term: snapshot.term,
    totalMatches: matches.length,
    courses: matches.slice(0, limit).map((c) => ({
      code: c.code,
      title: c.title,
      credits: c.credits,
      attributes: c.attributes.filter((a) => a !== "ONLINE"),
      sections: c.sections.slice(0, 3),
      grades: c.grades,
      ratings: c.ratings,
    })),
  };
}
