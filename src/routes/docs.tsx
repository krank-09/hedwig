import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

// Layout for /docs/* (Limitations lives at /docs/limitations). The /docs index page is
// switched off (see -docs.index.tsx), so a bare /docs shows the 404 page instead of a blank one.
export const Route = createFileRoute("/docs")({
  beforeLoad: ({ location }) => {
    if (location.pathname.replace(/\/$/, "") === "/docs") throw notFound();
  },
  component: Outlet,
});
