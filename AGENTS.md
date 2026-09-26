<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project structure rules (UMN companion app)

- Dashboard content is server-driven: `dashboardService.getWidgets()` returns typed `Widget`s that `resolveWidgets()` sorts by priority and filters when empty — never hardcode dashboard sections in components.
- Data access goes through `src/services/*` (mock-backed via `mockRequest`) so real endpoints can swap in without touching UI.
- Shared state lives in `src/context/*` and is consumed only through `src/hooks/*` wrappers, keeping context imports out of screens.
- Screens live in `src/screens/*`; files under `src/routes/*` stay thin (head metadata + component) since the router is file-based.
- Auth gating and the bottom tab bar live in `RootNavigator`, mounted once in `__root.tsx`, so every route inherits the same shell.
