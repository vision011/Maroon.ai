import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Loading } from "@/components/Common/Loading";
import { useAuth } from "@/hooks/useAuth";

/**
 * App shell: phone-width frame, protected routes and the bottom tab bar.
 * TODO: deep linking — routes already map 1:1 to paths (/courses, /clubs, /account).
 */
export function RootNavigator({ children }: { children: ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLogin = pathname === "/login";

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated && !isLogin) void navigate({ to: "/login", replace: true });
    if (isAuthenticated && isLogin) void navigate({ to: "/", replace: true });
  }, [isReady, isAuthenticated, isLogin, navigate]);

  if (!isReady) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loading label="Starting up" />
      </div>
    );
  }

  if (isLogin) return <main className="min-h-screen">{children}</main>;
  if (!isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loading label="Redirecting" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-lg">{children}</main>
    </div>
  );
}
