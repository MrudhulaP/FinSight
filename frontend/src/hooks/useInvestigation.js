import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export function useInvestigation({ autoSelectFirst = true } = {}) {
  const [anomalies, setAnomalies] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [investigation, setInvestigation] = useState(null);

  const [loadingAnomalies, setLoadingAnomalies] = useState(true);
  const [loadingInvestigation, setLoadingInvestigation] = useState(false);
  const [error, setError] = useState("");

  const loadAnomalies = useCallback(async () => {
    try {
      setLoadingAnomalies(true);
      setError("");

      const response = await fetch(`${API_BASE}/anomalies`);

      if (!response.ok) {
        throw new Error("Unable to load anomalies.");
      }

      const data = await response.json();
      const items = Array.isArray(data.anomalies) ? data.anomalies : [];

      setAnomalies(items);

      if (items.length > 0) {
        if (autoSelectFirst) {
          setSelectedId((current) => current || items[0].invoice_id);
        }
      } else {
        setSelectedId("");
        setInvestigation(null);
      }
    } catch (err) {
      setError(
        "Could not connect to the FinSight backend. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setLoadingAnomalies(false);
    }
  }, [autoSelectFirst]);

  const loadInvestigation = useCallback(async (invoiceId) => {
    if (!invoiceId) return;

    try {
      setLoadingInvestigation(true);
      setError("");
      setInvestigation(null);

      const response = await fetch(`${API_BASE}/trail/${invoiceId}`);

      if (!response.ok) {
        throw new Error("Unable to load investigation.");
      }

      const data = await response.json();
      setInvestigation(data);
    } catch (err) {
      setError(
        `Could not load the investigation for ${invoiceId}. Check that the backend is running.`
      );
    } finally {
      setLoadingInvestigation(false);
    }
  }, []);

  useEffect(() => {
    loadAnomalies();
  }, [loadAnomalies]);

  useEffect(() => {
    if (selectedId) {
      loadInvestigation(selectedId);
    }
  }, [selectedId, loadInvestigation]);

  const selectedAnomaly = useMemo(
    () => anomalies.find((item) => item.invoice_id === selectedId) || null,
    [anomalies, selectedId]
  );

  const trail = investigation?.trail || null;
  const steps = trail?.steps || [];

  return {
    anomalies,
    selectedId,
    setSelectedId,
    selectedAnomaly,
    investigation,
    trail,
    steps,
    loadingAnomalies,
    loadingInvestigation,
    error,
    reload: loadAnomalies,
    reinvestigate: () => loadInvestigation(selectedId),
  };
}