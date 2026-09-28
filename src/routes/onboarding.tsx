import { createFileRoute } from "@tanstack/react-router";
import { OnboardingScreen } from "@/screens/OnboardingScreen";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome · Gopher Companion" },
      { name: "description", content: "Set up your Gopher Companion account." },
    ],
  }),
  component: OnboardingScreen,
});
