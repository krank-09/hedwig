import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  band = false,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  band?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={`border-t border-section-divider ${band ? "bg-surface-section" : ""}`}
    >
      <div className="mx-auto max-w-6xl px-4 section-y sm:px-6">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="mt-2 text-2xl font-semibold sm:text-3xl">
          {title}
        </h2>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
