import { mockRequest } from "./api";
import { getCanvasAssignments, getCanvasCourses } from "./canvas.functions";
import type { AcademicItem, Course } from "@/types";

const ASSIGNMENTS: AcademicItem[] = [
  {
    id: "a1",
    courseCode: "CSCI 4061",
    title: "Project 2: Shell Implementation",
    dueDate: daysFromNow(2),
    location: "Canvas submission",
    type: "assignment",
  },
  {
    id: "a2",
    courseCode: "MATH 2374",
    title: "Midterm Exam 2",
    dueDate: daysFromNow(5),
    location: "Tate Hall 101",
    type: "exam",
  },
  {
    id: "a3",
    courseCode: "CSCI 4041",
    title: "Homework 6: Graph Algorithms",
    dueDate: daysFromNow(1),
    location: "Gradescope",
    type: "assignment",
  },
];

const COURSES: Course[] = [
  {
    id: "c1",
    code: "CSCI 4061",
    title: "Introduction to Operating Systems",
    instructor: "Prof. Jon Weissman",
    credits: 4,
    meetingTime: "MWF 10:10–11:00",
    location: "Keller Hall 3-210",
    grade: "A-",
  },
  {
    id: "c2",
    code: "MATH 2374",
    title: "Multivariable Calculus & Vector Analysis",
    instructor: "Prof. Anne Kelley",
    credits: 4,
    meetingTime: "TuTh 13:00–14:15",
    location: "Vincent Hall 16",
    grade: "B+",
  },
  {
    id: "c3",
    code: "CSCI 4041",
    title: "Algorithms and Data Structures",
    instructor: "Prof. Daniel Kluver",
    credits: 4,
    meetingTime: "MWF 12:20–13:10",
    location: "Amundson Hall B75",
    grade: "A",
  },
];

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

/** Live Canvas data when CANVAS_API_TOKEN is set on the server; mock data otherwise. */
export const academicsService = {
  getAssignments: async (): Promise<AcademicItem[]> =>
    (await getCanvasAssignments()) ?? mockRequest("/academics/assignments", ASSIGNMENTS),
  getCourses: async (): Promise<Course[]> =>
    (await getCanvasCourses()) ?? mockRequest("/academics/courses", COURSES),
};
