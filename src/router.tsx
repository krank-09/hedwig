import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { PageError } from "@/components/site/PageError";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  // One client per request: a module-level QueryClient leaks cached data between SSR requests.
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultErrorComponent: PageError,
    // Lets Query own freshness; set caching defaults on the QueryClient, not the router.
    defaultPreloadStaleTime: 0,
  });

  return router;
};
