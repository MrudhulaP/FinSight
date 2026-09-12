import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export function useAnomalies({ auto = true } = {}) {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(`${API_BASE}/anomalies`);

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const data = await response.json();

      setAnomalies(Array.isArray(data.anomalies) ? data.anomalies : []);
    } catch (err) {
      setError(
        "Unable to connect to the FinSight backend. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (auto) {
      load(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto]);

  const stats = useMemo(() => {
    const high = anomalies.filter((item) => item.risk_level === "HIGH");
    const medium = anomalies.filter((item) => item.risk_level === "MEDIUM");
    const low = anomalies.filter((item) => item.risk_level === "LOW");

    const flaggedValue = anomalies.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const largestCase =
      anomalies.length > 0
        ? [...anomalies].sort(
            (a, b) => Number(b.amount || 0) - Number(a.amount || 0)
          )[0]
        : null;

    return {
      total: anomalies.length,
      high,
      medium,
      low,
      highCount: high.length,
      mediumCount: medium.length,
      lowCount: low.length,
      flaggedValue,
      largestCase,
    };
  }, [anomalies]);

  return {
    anomalies,
    loading,
    refreshing,
    error,
    stats,
    refresh: () => load(true),
    reload: () => load(false),
  };
}