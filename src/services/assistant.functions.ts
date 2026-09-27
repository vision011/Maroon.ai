import { createServerFn } from "@tanstack/react-start";
import Anthropic from "@anthropic-ai/sdk";
import { academicsService } from "./academicsService";
import { clubsService } from "./clubsService";
import { paymentsService } from "./paymentsService";

/**
 * Server-only Claude call. The API key is read from ANTHROPIC_API_KEY on the server
 * (local: .env, deployed: a project secret) and never reaches the browser.
 */

const MODEL = "claude-opus-5";

export interface AssistantTurn {
  role: "user" | "assistant";
  text: string;
}

/** Snapshot of the student's data so answers stay grounded in what the app shows. */
async function studentContext(): Promise<string> {
  const [balance, assignments, courses, events] = await Promise.all([
    paymentsService.getBalance(),
    academicsService.getAssignments(),
    academicsService.getCourses(),
    clubsService.getEvents(),
  ]);
  return JSON.stringify({ today: new Date().toISOString(), balance, assignments, courses, events });
}

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((turns: AssistantTurn[]) => turns)
  .handler(async ({ data: turns }): Promise<{ reply: string | null }> => {
    const apiKey = process.env["ANTHROPIC_API_KEY"];
    // No key configured: let the client fall back to the offline mock assistant.
    if (!apiKey) return { reply: null };

    const client = new Anthropic({ apiKey });
    let response: Anthropic.Beta.BetaMessage;
    try {
      response = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 16000,
        output_config: { effort: "low" },
        // If Claude declines a request, the API retries it on a fallback model in the same call.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: [
          "You are Goldy, the University of Minnesota student companion assistant.",
          "Answer briefly and conversationally (a few sentences, plain text, no markdown).",
          "Use the student's data below when relevant; if something isn't in it, say so.",
          `Student data: ${await studentContext()}`,
        ].join("\n"),
        messages: turns.map((t) => ({ role: t.role, content: t.text })),
      });
    } catch (error) {
      // e.g. invalid key or no credits — log the real cause, then use the offline assistant.
      console.error("[assistant] Claude API call failed:", error);
      return { reply: null };
    }

    if (response.stop_reason === "refusal") {
      return { reply: "Sorry, I can't help with that one." };
    }
    const reply = response.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("")
      .trim();
    return { reply: reply || null };
  });
