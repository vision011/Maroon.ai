# Onboarding flow

**Status:** Draft · **Author:** Salah · **Date:** 2026-09-27

## Problem

A new student lands on Maroon.ai and gets a dashboard filled with someone else's mock data.
They never tell us who they are, what they study, or which clubs they care about, and they
never connect Canvas. So the feed that should "reorder itself around what matters today"
has nothing personal to reorder. Sign-in is also a demo that accepts any password, so there
is no real account for onboarding to attach to. Students who don't see their own
information in the first minute are unlikely to come back.

## Goals

- A new student reaches a dashboard with **their own** name, program and at least one live
  data source within **3 minutes** of opening the app.
- Onboarding **completion rate of 80% or more** among students who create an account.
- **60% or more** of onboarded students connect Canvas.
- Every step except account creation is skippable, and anything skipped can be finished
  later from the dashboard.

## Non-goals

- UMN single sign-on (Shibboleth/Duo). We use Supabase email + password on `@umn.edu`
  addresses for now.
- Push notifications. Onboarding only records the preference; delivery is a separate
  feature.
- Re-onboarding existing users after the flow changes.
- Desktop-specific layouts. Mobile-width first, as with the rest of the app.

## Users & scenarios

- **First-year student:** "It's week one, I don't know where anything is. I want one place
  that tells me what's due and which clubs to try."
- **Returning student:** "I already live in Canvas. If this doesn't pull my assignments in,
  it's useless to me."
- **Busy student:** "I'll set it up later." They skip everything but still get a working,
  honest dashboard that nudges them to finish setup.

## Requirements

### Must have

1. **Real accounts.** Sign-up with an Internet ID, full name and password, backed by
   Supabase Auth. The `profiles` row is created by the existing `handle_new_user` trigger.
   Only `@umn.edu` emails are allowed (the database already enforces this).
2. **No login without an account.** Signing in with an unknown Internet ID shows "No account
   with that Internet ID. Create one first." and links to sign-up.
3. **Email confirmation.** If it's enabled in Supabase, show a "check your UMN inbox"
   screen after sign-up. Opening the link resumes onboarding.
4. **Onboarding gate.** A signed-in student who hasn't finished onboarding is routed to
   `/onboarding` from any route. A finished student never sees it again.
5. **Steps**, one per screen, with a progress indicator and a Back button:
   1. **Welcome.** What Maroon.ai does, in one sentence and three bullets.
   2. **About you.** Program/major (searchable list with a free-text fallback), class year,
      and an optional 7-digit student ID number.
   3. **Connect Canvas.** Explains what we read (courses, due dates, released grades) and
      what we never do (submit or change anything). Connect, or Skip.
   4. **Interests.** Pick three or more topics or clubs (career, cultural, sports, academic,
      …). These drive the "For you" section.
   5. **Meet Goldy.** One sample question to tap, showing the assistant answering.
   6. **Done.** Go to the dashboard.
6. **Resumable.** Progress is saved after each step. Closing the app mid-way resumes at the
   same step on the next sign-in.
7. **Finish-setup widget.** If any step was skipped, the dashboard shows a server-driven
   "Finish setting up" action card listing what's missing (e.g. "Connect Canvas to see your
   assignments"). It disappears once everything is complete or the student dismisses it.
8. **Honest data.** A student without Canvas never sees mock assignments presented as
   theirs. Show an empty state that invites them to connect Canvas instead.

### Nice to have

1. Pre-fill program and class year from Canvas once it's connected.
2. Suggested clubs based on the chosen program.
3. Short animated transitions between steps (`tw-animate-css` is already available).
4. A "Replay intro" option under Account.

## Experience

- **Entry:** `/login` gains a "Create an account" link to `/signup`. After sign-up (and email
  confirmation, if enabled), the student lands on `/onboarding`.
- **Layout:** the same maroon hero and bottom-sheet form style as `LoginScreen`, so it feels
  continuous. One primary button per step ("Continue"), with "Skip for now" as a text
  button on optional steps.
- **Progress:** "Step 2 of 5" with a thin progress bar. Welcome and Done aren't counted.
- **Loading:** step buttons show a busy state while saving. The Canvas connect button shows
  "Connecting…".
