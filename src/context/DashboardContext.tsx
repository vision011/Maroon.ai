import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { dashboardService } from "@/services/dashboardService";
import { resolveSections, type DashboardResponse, type ResolvedSection } from "@/types/sdui";
import { REFRESH_CACHE_MS } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuth";

export interface DashboardContextValue {
  sections: ResolvedSection[];
  greeting: DashboardResponse["greeting"] | null;
  metadata: DashboardResponse["metadata"] | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  refresh: (force?: boolean) => Promise<void>;
}

export const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { student, isAuthenticated } = useAuth();
  const [response, setResponse] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedAt = useRef<number | null>(null);

  const load = useCallback(
    async (force = false) => {
      if (!isAuthenticated || !student) return;
      const fresh =
        lastFetchedAt.current !== null && Date.now() - lastFetchedAt.current < REFRESH_CACHE_MS;
      if (!force && fresh) return;

      const initial = response === null;
      if (initial) setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        const data = await dashboardService.getWidgets(
          student.id,
          student.name.split(" ")[0] ?? student.name,
        );
        setResponse(data);
        lastFetchedAt.current = Date.now();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load your dashboard.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isAuthenticated, student, response],
  );

  useEffect(() => {
    if (isAuthenticated) void load();
    else {
      setResponse(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, student?.id]);

  const value = useMemo<DashboardContextValue>(
    () => ({
      sections: response ? resolveSections(response.sections, response.widgets) : [],
      greeting: response?.greeting ?? null,
      metadata: response?.metadata ?? null,
      loading,
      refreshing,
      error,
      lastFetchedAt: lastFetchedAt.current,
      refresh: load,
    }),
    [response, loading, refreshing, error, load],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
