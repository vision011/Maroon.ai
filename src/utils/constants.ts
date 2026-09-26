/** UMN design tokens. Colors live in src/styles.css as semantic tokens. */
export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const WIDGET_ORDER = ["academics", "payments", "clubs"] as const;

/** Cache window for pull-to-refresh (ms). */
export const REFRESH_CACHE_MS = 10_000;

export const TABS = [
  { to: "/", label: "Dashboard", icon: "home" },
  { to: "/courses", label: "Courses", icon: "book" },
  { to: "/clubs", label: "Clubs", icon: "users" },
  { to: "/account", label: "Account", icon: "user" },
] as const;
