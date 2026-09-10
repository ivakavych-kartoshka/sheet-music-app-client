"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeCtx } from "@/components/theme-provider";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useThemeCtx();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  if (compact) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground transition-colors duration-200"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label="Chuyển giao diện"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-border/40 bg-background/50 p-1">
      <Button
        type="button"
        variant={!isDark ? "secondary" : "ghost"}
        size="sm"
        className="h-8 rounded-lg px-2.5 transition-colors duration-200"
        onClick={() => setTheme("light")}
      >
        <Sun className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant={isDark ? "secondary" : "ghost"}
        size="sm"
        className="h-8 rounded-lg px-2.5 transition-colors duration-200"
        onClick={() => setTheme("dark")}
      >
        <Moon className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
