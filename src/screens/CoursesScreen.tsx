import { BackLink } from "@/components/Common/BackLink";
import { useEffect, useState } from "react";
import { Loading } from "@/components/Common/Loading";
import { EmptyState } from "@/components/Dashboard/EmptyState";
import { academicsService } from "@/services/academicsService";
import type { Course } from "@/types";

export function CoursesScreen() {
  const [courses, setCourses] = useState<Course[] | null>(null);

  useEffect(() => {
    let alive = true;
    void academicsService.getCourses().then((data) => {
      if (alive) setCourses(data);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <BackLink title="Courses" />
      <div className="space-y-4 px-5 pb-8 pt-5">
        {!courses ? (
          <Loading label="Loading your schedule" />
        ) : courses.length === 0 ? (
          <EmptyState title="No courses" description="Your registration will show up here." />
        ) : (
          courses.map((course) => (
            <article key={course.id} className="card-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">{course.code}</p>
                  <h2 className="mt-1 text-base font-semibold">{course.title}</h2>
                </div>
                {course.grade ? (
                  <span className="rounded-full bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground">
                    {course.grade}
                  </span>
                ) : null}
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {(
                  [
                    ["Instructor", course.instructor],
                    ["Credits", course.credits],
                    ["Meets", course.meetingTime],
                    ["Where", course.location],
                  ] as const
                )
                  .filter(([, value]) => value != null && value !== "")
                  .map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
              </dl>
            </article>
          ))
        )}
      </div>
    </>
  );
}
