import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FlaskConical,
  Pause,
  PictureInPicture2,
  Play,
} from "lucide-react";
import { PipWindow } from "@/components/site/PipWindow";
import { RolePanels } from "@/components/site/RolePanels";
import {
  BreakerPanel,
  CertificatePanel,
  DetectionPanel,
  TokenPanel,
} from "@/components/site/ReplayPanels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  getPhaseStatus,
  getReplay,
  getReplayOutcome,
  scenarioOptions,
  type Replay,
  type Scenario,
} from "@/data/replays";
import { LIVE_DEMO_URL } from "@/data/site";
import { steps } from "@/data/steps";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo — HEDWIG" },
      {
        name: "description",
        content: "Replay of a simulated HEDWIG signing and verification run.",
      },
      { property: "og:title", content: "Demo — HEDWIG" },
      {
        property: "og:description",
        content: "Replay of a simulated HEDWIG signing and verification run.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  const [scenario, setScenario] = useState<Scenario>("authentic");
  // Kept here (not in ReplayPlayback) so the role panels stay open across scenario changes.
  const [panelsOpen, setPanelsOpen] = useState(false);
  const replay = getReplay(scenario);

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
        <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <div>
            <p className="mb-2 font-mono text-xs text-primary">
              {replay ? `Recorded run · seed ${replay.seed}` : "Recorded run"}
            </p>
            <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">Demo replay</h1>
          </div>
          <div className="w-full sm:w-64">
            <label htmlFor="replay-scenario" className="mb-1.5 block text-sm font-medium">
              Scenario
            </label>
            <p id="replay-scenario-note" className="mb-2 text-sm text-muted-foreground">
              All six scenarios have recorded runs.
            </p>
            <Select
              value={scenario}
              onValueChange={(value) => {
                const next = scenarioOptions.find(
                  ({ scenario, available }) => scenario === value && available,
                );
                if (next) setScenario(next.scenario);
              }}
            >
              <SelectTrigger
                id="replay-scenario"
                aria-describedby="replay-scenario-note"
                className="bg-card font-mono"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {scenarioOptions.map(({ scenario, available }) => (
                  <SelectItem
                    key={scenario}
                    value={scenario}
                    disabled={!available}
                    className="font-mono data-[disabled]:text-muted-foreground data-[disabled]:opacity-100"
                  >
                    <span className="block">{scenario}</span>
                    {!available && (
                      <span className="block font-sans text-xs">Recording not yet exported</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>
        <aside
          aria-label="Live system"
          className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3"
        >
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">This page replays recorded runs.</span>{" "}
            The live v1 system, with the Alice/admin, Bob and Charlie consoles, runs separately and
            needs a sign-in.
          </p>
          <a
            href={LIVE_DEMO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Open live v1 <ExternalLink className="size-3.5" aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </aside>
        {replay?.sample && (
          <p className="mt-6 flex items-start gap-2 rounded-sm border border-state-watch/35 bg-state-watch-bg px-3 py-2.5 text-sm text-state-watch">
            <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              <strong>Sample data.</strong> Values are illustrative, not HEDWIG research results.
            </span>
          </p>
        )}
        {replay ? (
          <ReplayPlayback
            key={scenario}
            replay={replay}
            panelsOpen={panelsOpen}
            setPanelsOpen={setPanelsOpen}
          />
        ) : (
          <p
            className="mt-6 border-y border-border py-8 text-sm text-muted-foreground"
            role="status"
          >
            No recording available for this scenario.
          </p>
        )}
      </div>
    </TooltipProvider>
  );
}

function ReplayPlayback({
  replay,
  panelsOpen,
  setPanelsOpen,
}: {
  replay: Replay;
  panelsOpen: boolean;
  setPanelsOpen: (open: boolean) => void;
}) {
  const [phase, setPhase] = useState(1);
  const [playing, setPlaying] = useState(false);
  const total = replay.frames.length;
  const frame = replay.frames[phase - 1];
  const step = steps[phase - 1];
  const { earlyAbort, tokenCount } = getReplayOutcome(replay);
  const authentic = getReplay("authentic");
  const phaseStatus = getPhaseStatus(replay, phase);
  // The run's verdict exists at the last phase, or at the channel test when the run stopped there.
  const decided = phase === total || (earlyAbort && phase >= 4);

  useEffect(() => {
    if (!playing || phase >= total) return;
    const timer = window.setTimeout(() => {
      setPhase(phase + 1);
      if (phase + 1 === total) setPlaying(false);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [phase, playing, total]);

  function seek(next: number) {
    setPlaying(false);
    setPhase(Math.min(total, Math.max(1, next)));
  }

  function togglePlayback() {
    if (playing) {
      setPlaying(false);
    } else {
      if (phase === total) setPhase(1);
      setPlaying(true);
    }
  }

  if (!frame || !step) return null;

  return (
    <>
      <div className="mt-6 space-y-1 border-y border-border py-4" aria-label="Recorded outcome">
        <p className="font-semibold">
          {earlyAbort
            ? "Sequential early abort · no signature revealed"
            : `${tokenCount} recorded tokens · all ${total} phases reached`}
        </p>
        <p className="text-sm text-muted-foreground">
          {earlyAbort
            ? `Transmission stopped at the channel test. No signature evidence existed; phases 4–5 were not reached. Authentic run: ${authentic?.tokens.length ?? 0} tokens, all ${authentic?.frames.length ?? 0} phases reached.`
            : "The signature was revealed and the run reached independent verification."}
        </p>
      </div>
      <section
        aria-label="Replay controls"
        className="my-6 rounded-md border border-border bg-card px-4 py-5 sm:px-6"
      >
        <div className="min-h-32 sm:min-h-24" aria-live={playing ? "off" : "polite"}>
          <p className="font-mono text-xs font-medium text-primary">
            Phase {phase} of {total}
            {phaseStatus === "not_reached" ? " · Not reached" : ""}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-normal sm:text-2xl">{step.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {phaseStatus === "not_reached"
              ? "Transmission stopped at the channel test before signature reveal. This phase was not reached; the panels retain the terminal channel-test readout."
              : step.body}
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-4 sm:flex-nowrap sm:gap-5">
          <div className="flex shrink-0 gap-1.5">
            <Button
              type="button"
              size="icon"
              className="size-11"
              variant="outline"
              onClick={() => seek(phase - 1)}
              disabled={phase === 1}
              aria-label="Previous phase"
              title="Previous phase"
            >
              <ChevronLeft aria-hidden />
            </Button>
            <Button
              type="button"
              size="icon"
              className="size-11"
              onClick={togglePlayback}
              aria-label={playing ? "Pause replay" : "Play replay"}
              title={playing ? "Pause replay" : "Play replay"}
            >
              {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
            </Button>
            <Button
              type="button"
              size="icon"
              className="size-11"
              variant="outline"
              onClick={() => seek(phase + 1)}
              disabled={phase === total}
              aria-label="Next phase"
              title="Next phase"
            >
              <ChevronRight aria-hidden />
            </Button>
          </div>
          <div className="min-w-36 flex-1">
            <Input
              type="range"
              min={1}
              max={total}
              step={1}
              value={phase}
              onChange={(event) => seek(event.currentTarget.valueAsNumber)}
              aria-label="Replay phase"
              aria-valuetext={`Phase ${phase} of ${total}`}
              className="m-0 h-7 cursor-pointer appearance-auto border-0 p-0 accent-primary shadow-none"
            />
            <div
              className="flex justify-between px-1 font-mono text-xs text-muted-foreground"
              aria-hidden
            >
              {replay.frames.map(({ phase: number }) => (
                <span
                  key={number}
                  className={number === phase ? "font-semibold text-primary" : undefined}
                >
                  {number}
                </span>
              ))}
            </div>
          </div>
          <Button
            type="button"
            variant={panelsOpen ? "default" : "outline"}
            className="h-11 shrink-0"
            onClick={() => setPanelsOpen(!panelsOpen)}
            aria-pressed={panelsOpen}
            title="Alice/Admin, Bob and Charlie consoles for this run"
          >
            <PictureInPicture2 aria-hidden /> Role panels
          </Button>
        </div>
      </section>
      {panelsOpen && (
        <PipWindow title={`Role panels · ${replay.scenario}`} onClose={() => setPanelsOpen(false)}>
          <p className="mb-3 font-mono text-xs text-muted-foreground">
            Phase {phase} of {total} · recorded run, seed {replay.seed}
          </p>
          <RolePanels replay={replay} phase={phase} decided={decided} />
        </PipWindow>
      )}
      <div className="grid gap-x-8 lg:grid-cols-2">
        <BreakerPanel replay={replay} phase={phase} />
        <DetectionPanel replay={replay} phase={phase} decided={decided} />
        <TokenPanel
          tokens={frame.tokenTableAvailable ? replay.tokens : null}
          earlyAbort={earlyAbort}
        />
        <CertificatePanel certificate={phase === total ? replay.certificate : null} />
      </div>
    </>
  );
}
