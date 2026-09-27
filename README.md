# Gopher Companion

A mobile-first University of Minnesota student companion. After signing in with a UMN Internet ID, students get one feed with their balance due, upcoming assignments and exams, and club events, plus tabs for courses, clubs and their account.

The UI is **server-driven**: the dashboard renders whatever typed widgets the data layer returns, in the order it chooses. All data is mocked for now, and the service layer is built so real UMN endpoints can replace the mocks without UI changes.

Built with [Lovable](https://lovable.dev) on TanStack Start.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | [TanStack Start](https://tanstack.com/start) (React 19, SSR) with file-based TanStack Router |
| Build | Vite 8 via `@lovable.dev/vite-tanstack-config`, Nitro (Cloudflare target) for production |
| Styling | Tailwind CSS v4, shadcn/ui (Radix primitives) in `src/components/ui`, `tw-animate-css` |
| Data | Typed service modules backed by `mockRequest`; TanStack Query client is available in context |
| Language / tooling | TypeScript, ESLint, Prettier |
| Package manager | Bun (`bun.lock`); npm also works |

## Getting started

```sh
bun install        # or: npm install
cp .env.example .env
bun run dev        # or: npm run dev
```

Open the printed local URL. Sign in with any Internet ID. Sign-in is a demo, so no password is needed.

### Scripts

| Script | Description |
| --- | --- |
| `dev` | Start the Vite dev server with SSR |
| `build` | Production build |
| `build:dev` | Build in development mode |
| `preview` | Serve the production build locally |
| `lint` | Run ESLint |
| `format` | Format with Prettier |

### Environment

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL for the student data API. Defaults to `/api`. The mock services only log it for now. |

## Features

- **Dashboard (`/`)**: server-driven widgets for payments, academics and clubs, with skeleton loading, error and empty states, a manual refresh button and touch pull-to-refresh. Refreshes are cached for 10 seconds unless forced.
- **Courses (`/courses`)**: the current term's schedule with credit totals, instructors, meeting times and grades.
- **Clubs (`/clubs`)**: upcoming events from the student's groups.
- **Account (`/account`)**: student profile details and sign-out.
- **Login (`/login`)**: Internet ID sign-in. The session is saved to `localStorage` under `umn.auth.session`.

Every route except `/login` requires sign-in. Signed-out users are redirected to `/login`, and signed-in users who visit `/login` are sent to `/`.

## Architecture

```
src/
├── routes/          # Thin file-based routes: head metadata + a screen component
│   └── __root.tsx   # HTML shell, providers, RootNavigator, 404/error boundaries
├── screens/         # Full-page screens (Login, Courses, Clubs, Account)
├── components/
│   ├── Dashboard/   # DashboardScreen, ActionCard, SuggestionCard
│   ├── Chat/        # ChatBar (assistant prompt + chat sheet)
│   ├── Navigation/  # RootNavigator (auth gate + app frame), BottomTabNavigator
│   ├── Common/      # Loading / skeletons
│   └── ui/          # shadcn/ui primitives
├── context/         # AuthContext, DashboardContext (state + providers)
├── hooks/           # useAuth, useDashboard, useChat, usePullToRefresh, use-mobile
├── services/        # api.ts (mockRequest, ApiError) + domain services
├── types/           # Domain models (index.ts) and server-driven UI contract (sdui.ts)
├── utils/           # constants (tabs, cache window) and formatting helpers
├── lib/             # SSR error capture / error page, Lovable error reporting
├── server.ts        # SSR entry wrapper that turns crashes into an HTML error page
└── start.ts         # Start instance: error middleware + CSRF protection for server functions
```

### Provider tree

```
QueryClientProvider
└── AuthProvider
    └── DashboardProvider
        └── RootNavigator      (auth gating, phone-width frame, bottom tab bar)
            └── <Outlet />     (active route)
```

`RootNavigator` is mounted once in `__root.tsx`, so every route gets the same auth gate and tab bar.

### Server-driven dashboard

The dashboard has a greeting, an **Action items** section (one featured card over a two-column grid), a swipeable **For you** row, and a **Goldy** assistant chat bar pinned above the tab bar.

1. `dashboardService.getWidgets(studentId, firstName)` returns a `DashboardResponse`: the `greeting`, the ordered `sections`, a flat list of `widgets` and metadata (`generatedAt`, `layoutVersion`, `studentId`).
2. Each `Widget` is a discriminated union on `type` (`"action" | "suggestion"`) with `id`, `section`, `priority`, optional `hidden` and a `data` payload holding its copy, icon and tone. Action widgets also have a `size` (`featured` or `compact`). See `src/types/sdui.ts`.
3. `resolveSections()` removes hidden or empty widgets, sorts them by `priority`, groups them under their sections and drops sections left with no widgets.
4. `DashboardScreen` picks a component for each widget by `type` and skips unknown types, so a newer server layout can't crash an older client.

To add a widget type, extend the union in `sdui.ts`, handle it in `widgetHasData`, add a component under `components/Dashboard/`, add a case to `renderWidget`, and emit it from `dashboardService`.

The chat bar (`components/Chat/ChatBar.tsx`) sends questions through `useChat` to `chatService`, a mock that answers questions about your balance, due dates, courses and clubs using the other services.

## Conventions

These rules are also in [`AGENTS.md`](./AGENTS.md):

- **Don't hardcode dashboard sections in components.** The dashboard layout comes from `dashboardService`.
- **All data access goes through `src/services/*`.** Screens never fetch directly. To switch to a real backend, replace `mockRequest` calls with real `fetch` calls (use `API_BASE_URL` and `authHeaders(token)`).
- **Read context only through `src/hooks/*`** (`useAuth`, `useDashboard`). Screens don't import context modules.
- **Keep route files thin.** Screens belong in `src/screens/*`. `src/routes/*` only declares head metadata and the component. Don't edit `routeTree.gen.ts`, which is generated. See [`src/routes/README.md`](./src/routes/README.md) for routing conventions.
- **Theme**: UMN maroon (`#6B2D3B`) primary with a gold accent, defined as semantic tokens in `src/styles.css`. Fonts are Sora (headings) and Manrope (body).

## Roadmap / TODOs

- Replace mock sign-in with a real UMN SSO exchange (`AuthContext.login`).
- Point `API_BASE_URL` at the real UMN gateway and replace `mockRequest` in services.
- Deep linking. Routes already map 1:1 to paths.

## Working with Lovable

This repo is connected to the [Lovable project](https://lovable.dev/projects/ff187e39-6d0d-47e0-9456-4b439c6c703d). Changes made in Lovable are committed here, and commits pushed to `main` sync back to Lovable.

- Keep `main` in a working state.
- **Don't rewrite pushed history** (no force-push, rebase, amend or squash of pushed commits). It would wipe the project history on Lovable's side.
- `vite.config.ts` uses Lovable's preset, which already includes the TanStack, React, Tailwind, tsconfig-paths and Nitro plugins. Don't add them again.
