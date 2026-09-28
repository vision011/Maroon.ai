# Fall 2026 0–1 Hackathon Plan

**Written:** Sunday, Sept 27, 2026 (evening) · **Submission deadline:** Monday, Sept 28 @ 6:00 PM
· **Demo Day:** Tuesday, Sept 29 @ 6–8 PM, Keller Hall 3-230

Source: *Fall 2026 0–1 Hackathon Builder Packet*. Prompt: "Explore and build a usable solution for a
problem students frequently face." Deliverables: a working prototype link and a pitch deck (7 min).

> **Note:** the "Connect Goldy to Claude and the dashboard to Canvas" commit (`73e1cb8`) was deleted
> with the old `live-llm-chat` branch, but git can still recover it for a while. Real AI and real
> Canvas data are roughly an hour of work, not a rebuild. Recover it with `git cherry-pick 73e1cb8`.

## Rubric (75 pts)

| Category | Points | What judges ask |
|---|---|---|
| Impact & Empathy | 15 | Do you understand the problem and the people affected? |
| Technical Execution | 20 | Does the prototype work? Is technology used meaningfully? |
| Accessibility | 15 | Disability, literacy, language, connectivity, devices, other barriers? |
| Innovation & Novelty | 10 | Creative, differentiated, challenges conventional approaches? |
| Scalability & Feasibility | 15 | Resources, infrastructure, adoption, sustainability? |

Demo Day also asks about key design and technical decisions, impact and target users, accessibility,
privacy, scalability, limitations and future opportunities.

## Problem statement (for the pitch)

> UMN students juggle Canvas, MyU, email, GopherLink and Slack. Deadlines, fees and opportunities
> live in five places, and the students with the least free time pay the most for that. Maroon.ai
> puts it all in one feed, ordered by what needs you today, with an assistant that turns it into a
> plan.

## User persona: Amina Hassan

| | |
|---|---|
| **Who** | 20, sophomore in B.S. Computer Science, first-generation college student |
| **Life** | Works 20 hrs/week at Coffman Union; commutes on the Green Line; family speaks Somali at home |
| **Devices** | Mostly her phone, often on patchy transit connectivity |
| **Tools today** | Canvas app, MyU in a browser, UMN email, screenshots of club flyers |
| **Pain** | "I found out about a quiz from a classmate's group chat. And a late fee because the tuition email was buried." |
| **Goal** | Know *tonight* what matters *tomorrow* without opening 5 apps between shifts |
| **Won't do** | Set up anything that takes more than 2 minutes, or read long walls of text |
| **Success for her** | Zero surprise deadlines this week; one club event she actually made it to |

Amina scores you points on **Impact & Empathy** (a real, specific person) and **Accessibility**
(mobile-first, limited time, bilingual family, spotty connectivity).

## Feature walkthroughs (in build order)

### 1. First-run onboarding → her own dashboard *(done ✅, ~30 min polish)*

**Amina's flow:** Signs up with her Internet ID → confirms email → "Hi, Amina" → picks CS and
2028 → lands on a dashboard with her name.

**Left to do:**
- [ ] Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Lovable, and add the app URL to
  Supabase → Authentication → URL Configuration → Redirect URLs. **Without these, the demo link breaks.**
- [ ] Change the dashboard subtitle to use her program ("Here's your CS week").

**Demo line:** "Under a minute from sign-up to a personal dashboard."
**Rubric:** Technical Execution, Accessibility.

### 2. Real data: Canvas deadlines + Goldy on Claude *(~1–1.5 hrs)*

**Amina's flow:** Opens the app → action items show her *real* Canvas assignments → taps "Ask
Goldy": *"I work 4–10 tonight. What do I need to finish before my shift?"* → Goldy answers with a
short plan grounded in her actual due dates and balance.

**Build:**
- [ ] `git cherry-pick 73e1cb8` restores `src/services/assistant.functions.ts` (server-side Claude)
  and `src/services/canvas.functions.ts`.
