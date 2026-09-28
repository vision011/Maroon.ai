import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Loading } from "@/components/Common/Loading";
import { useAuth } from "@/hooks/useAuth";

/**
 * App shell: phone-width frame and route gating (sign-in, then onboarding, then the app).
 * TODO: deep linking — routes already map 1:1 to paths (/courses, /clubs, /account).
 */
export function RootNavigator({ children }: { children: ReactNode }) {
  const { isAuthenticated, isReady, needsOnboarding } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Sign-in and sign-up are the only screens reachable while signed out.
  const isPublic = pathname === "/login" || pathname === "/signup";
  const isOnboarding = pathname === "/onboarding";

  // Signed out → /login. Signed in but not onboarded → /onboarding. Otherwise the app.
  let redirectTo: "/login" | "/onboarding" | "/" | null = null;
  if (!isAuthenticated) redirectTo = isPublic ? null : "/login";
  else if (needsOnboarding) redirectTo = isOnboarding ? null : "/onboarding";
  else if (isPublic || isOnboarding) redirectTo = "/";

  useEffect(() => {
    if (isReady && redirectTo) void navigate({ to: redirectTo, replace: true });
  }, [isReady, redirectTo, navigate]);

  if (!isReady || redirectTo) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loading label={isReady ? "Redirecting" : "Starting up"} />
      </div>
    );
  }

  if (isPublic || isOnboarding) return <main className="min-h-screen">{children}</main>;

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-lg">{children}</main>
    </div>
  );
}
