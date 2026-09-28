import { createFileRoute } from "@tanstack/react-router";
import { SignupScreen } from "@/screens/SignupScreen";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account · Gopher Companion" },
      {
        name: "description",
        content: "Create a Gopher Companion account with your UMN Internet ID.",
      },
      { property: "og:title", content: "Create account · Gopher Companion" },
      {
        property: "og:description",
        content: "Sign up with your UMN Internet ID to get your student dashboard.",
      },
    ],
  }),
  component: SignupScreen,
});
