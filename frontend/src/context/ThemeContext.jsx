import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "finsight-theme";

const ThemeContext = createContext(null);

function getSystemPreference() {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function getStoredMode() {
  if (typeof window === "undefined") return "system";

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (stored === "dark" || stored === "light" || stored === "system") {
    return stored;
  }

  return "system";
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(getStoredMode);
  const [resolvedTheme, setResolvedTheme] = useState(() =>
    mode === "system" ? getSystemPreference() : mode
  );

  // Apply the resolved theme to <html data-theme="..."> and persist mode.
  useEffect(() => {
    const resolved = mode === "system" ? getSystemPreference() : mode;

    setResolvedTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.style.colorScheme = resolved;
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  // Track OS-level changes while in "system" mode.
  useEffect(() => {
    if (mode !== "system") return undefined;

    const mql = window.matchMedia("(prefers-color-scheme: light)");

    function handleChange() {
      const resolved = getSystemPreference();
      setResolvedTheme(resolved);
      document.documentElement.setAttribute("data-theme", resolved);
      document.documentElement.style.colorScheme = resolved;
    }

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [mode]);

  const setTheme = useCallback((next) => {
    setMode(next);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      resolvedTheme,
      setTheme,
      isDark: resolvedTheme === "dark",
    }),
    [mode, resolvedTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);

  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return ctx;
}