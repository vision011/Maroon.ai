import { academicsService } from "./academicsService";
import { clubsService } from "./clubsService";
import { paymentsService } from "./paymentsService";
import type { DashboardResponse, Widget } from "@/types/sdui";

/**
 * Server-driven UI entry point: the "server" decides which widgets exist,
 * their order and their payloads. The client only renders what it receives.
 */
export const dashboardService = {
  async getWidgets(studentId: string): Promise<DashboardResponse> {
    const [assignments, balance, events] = await Promise.all([
      academicsService.getAssignments(),
      paymentsService.getBalance(),
      clubsService.getEvents(),
    ]);

    const widgets: Widget[] = [
      {
        id: "w-payments",
        type: "payments",
        priority: 1,
        title: "Balance due",
        subtitle: "One Stop Student Services",
        data: balance,
      },
      {
        id: "w-academics",
        type: "academics",
        priority: 2,
        title: "Coming up",
        subtitle: `${assignments.length} items this week`,
        data: { items: assignments },
      },
      {
        id: "w-clubs",
        type: "clubs",
        priority: 3,
        title: "Club events",
        subtitle: "Based on your groups",
        data: { events },
      },
    ];

    return {
      widgets,
      metadata: {
        generatedAt: new Date().toISOString(),
        layoutVersion: "2026.09.1",
        studentId,
      },
    };
  },
};
