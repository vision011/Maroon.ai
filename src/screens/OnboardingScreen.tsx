import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { AuthShell, FormError, INPUT, PRIMARY_BUTTON } from "@/components/Auth/AuthShell";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { LANGUAGES } from "@/utils/constants";
import type { OnboardingStep, ProfileUpdate } from "@/types";

const STEPS: OnboardingStep[] = ["welcome", "language", "about", "done"];

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
  /** Which intro card is showing on the welcome step. */
  const [slide, setSlide] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to each step's heading so screen readers announce the new step.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step, slide]);

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
      <IntroStep
        headingRef={headingRef}
        progress={progress}
        firstName={firstName}
        slide={slide}
        onSlide={setSlide}
        busy={busy}
        error={error}
        onDone={() => void save({}, "language")}
      />
    );
  }

  if (step === "language") {
    return (
      <LanguageStep
        headingRef={headingRef}
        progress={progress}
        busy={busy}
        error={error}
        initial={{
          preferredLanguage: student?.preferredLanguage ?? "en",
          plainLanguage: student?.plainLanguage ?? false,
        }}
        onBack={() => setStep("welcome")}
        onSubmit={(update) => void save(update, "about")}
      />
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
          transferStudent: student?.transferStudent ?? false,
        }}
        onBack={() => setStep("language")}
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

/** Intro cards shown before any questions: what Maroon.ai does, one idea per card. */
const INTRO = [
  {
    eyebrow: "One feed",
    title: (firstName: string) => `Hi, ${firstName}.`,
    intro:
      "Canvas deadlines, tuition and club events in one place, ordered by what needs you first.",
    preview: (
      <PreviewList
        rows={[
          { tag: "Today", tone: "urgent", title: "Quiz 3 closes at 11:59 PM", source: "Canvas" },
          { tag: "Friday", tone: "soon", title: "Tuition payment due", source: "Billing" },
          { tag: "Next week", tone: "later", title: "Club fair at Coffman", source: "Clubs" },
        ]}
      />
    ),
  },
  {
    eyebrow: "Ask Goldy",
    title: () => "Meet Goldy.",
    intro:
      "Ask about your classes, your bill or campus. Goldy answers from your own data, in plain words.",
    preview: (
      <div className="space-y-2 text-sm">
        <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground">
          I work 4–10 tonight. What should I finish first?
        </p>
        <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-md bg-card px-4 py-2.5 shadow-sm">
          Start Homework 6, it's due tomorrow. Save the quiz for Thursday.
        </p>
      </div>
    ),
  },
  {
    eyebrow: "Clubs",
    title: () => "Your clubs.",
    intro: "Find events worth going to, and keep club board duties next to your coursework.",
    preview: (
      <PreviewList
        rows={[
          { tag: "Board", tone: "soon", title: "Book a room for Thursday", source: "NSBE" },
          { tag: "Event", tone: "later", title: "Resume review, Lind Hall", source: "NSBE" },
        ]}
      />
    ),
  },
] as const;

const TAG_TONE = {
  urgent: "bg-primary text-primary-foreground",
  soon: "bg-accent text-accent-foreground",
  later: "bg-secondary text-secondary-foreground",
} as const;

function PreviewList({
  rows,
}: {
  rows: { tag: string; tone: keyof typeof TAG_TONE; title: string; source: string }[];
}) {
  return (
    <ul className="space-y-2" aria-label="Example">
      {rows.map((row) => (
        <li key={row.title} className="rounded-xl bg-card px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs">
            <span className={`rounded-full px-2 py-0.5 font-semibold ${TAG_TONE[row.tone]}`}>
              {row.tag}
            </span>
            <span className="text-muted-foreground">{row.source}</span>
          </div>
          <p className="mt-1 text-sm font-semibold">{row.title}</p>
        </li>
      ))}
    </ul>
  );
}

