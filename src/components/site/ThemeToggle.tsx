import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export const THEME_KEY = "starlight-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  useEffect(() => {
    setTheme(document.documentElement.dataset["theme"] === "dark" ? "dark" : "light");
  }, []);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset["theme"] = next;
    localStorage.setItem(THEME_KEY, next);
    setTheme(next);
  };
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="size-11 shrink-0"
    >
      {theme === "dark" ? (
        <Sun className="size-4" aria-hidden />
      ) : (
        <Moon className="size-4" aria-hidden />
      )}
    </Button>
  );
}