- [ ] Resolve the conflicts in `src/types/index.ts` and `src/services/chatService.ts`.
- [ ] Set `ANTHROPIC_API_KEY`, `CANVAS_BASE_URL` and `CANVAS_API_TOKEN` in Lovable (server-only, no
  `VITE_` prefix).

**Be honest in Q&A:** Canvas uses *your* token for the demo. Per-student access needs Canvas OAuth
from UMN IT, which is your "future plans" slide.
**Rubric:** Technical Execution (20 pts, the biggest category), Innovation.

### 3. Goldy answers in your language, in plain words *(~1 hr)*

**Amina's flow:** In onboarding "About you" she picks **Preferred language: Somali** and turns on
**"Keep it short."** Later, her mom asks about the tuition bill, and Amina asks Goldy: "Explain my
balance". The answer comes back in Somali, in 2–3 short sentences.

**Build:**
- [ ] **Database:** a migration adding `preferred_language text` and `plain_language boolean` to
  `profiles`, plus `grant update (...)` for the new columns (same pattern as
  `supabase/migrations/20260927130000_onboarding.sql`).
- [ ] **Onboarding:** 2 more fields on the About step in `src/screens/OnboardingScreen.tsx`.
- [ ] **Assistant:** add *"Reply in {language}. Use short sentences at a grade-6 reading level."* to
  Goldy's instructions.

**Demo line:** a live Somali (or Spanish) answer. Judges remember it.
**Rubric:** Accessibility (15), Impact & Empathy, Innovation. This is the cheapest way to earn
points in your weakest-looking category.

### 4. Done / snooze on action items *(~1.5 hrs)*

**Amina's flow:** She submits the quiz → taps **Done** on the card → it disappears and stays gone
on reload. The tuition card gets **Remind me Friday** → it hides until Friday.

**Build:**
- [ ] **Table:** `action_item_states` (`student_id`, `item_key`, `status`, `snoozed_until`), with
  access rules so each student only sees their own rows.
- [ ] **Filtering:** `dashboardService` drops cards that are done or still snoozed. This fits the
  server-driven widget rule in `AGENTS.md`.
- [ ] **Card UI:** two buttons on `src/components/Dashboard/ActionCard.tsx`, with proper `aria-label`s.

**Rubric:** Technical Execution, Scalability. It's per-user state in Postgres with row-level
security, which answers a likely "does it scale?" question.

### 5. Stretch, only if 1–4 are solid: "Tonight's plan" card

A featured dashboard card that shows Goldy's 3-line plan for tomorrow, generated when the dashboard
loads. **Skip it if it's past 2 PM Monday.**

## Accessibility & privacy talking points (judges will ask)

- **Phone-first:** designed for phones, with large tap targets and screen-reader labels. Onboarding
  moves focus to each step's heading.
- **Language:** Goldy answers in the student's preferred language, in plain words.
- **Privacy:**
  - Each student can only read their own rows (enforced by the database, not the app).
  - API keys never reach the browser.
  - Passwords are stored hashed by Supabase, never by us.
- **Connectivity:** Canvas and Claude calls fall back to cached or sample data when offline or down.
  That's partly true today; say "falls back," not "works offline."

## Pitch deck outline (7 min)

The packet asks for: problem, solution, why yours is best, future plans, market feedback, demo.

1. **Problem:** five places for one student's week (use Amina's quote).
2. **Amina:** the persona, one slide.
3. **Solution + live demo:** onboarding → dashboard → Goldy plan → Somali answer → mark done.
4. **Why us:** one feed ordered by urgency + an assistant grounded in *your* data, not generic chat.
5. **Market feedback:** quotes from 3–5 classmates you ask before submitting.
6. **How it's built:** Supabase with row-level security, server-only keys, server-driven dashboard.
7. **Future:** Canvas OAuth per student, push reminders, GopherLink clubs, MyU fees.

## Schedule

| When | What |
|---|---|
| Sun night | #2 (cherry-pick + keys), deploy, and confirm the live link works |
| Mon AM | #3, then #4 |
| Mon 1–4 PM | Deck, and record a backup demo video |
| Mon 5 PM | Submit (link + deck), with an hour of buffer before 6 PM |
