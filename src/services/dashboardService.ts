import { academicsService } from "./academicsService";
import { clubsService } from "./clubsService";
import { paymentsService } from "./paymentsService";
import { formatCurrency, formatDate, relativeDue } from "@/utils/helpers";
import type { ClubEvent } from "@/types";
import type { DashboardResponse, Widget, WidgetIcon } from "@/types/sdui";

const EVENT_ICON: Record<ClubEvent["type"], WidgetIcon> = {
  meeting: "event",
  social: "event",
  workshop: "workshop",
  career: "career",
};

/**
 * Server-driven UI entry point: the "server" decides which widgets exist,
 * which section they land in, their order and their copy. The client only
 * renders what it receives.
 */
export const dashboardService = {
  async getWidgets(studentId: string, firstName: string): Promise<DashboardResponse> {
    const [assignments, balance, events] = await Promise.all([
      academicsService.getAssignments(),
      paymentsService.getBalance(),
      clubsService.getEvents(),
    ]);

    const widgets: Widget[] = [
      {
        id: "w-shortcut-courses",
        type: "shortcut",
        section: "quickActions",
        priority: 1,
        data: { label: "Courses", icon: "courses", to: "/courses" },
      },
      {
        id: "w-shortcut-clubs",
        type: "shortcut",
        section: "quickActions",
        priority: 2,
        data: { label: "Clubs", icon: "clubs", to: "/clubs" },
      },
      {
        id: "w-shortcut-account",
        type: "shortcut",
        section: "quickActions",
        priority: 3,
        data: { label: "Account", icon: "account", to: "/account" },
      },
    ];

    if (balance.balanceDue > 0) {
      const nextDue = balance.items
        .map((i) => i.dueDate)
        .sort()
        .at(0);
      widgets.push({
        id: "w-balance",
        type: "action",
        section: "actions",
        size: "featured",
        priority: 1,
        data: {
          eyebrow: "Balance due",
          title: `${formatCurrency(balance.balanceDue)} for fall semester`,
          detail: nextDue
            ? `Tuition & fees · ${relativeDue(nextDue).toLowerCase()}`
            : "Tuition & fees",
          icon: "payment",
          tone: "urgent",
        },
      });
    }

    [...assignments]
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .forEach((item, index) => {
        widgets.push({
          id: `w-${item.id}`,
          type: "action",
          section: "actions",
          size: "compact",
          priority: 10 + index,
          data: {
            eyebrow: `${item.type === "exam" ? "Exam" : "Due"} · ${item.courseCode}`,
            title: item.title,
            detail: `${relativeDue(item.dueDate)} · ${item.location}`,
            icon: item.type === "exam" ? "exam" : "assignment",
            tone: item.type === "exam" ? "urgent" : "info",
            to: "/courses",
          },
        });
      });

    events.forEach((event, index) => {
      widgets.push({
        id: `w-${event.id}`,
        type: "suggestion",
        section: "forYou",
        priority: 20 + index,
        data: {
          eyebrow: event.clubName,
          title: event.eventTitle,
          detail: event.location,
          meta: formatDate(event.date),
          icon: EVENT_ICON[event.type],
          tone: event.type === "career" ? "reward" : "info",
          to: "/clubs",
        },
      });
    });

    return {
      greeting: {
        title: `Good to see you, ${firstName}.`,
        subtitle: "Here's what needs your attention at the U today.",
      },
      sections: [
        { id: "quickActions", title: "Quick actions", priority: 1 },
        { id: "actions", title: "Action items", priority: 2 },
        { id: "forYou", title: "For you", priority: 3 },
      ],
      widgets,
      metadata: {
        generatedAt: new Date().toISOString(),
        layoutVersion: "2026.09.3",
        studentId,
      },
    };
  },
};
