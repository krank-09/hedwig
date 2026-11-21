import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Document Picture-in-Picture (Chrome/Edge 116+): an always-on-top window the page controls.
interface DocumentPip {
  requestWindow(options: { width: number; height: number }): Promise<Window>;
}
const docPip = (): DocumentPip | undefined =>
  typeof window === "undefined"
    ? undefined
    : (window as unknown as { documentPictureInPicture?: DocumentPip }).documentPictureInPicture;

const WIDTH = 440;
const MARGIN = 16;

function copyStyles(target: Document) {
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const style = target.createElement("style");
      style.textContent = Array.from(sheet.cssRules, (r) => r.cssText).join("\n");
      target.head.appendChild(style);
    } catch {
      if (sheet.href) {
        const link = target.createElement("link");
        link.rel = "stylesheet";
        link.href = sheet.href;
        target.head.appendChild(link);
      }
    }
  }
}

/**
 * A non-modal floating window. In page it can be dragged by its title bar and minimised;
 * where the browser supports it, "Pop out" moves the same live content into an
 * always-on-top picture-in-picture window. On narrow screens it docks to the bottom.
 */
export function PipWindow({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [minimised, setMinimised] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [pipWin, setPipWin] = useState<Window | null>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const canPopOut = docPip() !== undefined;

  // Start in the bottom-right corner; track narrow (phone) layouts.
  useEffect(() => {
    const place = () => {
      setNarrow(window.innerWidth < 640);
      setPos((p) => {
        const h = box.current?.offsetHeight ?? 480;
        const maxX = Math.max(MARGIN, window.innerWidth - WIDTH - MARGIN);
        const maxY = Math.max(MARGIN, window.innerHeight - h - MARGIN);
        return p ? { x: Math.min(p.x, maxX), y: Math.min(p.y, maxY) } : { x: maxX, y: maxY };
      });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (narrow || !pos || (e.target as HTMLElement).closest("button")) return;
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const h = box.current?.offsetHeight ?? 0;
    setPos({
      x: Math.min(Math.max(0, e.clientX - drag.current.dx), window.innerWidth - WIDTH),
      y: Math.min(Math.max(0, e.clientY - drag.current.dy), window.innerHeight - h),
    });
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const popOut = useCallback(async () => {
    const api = docPip();
    if (!api) return;
    const win = await api.requestWindow({ width: WIDTH, height: 620 });
    copyStyles(win.document);
    win.document.title = title;
    const sync = () => {
      win.document.documentElement.dataset["theme"] =
        document.documentElement.dataset["theme"] ?? "light";
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    win.document.body.className = "bg-background text-foreground p-4";
    win.addEventListener("pagehide", () => {
      observer.disconnect();
      setPipWin(null);
    });
    setPipWin(win);
  }, [title]);

  // Closing the panel also closes a popped-out window.
  useEffect(() => () => pipWin?.close(), [pipWin]);

  if (pipWin) {
    return (
      <>
        {createPortal(children, pipWin.document.body)}
        <div
          role="status"
          className="fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm shadow-lg"
        >
          {title} is in a picture-in-picture window.
          <Button type="button" size="sm" variant="outline" onClick={() => pipWin.close()}>
            Bring back
          </Button>
        </div>
      </>
    );
  }

  const style = narrow || !pos ? undefined : { left: pos.x, top: pos.y, width: WIDTH };
  return (
    <section
      ref={box}
      role="dialog"
      aria-label={title}
      aria-modal="false"
      style={style}
      className={`fixed z-50 flex flex-col rounded-md border border-border bg-card shadow-xl ${
        narrow ? "inset-x-2 bottom-2 max-h-[70vh]" : "max-h-[calc(100vh-2rem)]"
      } ${pos || narrow ? "" : "invisible"}`}
    >
      <header
        className={`flex items-center gap-2 border-b border-border px-3 py-2 select-none ${
          narrow ? "" : "cursor-move touch-none"
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <h2 className="mr-auto text-sm font-semibold">{title}</h2>
        {canPopOut && !narrow && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={popOut}
            aria-label="Pop out to a picture-in-picture window"
            title="Pop out (stays on top)"
          >
            <ExternalLink className="size-4" aria-hidden />
          </Button>
        )}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-8"
          onClick={() => setMinimised((m) => !m)}
          aria-label={minimised ? "Expand" : "Minimise"}
          aria-expanded={!minimised}
          title={minimised ? "Expand" : "Minimise"}
        >
          {minimised ? (
            <Plus className="size-4" aria-hidden />
          ) : (
            <Minus className="size-4" aria-hidden />
          )}
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-8"
          onClick={onClose}
          aria-label="Close"
          title="Close"
        >
          <X className="size-4" aria-hidden />
        </Button>
      </header>
      {!minimised && <div className="min-h-0 overflow-auto p-3">{children}</div>}
    </section>
  );
}
