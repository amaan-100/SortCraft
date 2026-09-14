import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function Layout() {
  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col">
      <Navbar />
      {/* min-w-0 lets grid/flex children shrink instead of widening the page.
          This is a containment fix, not a blanket overflow-x-hidden. */}
      <main className="w-full min-w-0 flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col items-center justify-between gap-2 px-4 text-center text-sm text-slate-500 sm:flex-row sm:text-left sm:px-6 dark:text-slate-500">
          <p>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              SortCraft
            </span>{" "}
            — Build your understanding, one algorithm at a time.
          </p>
          <p className="text-xs">
            7 algorithms · 10 levels · quizzes, XP &amp; badges
          </p>
        </div>
      </footer>
    </div>
  );
}
