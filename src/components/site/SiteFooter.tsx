import { Link } from "@tanstack/react-router";
import { SCOPE_LIMIT } from "@/data/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between">
        <p>Team ATHENA · QHack-2026</p>
        <p className="prose-width">{SCOPE_LIMIT}</p>
        <nav aria-label="Footer" className="flex gap-4">
          <Link to="/team" className="hover:text-foreground">
            Team
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
