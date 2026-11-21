export function Placeholder({ title, note }: { title: string; note: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 section-y sm:px-6">
      <p className="eyebrow">Under construction</p>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h1>
      <p className="mt-4 prose-width text-muted-foreground">
        This page has not been built yet. <span className="placeholder-text">{note}</span>
      </p>
    </div>
  );
}
