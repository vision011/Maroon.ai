import { useCallback, useEffect, useRef, useState } from "react";
import { useDashboard } from "./useDashboard";

const PULL_THRESHOLD = 70;

/**
 * Touch pull-to-refresh at the top of the scroll container, with the
 * 10s cache honoured by DashboardContext (force=true bypasses it).
 */
export function usePullToRefresh() {
  const { refresh, refreshing } = useDashboard();
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef<number | null>(null);

  const trigger = useCallback(() => refresh(true), [refresh]);

  useEffect(() => {
    function onStart(e: TouchEvent) {
      if (window.scrollY <= 0) startY.current = e.touches[0]?.clientY ?? null;
    }
    function onMove(e: TouchEvent) {
      if (startY.current === null) return;
      const delta = (e.touches[0]?.clientY ?? 0) - startY.current;
      setPullDistance(delta > 0 ? Math.min(delta, PULL_THRESHOLD * 1.5) : 0);
    }
    function onEnd() {
      if (pullDistance >= PULL_THRESHOLD) void trigger();
      startY.current = null;
      setPullDistance(0);
    }
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [pullDistance, trigger]);

  return { pullDistance, pulling: pullDistance > 0, refreshing, trigger };
}
