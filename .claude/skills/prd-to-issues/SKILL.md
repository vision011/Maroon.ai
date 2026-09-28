---
name: prd-to-issues
description: Break a PRD into independently-grabbable GitHub issues using tracer-bullet vertical slices. Use when the user wants to convert a PRD to issues, create implementation tickets, or break down a PRD into work items.
---

# PRD to Issues

Break a PRD into independently-grabbable GitHub issues using vertical slices (tracer bullets).

## Process

### 1. Locate the PRD

The PRD is either:

- A file in `docs/prd/` (what `/write-a-prd` produces). If the user doesn't name one, list
  the folder and ask which.
- A GitHub issue. Ask for the number or URL and fetch it with
  `gh issue view <number> --comments` if it isn't already in context.

### 2. Explore the codebase (optional)

If you haven't already explored the codebase, do so to understand the current state of the
code, and follow the project rules in `AGENTS.md`.

### 3. Draft vertical slices

Break the PRD into **tracer bullet** issues. Each issue is a thin vertical slice that cuts
through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

Slices may be 'HITL' or 'AFK'. HITL slices require human interaction, such as an
architectural decision or a design review. AFK slices can be implemented and merged without
human interaction. Prefer AFK over HITL where possible.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (Supabase schema and
  migration, service, context/hook, screen, and checks)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
- Open questions from the PRD that block a slice become their own HITL slice
</vertical-slice-rules>

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Type**: HITL / AFK
- **Blocked by**: which other slices (if any) must complete first
- **Covers**: which PRD requirements, scenarios, or milestones it addresses

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- Are the correct slices marked as HITL and AFK?

Iterate until the user approves the breakdown. Don't create any issues before approval.

### 5. Create the GitHub issues

For each approved slice, create a GitHub issue using `gh issue create`. Use the issue body
template below, and add an `HITL` or `AFK` label if the repo has one (don't create labels
without asking).

Create issues in dependency order (blockers first) so you can reference real issue numbers
in the "Blocked by" field.

<issue-template>
## Parent PRD

#<prd-issue-number> — or a link to `docs/prd/<file>.md` on the default branch

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not
layer-by-layer implementation. Reference specific sections of the parent PRD rather than
duplicating content.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- Blocked by #<issue-number> (if any)

Or "None - can start immediately" if no blockers.

## PRD coverage

Reference by name or number from the parent PRD:

- Must have #1: Real accounts
- Milestone 2: Onboarding skeleton

</issue-template>

Do NOT close or modify the parent PRD (issue or file).

Finish by listing the created issues with their numbers, titles, and URLs in dependency order.

---

Adapted from the Galyarder Framework `prd-to-issues` skill.
