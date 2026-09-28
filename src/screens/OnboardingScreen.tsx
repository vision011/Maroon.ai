import { useEffect, useRef, useState } from "react";
import { BookOpen, CalendarDays, MessageCircle } from "lucide-react";
import { AuthShell, FormError, INPUT, PRIMARY_BUTTON } from "@/components/Auth/AuthShell";
import { useAuth } from "@/hooks/useAuth";
import type { OnboardingStep, ProfileUpdate } from "@/types";

const STEPS: OnboardingStep[] = ["welcome", "about", "done"];

/** Suggestions only; students can type any program. */
const PROGRAMS = [
  "B.S. Computer Science",
  "B.A. Computer Science",
  "B.S. Computer Engineering",
  "B.S. Electrical Engineering",
  "B.S. Mechanical Engineering",
  "B.S. Data Science",
  "B.S. Mathematics",
  "B.S. Biology",
  "B.S. Neuroscience",
  "B.S.B. Finance",
  "B.S.B. Marketing",
  "B.A. Economics",
  "B.A. Psychology",
  "B.A. Political Science",
  "B.A. Journalism",
  "B.S. Nursing",
];

const SECONDARY_BUTTON =
  "tap-highlight-none w-full py-3 text-sm font-semibold text-muted-foreground disabled:opacity-60";

export function OnboardingScreen() {
  const { student, updateProfile } = useAuth();
  const [step, setStep] = useState<OnboardingStep>(student?.onboardingStep ?? "welcome");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to each step's heading so screen readers announce the new step.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  /** Saves progress, then shows the next step. On failure, stays put and keeps the input. */
  async function save(update: ProfileUpdate, next?: OnboardingStep) {
    setError(null);
    setBusy(true);
    try {
      await updateProfile(next ? { ...update, onboardingStep: next } : update);
      if (next) setStep(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const firstName = student?.name.split(" ")[0] ?? "there";
  const index = STEPS.indexOf(step);
  const progress = (
    <div className="mt-8" aria-label={`Step ${index + 1} of ${STEPS.length}`} role="img">
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= index ? "bg-accent" : "bg-surface-foreground/20"
            }`}
          />
        ))}
      </div>
    </div>
  );

  if (step === "welcome") {
    return (
      <AuthShell
        title={`Hi, ${firstName}.`}
        intro="Maroon.ai puts your day at the U in one feed, ordered by what needs you first."
        hero={progress}
      >
        <h2 ref={headingRef} tabIndex={-1} className="eyebrow outline-none">
          What you'll get
        </h2>
        <ul className="mt-4 space-y-4 text-sm">
          <Feature icon={<BookOpen className="size-5" />} title="Deadlines first">
            Assignments and exams sorted by what's due soonest.
          </Feature>
          <Feature icon={<CalendarDays className="size-5" />} title="Clubs and events">
            Events from the student groups you care about.
          </Feature>
          <Feature icon={<MessageCircle className="size-5" />} title="Ask Goldy">
            Quick answers about your classes and campus.
          </Feature>
        </ul>
        <FormError message={error} />
        <button
          type="button"
          disabled={busy}
          onClick={() => void save({}, "about")}
          className={`mt-6 ${PRIMARY_BUTTON}`}
        >
          {busy ? "Saving…" : "Get started"}
        </button>
      </AuthShell>
    );
  }

  if (step === "about") {
    return (
      <AboutStep
        headingRef={headingRef}
        progress={progress}
        busy={busy}
        error={error}
        initial={{
          program: student?.program ?? "",
          graduationYear: student?.graduationYear ? String(student.graduationYear) : "",
          studentId: student?.studentId ?? "",
        }}
        onBack={() => setStep("welcome")}
        onSkip={() => void save({}, "done")}
        onSubmit={(update) => void save(update, "done")}
        onInvalid={setError}
      />
    );
  }

  return (
    <AuthShell
      title="You're set."
      intro="Your dashboard is ready. You can see these details any time under Account."
      hero={progress}
    >
      <h2 ref={headingRef} tabIndex={-1} className="eyebrow outline-none">
        All done
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Next up: connecting Canvas so your real assignments show up here.
      </p>
      <FormError message={error} />
      <button
        type="button"
        disabled={busy}
        // Once onboardedAt is set, RootNavigator sends the student to the dashboard.
        onClick={() => void save({ onboardedAt: new Date().toISOString() })}
        className={`mt-6 ${PRIMARY_BUTTON}`}
      >
        {busy ? "Opening…" : "Go to my dashboard"}
      </button>
    </AuthShell>
  );
}

function Feature({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
        {icon}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-muted-foreground">{children}</p>
      </div>
    </li>
  );
}

function AboutStep({
  headingRef,
  progress,
  busy,
  error,
  initial,
  onBack,
  onSkip,
  onSubmit,
  onInvalid,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  progress: React.ReactNode;
  busy: boolean;
  error: string | null;
  initial: { program: string; graduationYear: string; studentId: string };
  onBack: () => void;
  onSkip: () => void;
  onSubmit: (update: ProfileUpdate) => void;
  onInvalid: (message: string) => void;
}) {
  const [program, setProgram] = useState(initial.program);
  const [graduationYear, setGraduationYear] = useState(initial.graduationYear);
  const [studentId, setStudentId] = useState(initial.studentId);

  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => thisYear + i);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = studentId.trim();
    if (id && !/^\d{7}$/.test(id)) {
      onInvalid("Your student ID is the 7-digit number on your U Card.");
      return;
    }
    onSubmit({
      program: program.trim() || undefined,
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      studentId: id || undefined,
    });
  }

  return (
    <AuthShell
      title="About you"
      intro="This helps us show the right deadlines, events and advice. All optional."
      hero={progress}
    >
      <form onSubmit={submit} noValidate>
        <h2 ref={headingRef} tabIndex={-1} className="sr-only outline-none">
          About you
        </h2>

        <label htmlFor="program" className="eyebrow">
          Program or major
        </label>
        <input
          id="program"
          list="programs"
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          placeholder="Start typing, e.g. Computer Science"
          className={`mt-2 ${INPUT}`}
        />
        <datalist id="programs">
          {PROGRAMS.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>

        <label htmlFor="graduationYear" className="eyebrow mt-5 block">
          Expected graduation
        </label>
        <select
          id="graduationYear"
          value={graduationYear}
          onChange={(e) => setGraduationYear(e.target.value)}
          className={`mt-2 ${INPUT}`}
        >
          <option value="">Choose a year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <label htmlFor="studentId" className="eyebrow mt-5 block">
          Student ID <span className="normal-case text-muted-foreground">(optional)</span>
        </label>
        <input
          id="studentId"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value.replace(/\D/g, "").slice(0, 7))}
          inputMode="numeric"
          placeholder="7 digits"
          className={`mt-2 ${INPUT}`}
        />

        <FormError message={error} />

        <button type="submit" disabled={busy} className={`mt-6 ${PRIMARY_BUTTON}`}>
          {busy ? "Saving…" : "Continue"}
        </button>
        <div className="mt-1 flex gap-2">
          <button type="button" disabled={busy} onClick={onBack} className={SECONDARY_BUTTON}>
            Back
          </button>
          <button type="button" disabled={busy} onClick={onSkip} className={SECONDARY_BUTTON}>
            Skip for now
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
