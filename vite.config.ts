// Build configuration. Plugin order matters:
//
//   tailwindcss -> tsConfigPaths -> tanstackStart -> nitro -> viteReact
//
// Two rules that are easy to get wrong:
//   - Never set ssr.external or resolve.external. The Cloudflare Worker has no runtime module
//     resolution, so the build fails.
//   - Never add compression (compressPublicAssets, vite-plugin-compression). Hosting compresses
//     at the edge.
//
// Nitro's own default preset is node-server, which builds a Node server with no wrangler.json
// and fails only at deploy time. The target is therefore explicit below. Override it with
// NITRO_PRESET, e.g. NITRO_PRESET=vercel.
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this.
    tanstackStart({ server: { entry: "server" } }),
    nitro({ preset: process.env["NITRO_PRESET"] ?? "cloudflare_module" }),
    viteReact(),
  ],
  resolve: {
    // A second copy of React or the TanStack runtime breaks hooks and router context.
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
});