function IntroStep({
  headingRef,
  progress,
  firstName,
  slide,
  onSlide,
  busy,
  error,
  onDone,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  progress: React.ReactNode;
  firstName: string;
  slide: number;
  onSlide: (slide: number) => void;
  busy: boolean;
  error: string | null;
  onDone: () => void;
}) {
  const card = INTRO[slide] ?? INTRO[0];
  const isLast = slide === INTRO.length - 1;

  return (
    <AuthShell title={card.title(firstName)} intro={card.intro} hero={progress}>
      <h2 ref={headingRef} tabIndex={-1} className="eyebrow outline-none">
        {card.eyebrow}
        <span className="sr-only">
          , {slide + 1} of {INTRO.length}
        </span>
      </h2>
      <div className="mt-4 rounded-2xl bg-muted p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Example
        </p>
        {card.preview}
      </div>

      <div className="mt-5 flex justify-center gap-2" aria-hidden="true">
        {INTRO.map((c, i) => (
          <span
            key={c.eyebrow}
            className={`h-2 rounded-full transition-all ${i === slide ? "w-6 bg-primary" : "w-2 bg-primary/25"}`}
          />
        ))}
      </div>

      <FormError message={error} />
      <button
        type="button"
        disabled={busy}
        onClick={() => (isLast ? onDone() : onSlide(slide + 1))}
        className={`mt-5 ${PRIMARY_BUTTON}`}
      >
        {isLast ? (busy ? "Saving…" : "Set up my account") : "Next"}
      </button>
      <div className="mt-1 flex gap-2">
        <button
          type="button"
          disabled={busy || slide === 0}
          onClick={() => onSlide(slide - 1)}
          className={SECONDARY_BUTTON}
        >
          Back
        </button>
        {!isLast && (
          <button type="button" disabled={busy} onClick={onDone} className={SECONDARY_BUTTON}>
            Skip intro
          </button>
        )}
      </div>
    </AuthShell>
  );
}

function LanguageStep({
  headingRef,
  progress,
  busy,
  error,
  initial,
  onBack,
  onSubmit,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  progress: React.ReactNode;
  busy: boolean;
  error: string | null;
  initial: { preferredLanguage: string; plainLanguage: boolean };
  onBack: () => void;
  onSubmit: (update: ProfileUpdate) => void;
}) {
  const [language, setLanguage] = useState(initial.preferredLanguage);
  const [plain, setPlain] = useState(initial.plainLanguage);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ preferredLanguage: language, plainLanguage: plain });
  }

  return (
    <AuthShell
      title="Your language"
      intro="Goldy answers in the language you pick. The rest of the app stays in English for now."
      hero={progress}
    >
      <form onSubmit={submit} noValidate>
        <fieldset>
          <legend>
            <h2 ref={headingRef} tabIndex={-1} className="eyebrow outline-none">
              Goldy answers in
            </h2>
          </legend>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {LANGUAGES.map((l) => {
              const selected = l.code === language;
              return (
                <label
                  key={l.code}
                  className={`tap-highlight-none relative flex cursor-pointer flex-col rounded-xl border px-4 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${
                    selected ? "border-primary bg-primary/5" : "border-input bg-card"
                  }`}
                >
                  <input
                    type="radio"
                    name="language"
                    value={l.code}
                    checked={selected}
                    onChange={() => setLanguage(l.code)}
                    className="sr-only"
                  />
                  <span className="font-semibold" lang={l.code}>
                    {l.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{l.english}</span>
                  {selected && (
                    <Check
                      className="absolute right-3 top-3 size-4 text-primary"
                      aria-hidden="true"
                    />
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5 flex items-start justify-between gap-4 rounded-xl border border-input bg-card px-4 py-3">
          <label htmlFor="plainLanguage" className="cursor-pointer">
            <span className="block font-semibold">Keep it short</span>
            <span className="block text-sm text-muted-foreground">
              Short sentences and simple words.
            </span>
          </label>
          <Switch id="plainLanguage" checked={plain} onCheckedChange={setPlain} className="mt-1" />
        </div>

        <FormError message={error} />
        <button type="submit" disabled={busy} className={`mt-6 ${PRIMARY_BUTTON}`}>
          {busy ? "Saving…" : "Continue"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onBack}
          className={`mt-1 ${SECONDARY_BUTTON}`}
        >
          Back
        </button>
      </form>
    </AuthShell>
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
  initial: { program: string; graduationYear: string; studentId: string; transferStudent: boolean };
  onBack: () => void;
  onSkip: () => void;
  onSubmit: (update: ProfileUpdate) => void;
  onInvalid: (message: string) => void;
}) {
  const [program, setProgram] = useState(initial.program);
  const [graduationYear, setGraduationYear] = useState(initial.graduationYear);
  const [studentId, setStudentId] = useState(initial.studentId);
  const [transferStudent, setTransferStudent] = useState(initial.transferStudent);

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
      transferStudent,
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

        <div className="mt-5 flex items-start justify-between gap-4 rounded-xl border border-input bg-card px-4 py-3">
          <label htmlFor="transferStudent" className="cursor-pointer">
            <span className="block font-semibold">I transferred to the U</span>
            <span className="block text-sm text-muted-foreground">
              Helps Goldy with Liberal Ed and transfer credit questions.
            </span>
          </label>
          <Switch
            id="transferStudent"
            checked={transferStudent}
            onCheckedChange={setTransferStudent}
            className="mt-1"
          />
        </div>

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
