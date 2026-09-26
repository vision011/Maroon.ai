import { Link, useRouterState } from "@tanstack/react-router";
import { Book, House, User, Users } from "lucide-react";
import { TABS } from "@/utils/constants";

const ICONS = { home: House, book: Book, users: Users, user: User } as const;

export function BottomTabNavigator() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur [box-shadow:var(--shadow-float)]">
      <ul className="mx-auto flex max-w-lg items-stretch pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => {
          const Icon = ICONS[tab.icon];
          const active = pathname === tab.to;
          return (
            <li key={tab.to} className="flex-1">
              <Link
                to={tab.to}
                aria-label={tab.label}
                className={`tap-highlight-none flex flex-col items-center gap-1 py-2.5 text-[0.6875rem] font-semibold transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span
                  className={`grid size-9 place-items-center rounded-full transition-colors ${
                    active ? "bg-secondary" : ""
                  }`}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
