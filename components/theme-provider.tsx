"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem("theme");
  return stored === "light" || stored === "dark" ? stored : "system";
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

export function applyThemeClass(theme: Theme) {
  if (typeof window === "undefined") return;
  document.documentElement.classList.toggle(
    "dark",
    resolveTheme(theme) === "dark",
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] =
    useState<ResolvedTheme>("light");
  const themeRef = useRef<Theme>("system");

  useEffect(() => {
    const initial = getInitialTheme();
    themeRef.current = initial;
    setThemeState(initial);
    setResolvedTheme(resolveTheme(initial));
    applyThemeClass(initial);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (themeRef.current === "system") {
        setResolvedTheme(resolveTheme("system"));
        applyThemeClass("system");
      }
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const setTheme = (next: Theme) => {
    themeRef.current = next;
    setThemeState(next);
    setResolvedTheme(resolveTheme(next));
    localStorage.setItem("theme", next);
    applyThemeClass(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeCtx() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeCtx must be used within ThemeProvider");
  }
  return ctx;
}