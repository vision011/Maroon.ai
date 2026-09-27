import { mockRequest } from "./api";
import { askAssistant, type AssistantTurn } from "./assistant.functions";
import { academicsService } from "./academicsService";
import { clubsService } from "./clubsService";
import { paymentsService } from "./paymentsService";
import { formatCurrency, formatDate, relativeDue } from "@/utils/helpers";

/**
 * Offline assistant: answers from the same services the app uses, matched by keyword.
 * Used when ANTHROPIC_API_KEY isn't set on the server.
 */
async function answer(question: string): Promise<string> {
  const q = question.toLowerCase();

  if (/(balance|owe|tuition|pay|bill|fee)/.test(q)) {
    const { balanceDue, items } = await paymentsService.getBalance();
    const lines = items.map((i) => `${i.description} (${formatCurrency(i.amount)})`).join(" and ");
    return `You owe ${formatCurrency(balanceDue)}: ${lines}. It's ${relativeDue(items[0]?.dueDate ?? "").toLowerCase()}.`;
  }

  if (/(due|assignment|homework|exam|midterm|deadline)/.test(q)) {
    const items = await academicsService.getAssignments();
    const next = [...items].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
    if (!next) return "Nothing is due right now. You're all caught up.";
    return `Next up is ${next.courseCode}: ${next.title}, ${relativeDue(next.dueDate).toLowerCase()} (${formatDate(next.dueDate)}). You have ${items.length} items this week.`;
  }

  if (/(club|event|group|meeting|workshop)/.test(q)) {
    const events = await clubsService.getEvents();
    return events
      .map((e) => `${e.clubName}: ${e.eventTitle} on ${formatDate(e.date)} at ${e.location}.`)
      .join(" ");
  }

  if (/(class|course|schedule|grade|credit)/.test(q)) {
    const courses = await academicsService.getCourses();
    return `You're taking ${courses.length} courses: ${courses.map((c) => c.code).join(", ")}.`;
  }

  return 'I can help with your balance, what\'s due, your courses and club events. Try "What do I owe?"';
}

export const chatService = {
  /** `history` is the conversation so far, ending with the new question. */
  ask: async (history: AssistantTurn[]): Promise<string> => {
    const { reply } = await askAssistant({ data: history });
    if (reply) return reply;
    const question = history[history.length - 1]?.text ?? "";
    return mockRequest("/assistant/ask", await answer(question));
  },
};
