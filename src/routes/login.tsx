import { createFileRoute } from "@tanstack/react-router";
import { LoginScreen } from "@/screens/LoginScreen";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · Gopher Companion" },
      {
        name: "description",
        content: "Sign in with your UMN Internet ID to see your assignments, balances and clubs.",
      },
      { property: "og:title", content: "Sign in · Gopher Companion" },
      {
        property: "og:description",
        content: "Sign in with your UMN Internet ID to open your student dashboard.",
      },
    ],
  }),
  component: LoginScreen,
});
