"use client";

import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { LanguageProvider } from "@/lib/i18n";

type Theme = "light" | "dark";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <ThemeState>{children}</ThemeState>
    </LanguageProvider>
  );
}

function ThemeState({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    const stored = window.localStorage.getItem("pr-theme");
    document.documentElement.classList.toggle("dark", stored === "dark");
  }, []);
  return children;
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setThemeState(document.documentElement.classList.contains("dark") ? "dark" : "light");
    setReady(true);
  }, []);

  function setTheme(next: Theme) {
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem("pr-theme", next);
    setThemeState(next);
  }

  return { theme, setTheme, ready };
}
