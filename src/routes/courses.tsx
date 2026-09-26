import { createFileRoute } from "@tanstack/react-router";
import { CoursesScreen } from "@/screens/CoursesScreen";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses · Gopher Companion" },
      {
        name: "description",
        content: "Your Fall 2026 UMN schedule: instructors, meeting times, rooms and grades.",
      },
      { property: "og:title", content: "Courses · Gopher Companion" },
      {
        property: "og:description",
        content: "Every course on your UMN schedule with times, rooms and grades.",
      },
    ],
  }),
  component: CoursesScreen,
});
