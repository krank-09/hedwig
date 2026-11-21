import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex justify-center px-4 section-y">
      <div className="max-w-md text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-3xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {/* Docs page switched off (see src/routes/-docs.index.tsx).
          <Button asChild>
            <Link to="/docs">Docs</Link>
          </Button>
          */}
          <Button asChild>
            <Link to="/">Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/results">Results</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
