import { useRef, useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyCommands({ commands }: { commands: readonly string[] }) {
  const code = useRef<HTMLElement>(null);
  const [status, setStatus] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(commands.join("\n"));
      setStatus("Copied");
    } catch {
      const selection = window.getSelection();
      if (selection && code.current) {
        const range = document.createRange();
        range.selectNodeContents(code.current);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setStatus("Copy unavailable");
    }
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2">
        <span className="eyebrow">Commands</span>
        <div className="flex items-center gap-3">
          <span role="status" className="text-xs text-muted-foreground">
            {status}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={copy}>
            <Copy aria-hidden /> Copy commands
          </Button>
        </div>
      </div>
      <pre className="wrap-anywhere whitespace-pre-wrap p-4 font-mono text-sm leading-7">
        <code ref={code}>{commands.join("\n")}</code>
      </pre>
    </div>
  );
}