- **Errors:** saving fails → inline message with Retry, and the student stays on the step
  without losing input. Canvas connection fails → explain why, and offer Try again or Skip.
- **Empty states:** interests list fails to load → allow continuing without choosing.
- **Accessibility:** focus moves to each step's heading; all controls are reachable by
  keyboard; progress is announced to screen readers.

## Technical notes

- **Routes:** `src/routes/signup.tsx` and `src/routes/onboarding.tsx` stay thin (head metadata
  + screen). Screens live in `src/screens/SignupScreen.tsx` and `src/screens/OnboardingScreen.tsx`.
- **Gating:** extend `RootNavigator`. Signed out → `/login` (with `/signup` also allowed);
  signed in but not onboarded → `/onboarding`; onboarded → the normal app.
- **Auth:** add `src/lib/supabase.ts` (browser client using `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_PUBLISHABLE_KEY`) and `src/services/authService.ts`. `AuthContext` switches
  from the mock student to the Supabase session plus the `profiles` row, exposed through
  `useAuth`.
- **State:** onboarding state lives in the `profiles` row, not local storage, so it follows
  the student across devices. Wrap it in `src/services/onboardingService.ts` and a
  `useOnboarding` hook.
- **Database** (new migration in `supabase/migrations/`):
  - `profiles`: add `class_year smallint`, `onboarding_step text`, `onboarded_at timestamptz`,
    `interests text[] not null default '{}'`, `setup_dismissed_at timestamptz`.
  - Grant students update on those columns (the table currently limits updates to
    `full_name`, `student_number`, `program`, `canvas_user_id`).
  - Row-level security already limits each student to their own row; no new policies needed.
- **Canvas:** today `canvas.functions.ts` uses one server-wide `CANVAS_API_TOKEN`, which
  only works for a single account. Per-student access needs either Canvas OAuth (a developer
  key from UMN IT) or students pasting a personal access token. Either way, the token is
  stored server-side only (a separate table readable only by the server, never
  `profiles`) and never sent to the browser.
- **Dashboard:** the finish-setup card is a normal `action` widget emitted by
  `dashboardService.getWidgets()` based on the profile, never hardcoded in a component.
- **Types:** extend `Student` in `src/types/index.ts` with `internetId`, `classYear`,
  `interests` and `onboardedAt`.

## Success metrics

- Onboarding completion rate (reached Done ÷ created account): target 80% or more.
- Median time from account creation to dashboard: target under 3 minutes.
- Canvas connection rate among onboarded students: target 60% or more.
- Drop-off per step, to find the step that loses people.
- 7-day return rate of onboarded students versus students who skipped everything.

## Risks & open questions

- **Canvas per-student access (biggest risk).** UMN may not issue an OAuth developer key to
  a student project. The fallback is personal access tokens, which are clunky to explain.
  Which path do we pursue first?
- **Email confirmation:** keep it on (proves the student owns the Internet ID) or turn it off
  (faster, but anyone can claim any x500)? This PRD assumes on.
- **Program list:** is there an official UMN program list we can use, or do we start with
  free text?
- **Club data:** clubs are mock data. Where would a real list come from (GopherLink)?
- **Metrics:** there's no analytics in the app yet. Do we log step events to a Supabase
  table, or add a tool?
- **Assumption:** onboarding targets new accounts only; there are no existing real users
  to migrate, since the `profiles` table is empty.

## Milestones

1. **Real accounts:** Supabase client, sign-up and sign-in against `profiles`, blocking
   unknown users, and a "check your inbox" screen.
2. **Onboarding skeleton:** `/onboarding` gate, Welcome → About you → Done, progress saved
   to `profiles`, resume on sign-in.
3. **Personalisation:** Interests step feeding the "For you" section, plus the finish-setup
   dashboard widget and honest empty states.
4. **Canvas connection:** per-student token storage and the Connect Canvas step, once the
   OAuth vs. personal-token question is answered.
5. **Polish:** Meet Goldy step, transitions, accessibility pass, step-event tracking.
