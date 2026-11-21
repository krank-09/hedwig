# Project rules

Conventions this codebase follows. Keep them in mind when changing it.

- Model threat outcomes as distinct circuit-breaker and classical variants so forwarding outcomes cannot receive circuit-breaker states or colors.
- Keep research assets and claim provenance in frontend data modules, with missing files marked explicitly so the site never links to invented sources.
- Share one post ordering function between the blog and homepage; sort supplied ISO dates newest first and preserve brief order among undated entries.
- Bundle demo replays as typed local JSON and derive playback panels from the selected frame so the demo never fetches or presents sample values as research findings.
- Classify empty-token terminal replays separately from missing data, preserving the original JSON and marking unreached phases without implying successful verification.
- Serve typefaces from the app’s own public assets so visitors need not connect to a font provider.
- Reference the rendered SVG wire from each schematic token animation so the drawing and motion cannot drift apart.
- Store supplied blog bodies as local Markdown and render with raw HTML disabled to preserve prose and formatting without executable markup.
