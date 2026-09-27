import { createServerFn } from "@tanstack/react-start";
import type { AcademicItem, Course } from "@/types";

/**
 * Server-only Canvas LMS access. CANVAS_API_TOKEN stays on the server (local: .env,
 * deployed: a project secret). Each function returns null when Canvas isn't configured
 * or the request fails, so callers can fall back to mock data.
 */

const UPCOMING_DAYS = 14;

interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  term?: { end_at: string | null };
  teachers?: { display_name: string }[];
  enrollments?: {
    type: string;
    computed_current_grade?: string | null;
    computed_current_score?: number | null;
  }[];
}

interface CanvasPlannerItem {
  plannable_id: number;
  plannable_type: string;
  plannable_date: string;
  context_name?: string;
  plannable: { title: string };
  submissions?: { submitted?: boolean } | false;
}

async function canvasGet<T>(path: string): Promise<T | null> {
  const baseUrl = process.env["CANVAS_BASE_URL"];
  const token = process.env["CANVAS_API_TOKEN"];
  if (!baseUrl || !token) return null;
  try {
    const res = await fetch(`${baseUrl}/api/v1${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      console.error(`[canvas] GET ${path} failed: ${res.status} ${res.statusText}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(`[canvas] GET ${path} failed:`, error);
    return null;
  }
}

/** "CSCI 4821 (001)" → "CSCI 4821" */
function shortCode(courseCode: string): string {
  return courseCode.replace(/\s*\(.*\)\s*$/, "");
}

/** "CSCI 4821 (001) GenAI for Software Engineering (Fall 2026)" → "GenAI for Software Engineering" */
function courseTitle(course: CanvasCourse): string {
  return (
    course.name
      .replace(course.course_code, "")
      .replace(/\s*\((Fall|Spring|Summer|Winter)\s+\d{4}\)\s*$/, "")
      .trim() || course.name
  );
}

function itemType(item: CanvasPlannerItem): AcademicItem["type"] {
  if (/\b(exam|midterm|final)\b/i.test(item.plannable.title)) return "exam";
  if (item.plannable_type === "quiz") return "quiz";
  if (/\blab\b/i.test(item.plannable.title)) return "lab";
  return "assignment";
}

export const getCanvasCourses = createServerFn({ method: "GET" }).handler(
  async (): Promise<Course[] | null> => {
    const courses = await canvasGet<CanvasCourse[]>(
      "/courses?enrollment_state=active&per_page=100&include[]=term&include[]=teachers&include[]=total_scores",
    );
    if (!courses) return null;

    const now = Date.now();
    return courses
      .filter((c) => c.term?.end_at && Date.parse(c.term.end_at) > now)
      .filter((c) => c.enrollments?.some((e) => e.type === "student"))
      .map((c) => {
        const enrollment = c.enrollments?.find((e) => e.type === "student");
        const score = enrollment?.computed_current_score;
        const grade =
          enrollment?.computed_current_grade ?? (score != null ? `${Math.round(score)}%` : null);
        const course: Course = {
          id: String(c.id),
          code: shortCode(c.course_code),
          title: courseTitle(c),
          instructor: c.teachers?.[0]?.display_name ?? "",
        };
        if (grade) course.grade = grade;
        return course;
      })
      .sort((a, b) => a.code.localeCompare(b.code));
  },
);

export const getCanvasAssignments = createServerFn({ method: "GET" }).handler(
  async (): Promise<AcademicItem[] | null> => {
    const start = new Date();
    const end = new Date(start.getTime() + UPCOMING_DAYS * 86_400_000);
    const items = await canvasGet<CanvasPlannerItem[]>(
      `/planner/items?start_date=${start.toISOString()}&end_date=${end.toISOString()}&per_page=100`,
    );
    if (!items) return null;

    return items
      .filter((i) => ["assignment", "quiz", "discussion_topic"].includes(i.plannable_type))
      .filter((i) => !(i.submissions && i.submissions.submitted))
      .map((i) => ({
        id: `canvas-${i.plannable_type}-${i.plannable_id}`,
        courseCode: shortCode(i.context_name ?? "Canvas"),
        title: i.plannable.title,
        dueDate: i.plannable_date,
        location: "Canvas",
        type: itemType(i),
      }));
  },
);
