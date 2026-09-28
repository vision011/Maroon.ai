---
name: write-a-prd
description: Write a product requirements document (PRD) for a Maroon.ai feature and save it to docs/prd/. Use when the user asks for a PRD, a spec, or requirements for a feature before building it.
---

# Write a PRD

Produce a short, decision-ready PRD for a feature of Maroon.ai, the UMN student companion app.
Aim for something a teammate can read in five minutes and build from.

## 1. Understand the feature

Work out from the request and the codebase:

- The problem, and which students have it.
- What exists today: skim the relevant `src/screens/*`, `src/services/*`, and
  `dashboardService.getWidgets()` if the feature touches the dashboard.
- Data sources involved (Canvas, Supabase, mock services, Claude/Goldy).

If the problem or the target user is unclear, ask **at most three** focused questions before
writing. Otherwise, make reasonable assumptions and list them under Open questions.

## 2. Write the PRD

Use this structure. Omit a section only if it truly doesn't apply; keep each one tight.

```markdown
# <Feature name>

**Status:** Draft · **Author:** <git user> · **Date:** <YYYY-MM-DD>

## Problem
What's painful today, for whom, and why it matters. 2–4 sentences.

## Goals
- Measurable outcomes this feature must achieve.

## Non-goals
- What this deliberately won't do (prevents scope creep).

## Users & scenarios
- **<Student type>:** "<A concrete moment they'd use it>"

## Requirements
### Must have
1. <Testable requirement>
### Nice to have
1. <…>

## Experience
Where it lives in the app (screen, dashboard widget, Goldy chat), what the student sees and
taps, plus empty, loading and error states.

## Technical notes
- Data: which service in `src/services/*` provides it, and whether it's live (Canvas,
  Supabase) or mock-backed via `mockRequest`.
- Dashboard features ship as server-driven widgets from `dashboardService`, never as
  hardcoded sections.
- Shared state goes in `src/context/*`, exposed through a `src/hooks/*` wrapper.
- New tables: columns, row-level security policies, and the migration in `supabase/migrations/`.
- Secrets (Canvas, Anthropic keys) stay server-side.

## Success metrics
- How we'll know it worked (usage, time saved, fewer missed deadlines, …).

## Risks & open questions
- <Unknowns, assumptions made, dependencies on other teams or APIs>

## Milestones
1. <Smallest shippable slice first>
```

## 3. Save and report

- Save to `docs/prd/<feature-name-in-kebab-case>.md` (create the folder if needed).
- Reply with the file path, a 2–3 sentence summary, and the open questions that most need an
  answer before building.
- Don't start implementing the feature unless the user asks.
