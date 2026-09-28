import { createServerFn } from "@tanstack/react-start";
import { academicsService } from "./academicsService";
import { clubsService } from "./clubsService";
import { paymentsService } from "./paymentsService";
import { runGoldy, type AssistantRequest } from "./goldy";

export type { AssistantProfile, AssistantRequest, AssistantTurn, ChatAttachment } from "./goldy";

/**
 * Server-only Claude call. The API key is read from ANTHROPIC_API_KEY on the server
 * (local: .env, deployed: a project secret) and never reaches the browser.
 */

/** Snapshot of the student's data so answers stay grounded in what the app shows. */
async function studentContext(canvasToken: string | null): Promise<string> {
  const [balance, assignments, courses, requirements, events] = await Promise.all([
    paymentsService.getBalance(),
    academicsService.getAssignments(canvasToken),
    academicsService.getCourses(canvasToken),
    academicsService.getRequirements(),
    clubsService.getEvents(),
  ]);
  return JSON.stringify({
    today: new Date().toISOString(),
    balance,
    assignments,
    courses,
    requirements,
    events,
  });
}

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((request: AssistantRequest) => request)
  .handler(async ({ data: { turns, profile, canvasToken } }): Promise<{ reply: string | null }> => {
    const apiKey = process.env["ANTHROPIC_API_KEY"];
    // No key configured: let the client fall back to the offline mock assistant.
    if (!apiKey) return { reply: null };
    const reply = await runGoldy({
      apiKey,
      turns,
      profile,
      studentData: await studentContext(canvasToken ?? null),
    });
    return { reply };
  });
