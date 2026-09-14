import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Code2,
  Gauge,
  GraduationCap,
  ListChecks,
  MousePointerClick,
  Play,
  Repeat2,
  ShieldCheck,
} from "lucide-react";
import { algorithmList } from "@/algorithms";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Complexity } from "@/components/ui/Complexity";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const features = [
  {
    icon: MousePointerClick,
    title: "Step-by-step control",
    body: "Play, pause, step forward and backward through every comparison and swap.",
  },
  {
    icon: Code2,
    title: "Pseudocode & Java",
    body: "Follow the highlighted pseudocode line while the bars move, then copy the Java.",
  },
  {
    icon: Gauge,
    title: "Real metrics",
    body: "Comparison counts, swap counts and complexity cards — no fake animations.",
  },
  {
    icon: Repeat2,
    title: "Your data, your array",
    body: "Random arrays from 5 to 80 bars, or paste your own list of numbers.",
  },
];

const pillars = [
  {
    icon: GraduationCap,
    label: "Ten learning levels",
    body: "A guided path from basic definitions to choosing the right algorithm, unlocked one at a time.",
    to: "/levels",
    cta: "Open the learning path",
  },
  {
    icon: ListChecks,
    label: "Quizzes & instant feedback",
    body: "Every level ends with a quiz that explains why each answer is right or wrong.",
    to: "/levels/1",
    cta: "Try Level 1",
  },
  {
    icon: ShieldCheck,
    label: "XP, badges & saved progress",
    body: "Earn XP for each quiz, collect eight badges, and sync everything to your account.",
    to: "/dashboard",
    cta: "See your dashboard",
  },
];

const demoBars = [38, 72, 20, 95, 56, 13, 84, 44, 66, 28];

export default function LandingPage() {
  const reduced = usePrefersReducedMotion();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(51,102,255,0.16),transparent)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
              7 algorithms · 10 levels · quizzes, XP &amp; badges
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Sort<span className="text-brand-600 dark:text-brand-400">Craft</span>
            </h1>
            <p className="mt-3 max-w-xl text-lg text-slate-600 dark:text-slate-400">
              Build your understanding, one algorithm at a time. An interactive sorting
              visualizer made for university students who want to see exactly what each
              line of code does.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/visualizer">
                <Button size="lg">
                  <Play className="h-4 w-4" />
                  Launch the visualizer
                </Button>
              </Link>
              <Link to="/levels">
                <Button size="lg" variant="outline">
                  Start the learning path
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <Card className="p-5">
            <div className="flex h-56 items-end gap-1.5 rounded-lg bg-slate-100/70 p-3 dark:bg-slate-950/60">
              {demoBars.map((value, i) => (
                <motion.div
                  key={i}
                  className={`flex-1 rounded-t-[3px] ${
                    i < 3 ? "bg-emerald-500" : i === 4 ? "bg-rose-500" : "bg-slate-400 dark:bg-slate-600"
                  }`}
                  initial={reduced ? false : { height: 0 }}
                  animate={{ height: `${value}%` }}
                  transition={{
                    duration: reduced ? 0 : 0.6,
                    delay: reduced ? 0 : i * 0.05,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Live preview of the bar renderer — the real visualizer adds counters,
              step controls and highlighted pseudocode.
            </p>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight">Why SortCraft?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="p-5">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Algorithms */}
      <section className="border-y border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight">Seven algorithms</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Every one is driven by the same real step engine — no faked movement.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {algorithmList.map((algo) => (
              <Card key={algo.id} className="flex flex-col p-5">
                <h3 className="text-lg font-semibold">{algo.name}</h3>
                <p className="mt-1 flex-1 text-sm text-slate-600 dark:text-slate-400">
                  {algo.tagline}
                </p>
                <dl className="mt-4 grid min-w-0 grid-cols-3 gap-2 text-center text-xs">
                  {[
                    ["Best", algo.complexity.best],
                    ["Avg", algo.complexity.average],
                    ["Worst", algo.complexity.worst],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="min-w-0 overflow-x-auto rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800/60"
                    >
                      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
                      <dd>
                        <Complexity value={value} size="xs" />
                      </dd>
                    </div>
                  ))}
                </dl>
                <Link to="/visualizer" className="mt-4">
                  <Button variant="outline" className="w-full justify-center">
                    Visualize
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Learning path */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight">More than a visualizer</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {pillars.map(({ icon: Icon, label, body, to, cta }) => (
            <Card key={label} className="flex flex-col p-5">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-semibold">{label}</h3>
              <p className="mt-1 flex-1 text-sm text-slate-600 dark:text-slate-400">
                {body}
              </p>
              <Link to={to} className="mt-4">
                <Button variant="outline" className="w-full justify-center">
                  {cta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
