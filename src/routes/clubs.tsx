import { createFileRoute } from "@tanstack/react-router";
import { ClubsScreen } from "@/screens/ClubsScreen";

export const Route = createFileRoute("/clubs")({
  head: () => ({
    meta: [
      { title: "Clubs · Gopher Companion" },
      {
        name: "description",
        content: "Upcoming meetings, workshops and career events from the UMN groups you follow.",
      },
      { property: "og:title", content: "Clubs · Gopher Companion" },
      {
        property: "og:description",
        content: "Upcoming events from the UMN student groups you follow.",
      },
    ],
  }),
  component: ClubsScreen,
});
