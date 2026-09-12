import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

const TOKENS = [
  "--color-ink",
  "--color-ink-muted",
  "--color-ink-faint",
  "--color-border",
  "--color-surface",
  "--color-surface-2",
  "--color-accent",
  "--color-accent-soft",
  "--color-signal",
  "--color-risk-high",
  "--color-risk-high-soft",
  "--color-risk-medium",
  "--color-risk-medium-soft",
  "--color-risk-low",
  "--color-risk-low-soft",
];

function toCamel(token) {
  return token
    .replace("--color-", "")
    .replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function readTokens() {
  if (typeof window === "undefined") return {};

  const styles = getComputedStyle(document.documentElement);
  const result = {};

  TOKENS.forEach((token) => {
    result[toCamel(token)] = styles.getPropertyValue(token).trim();
  });

  return result;
}

export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState(readTokens);

  useEffect(() => {
    // Defer one frame so the data-theme attribute has already
    // applied before we read the resulting CSS variable values.
    const id = requestAnimationFrame(() => setColors(readTokens()));
    return () => cancelAnimationFrame(id);
  }, [resolvedTheme]);

  return colors;
}