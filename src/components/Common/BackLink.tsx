import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

/** Top-of-screen link back to the dashboard, which is the app's only hub. */
export function BackLink({ title }: { title: string }) {
  return (
    <div className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <Link
        to="/"
        className="tap-highlight-none -ml-1.5 inline-flex items-center gap-0.5 text-sm font-semibold text-primary"
      >
        <ChevronLeft className="size-5" />
        Dashboard
      </Link>
      <h1 className="mt-3 text-[2rem] font-semibold leading-tight">{title}</h1>
    </div>
  );
}
