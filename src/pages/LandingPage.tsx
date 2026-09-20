import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Gauge,
  GraduationCap,
  MousePointerClick,
  Play,
  Repeat2,
} from "lucide-react";
import { algorithmList } from "@/algorithms";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Complexity } from "@/components/ui/Complexity";
import { LiveDemoStage } from "@/components/demo/LiveDemoStage";

const capabilities = [
  {
    index: "01",
    icon: MousePointerClick,
    title: "Step engine",
    body: "Play, pause and step through every comparison and swap — one bar at a time, backwards or forwards.",
  },
  {
    index: "02",
    icon: Code2,
    title: "Pseudocode to Java",
    body: "The highlighted pseudocode line tracks the bars, and the full Java implementation is one copy away.",
  },
  {
    index: "03",
    icon: Gauge,
    title: "Real metrics",
    body: "Live comparison and swap counters on every run. What you see is what the algorithm actually did.",
  },
  {
    index: "04",
    icon: Repeat2,
    title: "Your data",
    body: "Random, reversed, nearly sorted or sawtooth presets — or paste in your own array.",
  },
];

const curriculumNodes = Array.from({ length: 10 }, (_, i) => i + 1);

export default function LandingPage() {
  return (
    <div>
      {/* ============================= HERO ============================= */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(72%_55%_at_50%_0%,color-mix(in_oklab,var(--color-brand-500)_14%,transparent),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <p className="overline flex items-center gap-2 text-brand-600 dark:text-brand-400">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Interactive sorting lab
            </p>
            <h1 className="mt-4 text-[2.6rem] font-semibold leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              See every comparison.
              <br />
              <span className="text-brand-600 dark:text-brand-400">
                Understand why it wins.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink">
              An interactive sorting-algorithm lab: step through real comparisons
              and swaps, follow the pseudocode, race algorithms head-to-head, and
              work a guided path of ten levels — quizzes, XP and badges included.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/visualizer">
                <Button size="lg">
                  <Play className="h-4 w-4" />
                  Launch the visualizer
                </Button>
              </Link>
              <Link to="/levels">
                <Button size="lg" variant="outline">
                  Start the 10-level path
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="mt-6 font-mono text-[11px] text-muted">
              ▸ 7 algorithms · 10 levels · no sign-up needed to explore
            </p>
          </div>

          <LiveDemoStage className="shadow-[0_24px_60px_-24px_color-mix(in_oklab,var(--color-brand-500)_40%,transparent)]" />
        </div>
      </section>

      {/* ========================== WORKBENCH ========================== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="overline text-muted">The workbench</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Built for the way you actually learn
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(({ index, icon: Icon, title, body }) => (
            <Card key={title} className="flex flex-col p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-[11px] text-brand-600 dark:text-brand-400">
                  {index}
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-2 text-ink">
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                </span>
              </div>
              <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ========================== CATALOGUE ========================== */}
      <section
        id="algorithms"
        className="scroll-mt-20 border-y border-line bg-surface py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="overline text-muted">The catalogue</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Seven algorithms, one step engine
              </h2>
              <p className="mt-1.5 max-w-xl text-sm text-ink">
                Every entry is driven by the same real frame recorder — no faked
                movement. Complexity windows are typical for random input.
              </p>
            </div>
            <Link to="/compare">
              <Button variant="outline">
                Race them head-to-head
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-col gap-2.5">
            {algorithmList.map((algo) => (
              <Card
                key={algo.id}
                className="group p-4 transition-colors hover:border-line-strong"
              >
                <div className="grid items-center gap-x-4 gap-y-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto_auto_auto]">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold tracking-tight">
                      {algo.name}
                    </h3>
                    <p className="font-mono text-[11px] text-muted">{algo.id}</p>
                  </div>
                  <p className="text-sm leading-relaxed text-ink">{algo.tagline}</p>
                  <span className="justify-self-start rounded border border-line bg-surface-2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted">
                    {algo.family}
                  </span>
                  <div className="whitespace-nowrap font-mono text-[11px] text-muted">
                    <span>best </span>
                    <span className="text-fg">
                      <Complexity value={algo.complexity.best} size="xs" />
                    </span>
                    <span className="mx-1.5">·</span>
                    <span>avg </span>
                    <span className="text-fg">
                      <Complexity value={algo.complexity.average} size="xs" />
                    </span>
                    <span className="mx-1.5">·</span>
                    <span>worst </span>
                    <span className="text-fg">
                      <Complexity value={algo.complexity.worst} size="xs" />
                    </span>
                  </div>
                  <Link to="/visualizer" className="justify-self-start lg:justify-self-end">
                    <Button variant="outline" size="sm">
                      Visualize
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== CURRICULUM ========================== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="overline text-muted">The learning path</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Ten levels, a straight line to fluency
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink">
              Each level teaches one idea and ends with a quiz that explains every
              answer. Pass the quiz, earn XP and badges, unlock the next node.
            </p>
            <Link to="/levels" className="mt-5 inline-block">
              <Button variant="outline">
                <GraduationCap className="h-4 w-4" />
                Open the learning path
              </Button>
            </Link>
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between font-mono text-[11px] text-muted">
              <span>LEVELS 01–10</span>
            </div>
            <div className="mt-5 flex items-center">
              {curriculumNodes.map((n, i) => (
                <div key={n} className="flex items-center">
                  <span
                    aria-hidden
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-xs transition-colors ${
                      n <= 4
                        ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400"
                        : "border-line-strong text-muted"
                    }`}
                  >
                    {n <= 4 ? "●" : n}
                  </span>
                  {i < curriculumNodes.length - 1 && (
                    <span
                      aria-hidden="true"
                      className={`mx-1 h-px flex-1 ${
                        n <= 4 ? "bg-brand-500/60" : "bg-line"
                      }`}
                      style={{ minWidth: 12 }}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-5 font-mono text-[11px] text-muted">
              10 levels · 8 quizzes · XP &amp; badges synced to your account
            </p>
          </Card>
        </div>
      </section>

      {/* =========================== CTA ============================== */}
      <section className="relative overflow-hidden border-t border-line bg-surface">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_120%,color-mix(in_oklab,var(--color-brand-500)_16%,transparent),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Start seeing inside your algorithms
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink">
            No account needed to open the lab — sign in later and your XP, badges
            and level progress follow you anywhere.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/visualizer">
              <Button size="lg">
                <Play className="h-4 w-4" />
                Launch the visualizer
              </Button>
            </Link>
            <Link to="/levels">
              <Button size="lg" variant="outline">
                Start the 10-level path
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="mt-6 font-mono text-[11px] text-muted">
            bubble · selection · insertion · shell · merge · quick · heap
          </p>
        </div>
      </section>
    </div>
  );
}