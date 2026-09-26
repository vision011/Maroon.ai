import { createFileRoute } from "@tanstack/react-router";
import { DashboardScreen } from "@/components/Dashboard/DashboardScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Gopher Companion" },
      {
        name: "description",
        content:
          "Your UMN day at a glance: balances due, upcoming assignments and club events in one adaptive feed.",
      },
      { property: "og:title", content: "Dashboard · Gopher Companion" },
      {
        property: "og:description",
        content: "Balances, assignments and club events in one adaptive UMN student feed.",
      },
    ],
  }),
  component: DashboardScreen,
});
