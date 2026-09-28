import Anthropic from "@anthropic-ai/sdk";
import { COURSE_SEARCH_TOOL, parseCourseSearchInput, searchCourses } from "./courseSearch";
import { UMN_FACTS } from "./umnFacts";
import { LANGUAGES } from "@/utils/constants";

/**
 * Goldy's Claude conversation: system prompt, the course-search tool loop and reply text.
 * Server-only; the askAssistant server function gathers the student's data and calls this.
 */

const MODEL = "claude-opus-5";
/** Course search can take a round or two; stop runaway loops well before that matters. */
const MAX_TOOL_ROUNDS = 4;

export interface AssistantTurn {
  role: "user" | "assistant";
  text: string;
}

/** The student's own settings from their profile, used to shape Goldy's replies. */
export interface AssistantProfile {
  firstName: string;
  program?: string;
  preferredLanguage: string;
  plainLanguage: boolean;
  transferStudent?: boolean;
}

export interface AssistantRequest {
  turns: AssistantTurn[];
  profile: AssistantProfile;
}

function styleRules(profile: AssistantProfile): string {
  const language =
    LANGUAGES.find((l) => l.code === profile.preferredLanguage)?.english ?? "English";
  return [
    `Reply in ${language} by default. If the student asks for another language (for example to explain something to family), answer in that language.`,
    profile.plainLanguage
      ? "Keep it short: at most 3 short sentences in total, one paragraph, everyday words, about a grade-6 reading level. Pick the single most useful detail rather than listing everything."
      : "Answer briefly and conversationally, a few sentences at most.",
    "Plain text only, no markdown, no bullet lists.",
  ].join(" ");
}

function aboutStudent(profile: AssistantProfile): string {
  const facts = [`First name: ${profile.firstName}.`];
  if (profile.program) facts.push(`Program: ${profile.program}.`);
  if (profile.transferStudent) {
    facts.push(
      "Transferred to the U. You don't know yet whether they finished the MnTC at their old school; ask if it matters.",
    );
  }
  return facts.join(" ");
}

function textOf(message: Anthropic.Beta.BetaMessage): string {
  return message.content
    .flatMap((block) => (block.type === "text" ? [block.text] : []))
    .join("")
    .trim();
}

/**
 * Answers the latest turn. Returns null when the call fails so the caller can fall back to
 * the offline assistant.
 */
export async function runGoldy({
  apiKey,
  turns,
  profile,
  studentData,
}: AssistantRequest & { apiKey: string; studentData: string }): Promise<string | null> {
  const client = new Anthropic({ apiKey });
  const system = [
    "You are Goldy, the University of Minnesota student companion assistant.",
    styleRules(profile),
    "Use the student's data and the UMN facts below. If something isn't there, say so and point to MyU or One Stop instead of guessing.",
    "For course advice, call search_courses. Describe courses with evidence (share of A grades, would-recommend score, when it meets) and never promise a class is easy. Grade stats come from past semesters. Pick sections that don't clash with the student's current class times, and say the times come from the UMN class schedule (courses.umn.edu) and the grades from umn.lol. Recommend at most two courses, check for time clashes before you write (never correct yourself mid-answer), and skip honors-only courses (numbers ending in H or V) unless the student is in the Honors Program. The catalog is this fall's; for a later term, say these ran this fall and to confirm times in that term's schedule.",
    "When explaining a bill, go through it line by line: what each charge is, which credits (grants, aid) already lowered it, what is still owed and why any late fee was added.",
    "When dropping or switching a class comes up, give the deadline and refund that apply today from the calendar. When money comes up, give the next due date, and mention the late fee and payment plan only if relevant.",
    UMN_FACTS,
    `About the student: ${aboutStudent(profile)}`,
    `Student data: ${studentData}`,
  ].join("\n\n");

  const messages: Anthropic.Beta.BetaMessageParam[] = turns.map((t) => ({
    role: t.role,
    content: t.text,
  }));

  try {
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const response = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 16000,
        output_config: { effort: "low" },
        // If Claude declines a request, the API retries it on a fallback model in the same call.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system,
        tools: [COURSE_SEARCH_TOOL],
        messages,
      });

      if (response.stop_reason === "refusal") return "Sorry, I can't help with that one.";
      if (response.stop_reason !== "tool_use") return textOf(response) || null;

      // Keep the full assistant turn (thinking + tool calls), then answer every call at once.
      messages.push({ role: "assistant", content: response.content });
      const results: Anthropic.Beta.BetaToolResultBlockParam[] = response.content.flatMap(
        (block) => {
          if (block.type !== "tool_use") return [];
          if (block.name !== COURSE_SEARCH_TOOL.name) {
            return [
              {
                type: "tool_result" as const,
                tool_use_id: block.id,
                content: `Unknown tool ${block.name}`,
                is_error: true,
              },
            ];
          }
          const found = searchCourses(parseCourseSearchInput(block.input));
          return [
            { type: "tool_result" as const, tool_use_id: block.id, content: JSON.stringify(found) },
          ];
        },
      );
      messages.push({ role: "user", content: results });
    }
    return "Sorry, that took too many steps. Try asking in a simpler way.";
  } catch (error) {
    // e.g. invalid key or no credits — log the real cause, then use the offline assistant.
    console.error("[assistant] Claude API call failed:", error);
    return null;
  }
}
