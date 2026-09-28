#!/usr/bin/env node
/**
 * Builds src/data/his-fall-2026.json: every Fall 2026 Twin Cities course that counts for
 * Historical Perspectives (HIS) below the 4000 level, with its lecture times and, where
 * Gopher Grades has them, past grade and student-rating stats. Goldy's course search reads
 * this file, so the demo never calls UMN or Gopher Grades live.
 *
 *   node scripts/build-his-snapshot.mjs
 *
 * Sources:
 *   - UMN class search: courses.umn.edu (term 1269 = Fall 2026)
 *   - Gopher Grades (umn.lol, run by Social Coding): grades from a UMN public records
 *     request, ratings from UMN's end-of-term student surveys. Its Rate My Professors
 *     fields are deliberately left out (RMP's terms forbid scraping).
 */
import { mkdir, writeFile } from "node:fs/promises";

const TERM = { code: "1269", name: "Fall 2026" };
const CATALOG_URL = `https://courses.umn.edu/campuses/umntc/terms/${TERM.code}/courses.json?q=course_attribute_id=HIS`;
const GRADES_URL = (code) => `https://umn.lol/api/class/${code}`;
const OUT = new URL("../src/data/his-fall-2026.json", import.meta.url);

/** Pause between Gopher Grades requests so the run stays polite (~100 requests). */
const DELAY_MS = 150;
const LETTER_GRADES = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"];
const DAY = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const round = (n, digits = 2) => Math.round(n * 10 ** digits) / 10 ** digits;

async function getJson(url) {
  const res = await fetch(url, { headers: { "user-agent": "maroon-ai-snapshot (hackathon)" } });
  if (!res.ok) throw new Error(`${res.status} from ${url}`);
  return res.json();
}

function toSection(section) {
  const meetings = section.meeting_patterns ?? [];
  const first = meetings[0];
  const place = first?.location?.description;
  return {
    number: section.number,
    component: section.component,
    mode: section.instruction_mode?.description ?? null,
    days: [...new Set(meetings.flatMap((m) => (m.days ?? []).map((d) => DAY[d.name] ?? d.name)))],
    start: first?.start_time || null,
    end: first?.end_time || null,
    location: place && place !== "No Print" ? place : null,
    instructors: (section.instructors ?? []).filter((i) => i.role === "PI").map((i) => i.name),
  };
}

/** Grade and rating stats from a Gopher Grades class record, or null when it has none. */
function toStats(record) {
  if (!record) return { grades: null, ratings: null };
  const totals = record.total_grades ?? {};
  const lettered = LETTER_GRADES.reduce((sum, g) => sum + (totals[g] ?? 0), 0);
  const all = Object.values(totals).reduce((sum, n) => sum + n, 0);
  const grades =
    lettered > 0
      ? {
          students: record.total_students,
          aRate: round(((totals.A ?? 0) + (totals["A-"] ?? 0)) / lettered),
          withdrawRate: all > 0 ? round((totals.W ?? 0) / all) : null,
        }
      : null;

  let ratings = null;
  const srt = typeof record.srt_vals === "string" ? JSON.parse(record.srt_vals) : record.srt_vals;
  if (srt?.RECC) {
    ratings = {
      // UMN student survey averages, on a 1–6 scale.
      wouldRecommend: round(srt.RECC, 1),
      deeperUnderstanding: round(srt.DEEP_UND, 1),
      responses: srt.RESP ?? null,
    };
  }
  return { grades, ratings };
}

async function main() {
  console.log(`Fetching ${TERM.name} HIS courses…`);
  const catalog = await getJson(CATALOG_URL);

  const offered = catalog.courses.filter(
    (c) => c.sections.length > 0 && Number(c.catalog_number.slice(0, 4).replace(/\D/g, "")) < 4000,
  );
  console.log(`${offered.length} offered below the 4000 level. Adding Gopher Grades stats…`);

  const courses = [];
  let withStats = 0;
  for (const course of offered) {
    const subject = course.subject.subject_id;
    const code = `${subject} ${course.catalog_number}`;
    let record = null;
    try {
      record = (await getJson(GRADES_URL(`${subject}${course.catalog_number}`))).data ?? null;
    } catch {
      // New or renumbered courses have no history on Gopher Grades.
    }
    const stats = toStats(record);
    if (stats.grades) withStats += 1;

    const lectures = course.sections.filter((s) => s.component === "LEC");
    const min = course.credits_minimum;
    const max = course.credits_maximum;
    courses.push({
      code,
      title: course.title,
      credits: min === max ? min : `${min}–${max}`,
      attributes: course.course_attributes.map((a) => a.attribute_id),
      description:
        course.description.length > 240
          ? `${course.description.slice(0, 237)}…`
          : course.description,
      sections: (lectures.length ? lectures : course.sections).map(toSection),
      ...stats,
    });
    await sleep(DELAY_MS);
  }

  courses.sort((a, b) => a.code.localeCompare(b.code));
  const snapshot = {
    term: TERM.name,
    termCode: TERM.code,
    generatedAt: new Date().toISOString(),
    sources: {
      catalog: CATALOG_URL,
      grades: "https://umn.lol (Gopher Grades by Social Coding; UMN public records data)",
    },
    courses,
  };

  await mkdir(new URL(".", OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(
    `Wrote ${courses.length} courses (${withStats} with grade stats) to src/data/his-fall-2026.json`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
