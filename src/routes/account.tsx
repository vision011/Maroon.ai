import { createFileRoute } from "@tanstack/react-router";
import { AccountScreen } from "@/screens/AccountScreen";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account · Gopher Companion" },
      {
        name: "description",
        content: "Your student profile, sign-in session and what's coming next in the app.",
      },
      { property: "og:title", content: "Account · Gopher Companion" },
      { property: "og:description", content: "Your UMN student profile and app settings." },
    ],
  }),
  component: AccountScreen,
});
