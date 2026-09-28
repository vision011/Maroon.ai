import { mockRequest } from "./api";
import { getCanvasAssignments, getCanvasCourses } from "./canvas.functions";
import { canvasService } from "./canvasService";
import { DEMO_MODE, demoDate } from "./demo";
import type { AcademicItem, Course } from "@/types";

const ASSIGNMENTS: AcademicItem[] = [
  {
    id: "a1",
    courseCode: "CSCI 4061",
    title: "Project 1: Multi-process Mapper",
    dueDate: demoDate(1, 23, 59),
    location: "Canvas submission",
    type: "assignment",
  },
  {
    id: "a2",
    courseCode: "CSCI 4041",
    title: "Homework 2: Asymptotic Analysis",
    dueDate: demoDate(3, 23, 59),
    location: "Gradescope",
    type: "assignment",
  },
  {
    id: "a3",
    courseCode: "STAT 3021",
    title: "Quiz 3: Conditional Probability",
    dueDate: demoDate(4, 11, 15),
    location: "Canvas quiz",
    type: "quiz",
  },
];

const COURSES: Course[] = [
  {
    id: "c1",
    code: "CSCI 4041",
    title: "Algorithms and Data Structures",
    instructor: "Prof. Daniel Kluver",
    credits: 4,
    meetingTime: "MWF 09:05–09:55",
    location: "Amundson Hall B75",
    grade: "A",
  },
  {
    id: "c2",
    code: "CSCI 4061",
    title: "Introduction to Operating Systems",
    instructor: "Prof. Jon Weissman",
    credits: 4,
    meetingTime: "MWF 10:10–11:00",
    location: "Keller Hall 3-210",
    grade: "A-",
  },
  {
    id: "c3",
    code: "CSCI 4131",
    title: "Internet Programming",
    instructor: "Prof. Dan Challou",
    credits: 3,
    meetingTime: "TuTh 14:30–15:45",
    location: "Keller Hall 3-125",
    grade: "B+",
  },
  {
    id: "c4",
    code: "STAT 3021",
    title: "Introduction to Probability and Statistics",
    instructor: "Prof. Galin Jones",
    credits: 3,
    meetingTime: "TuTh 11:15–12:30",
    location: "Vincent Hall 16",
    grade: "A-",
  },
];

/** Liberal Education requirements still open on the student's degree audit (APAS). */
const REQUIREMENTS = {
  program: "B.S. Computer Science, College of Science and Engineering",
  year: "Junior",
  liberalEducationRemaining: ["Historical Perspectives (HIS)"],
  liberalEducationDone: [
    "Arts/Humanities",
    "Biological Sciences",
    "Literature",
    "Mathematical Thinking",
    "Physical Sciences",
    "Social Sciences",
    "Writing Intensive (WI) x2 of 4",
  ],
};

/**
 * Canvas data when the student has connected Canvas with their own token. Without one, the
 * server's CANVAS_API_TOKEN is used, or the demo data while DEMO_MODE is on. `canvasToken`
 * defaults to this browser's token; server callers pass the one the client sent.
 */
/** The student's token, null to use the server's token, or undefined to skip Canvas. */
function canvasTokenFor(canvasToken: string | null | undefined): string | null | undefined {
  const token = canvasToken === undefined ? canvasService.token() : canvasToken;
  return token || (DEMO_MODE ? undefined : null);
}

export const academicsService = {
  async getAssignments(canvasToken?: string | null): Promise<AcademicItem[]> {
    const token = canvasTokenFor(canvasToken);
    const live = token === undefined ? null : await getCanvasAssignments({ data: token });
    return live ?? mockRequest("/academics/assignments", ASSIGNMENTS);
  },
  async getCourses(canvasToken?: string | null): Promise<Course[]> {
    const token = canvasTokenFor(canvasToken);
    const live = token === undefined ? null : await getCanvasCourses({ data: token });
    return live ?? mockRequest("/academics/courses", COURSES);
  },
  getRequirements: (): Promise<typeof REQUIREMENTS> =>
    mockRequest("/academics/requirements", REQUIREMENTS),
};
