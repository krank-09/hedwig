import { Link } from "@tanstack/react-router";
import { Github, Menu, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { REPO_URL } from "@/data/site";
import { OwlMark } from "./OwlMark";
import { ThemeToggle } from "./ThemeToggle";

const linkCls = "rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground";
const activeCls = "text-foreground font-medium";

function NavItems({ onNav }: { onNav?: () => void }) {
  return (
    <>
      <Link
        to="/results"
        className={linkCls}
        activeProps={{ className: activeCls }}
        onClick={onNav}
      >
        Results
      </Link>
      <Link to="/demo" className={linkCls} activeProps={{ className: activeCls }} onClick={onNav}>
        Demo
      </Link>
      <Link
        to="/science"
        className={linkCls}
        activeProps={{ className: activeCls }}
        onClick={onNav}
      >
        Science
      </Link>
      <Link to="/docs" className={linkCls} activeProps={{ className: activeCls }} onClick={onNav}>
        Docs
      </Link>
      <Link
        to="/docs/limitations"
        className={linkCls}
        activeProps={{ className: activeCls }}
        onClick={onNav}
      >
        Limitations
      </Link>
      <Link to="/team" className={linkCls} activeProps={{ className: activeCls }} onClick={onNav}>
        Team
      </Link>
    </>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLButtonElement>(null);
  return (
    <header
      className="sticky top-0 z-40 border-b border-border bg-background"
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          setOpen(false);
          menu.current?.focus();
        }
      }}
    >
      <div className="mx-auto flex h-[var(--header-height)] max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link
          to="/"
          aria-label="HEDWIG home"
          className="inline-flex items-center gap-2.5 font-mono text-base font-semibold tracking-[0.2em] text-foreground"
        >
          <OwlMark className="size-7 shrink-0" />
          <span>HEDWIG</span>
        </Link>
        <nav aria-label="Primary" className="ml-4 hidden items-center gap-1 lg:flex">
          <NavItems />
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {REPO_URL && (
            <a
              href={REPO_URL}
              aria-label="GitHub repository"
              className="inline-flex size-9 items-center justify-center rounded-md border border-border hover:bg-muted"
            >
              <Github className="size-4" aria-hidden />
            </a>
          )}
          <ThemeToggle />
          <Button
            ref={menu}
            type="button"
            variant="outline"
            size="icon"
            className="size-11 shrink-0 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          </Button>
        </div>
      </div>
      <nav
        id="mobile-nav"
        aria-label="Primary mobile"
        hidden={!open}
        className="flex flex-col gap-1 border-t border-border px-4 py-3 not-hidden:flex lg:hidden"
      >
        <NavItems
          onNav={() => {
            setOpen(false);
            menu.current?.focus();
          }}
        />
      </nav>
    </header>
  );
}
