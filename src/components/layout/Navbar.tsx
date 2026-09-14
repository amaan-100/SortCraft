import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, LogIn, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/Button";
import { AccountMenu, accountLinks } from "./AccountMenu";
import { initialsOf } from "@/utils/displayName";
import { cn } from "@/utils/cn";

/** Routes anyone may visit. */
const publicLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/visualizer", label: "Visualizer" },
  { to: "/compare", label: "Compare" },
  { to: "/levels", label: "Levels" },
];

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, displayName, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [location.pathname]);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:px-6">
        <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
            <BarChart3 className="h-5 w-5" />
          </span>
          <span className="truncate text-lg font-bold tracking-tight">
            Sort<span className="text-brand-600 dark:text-brand-400">Craft</span>
          </span>
        </Link>

        <nav className="hidden min-w-0 items-center gap-1 lg:flex">
          {publicLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Desktop auth area. While `loading` is true we render a neutral
              skeleton so logged-out buttons never flash for a signed-in user. */}
          <div className="hidden items-center gap-2 md:flex">
            {loading ? (
              <div
                className="h-9 w-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800"
                aria-label="Checking your session"
                role="status"
              />
            ) : user ? (
              <AccountMenu />
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="h-4 w-4" />
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-3 py-3 lg:hidden dark:border-slate-800 dark:bg-slate-950">
          <nav className="flex flex-col gap-1">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium",
                    isActive
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                      : "text-slate-600 dark:text-slate-400"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="mt-2 border-t border-slate-200 pt-3 dark:border-slate-800">
              {loading ? (
                <div
                  className="h-10 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800"
                  role="status"
                  aria-label="Checking your session"
                />
              ) : user ? (
                <>
                  <div className="mb-2 flex items-center gap-2.5 px-1">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
                      {initialsOf(displayName)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {displayName}
                      </span>
                      <span className="block text-xs text-slate-500">Signed in</span>
                    </span>
                  </div>
                  {accountLinks.map(({ to, label, Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300"
                    >
                      <Icon className="h-4 w-4 text-slate-400" />
                      {label}
                    </NavLink>
                  ))}
                  <button
                    onClick={handleSignOut}
                    className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-rose-600 dark:text-rose-400"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Link to="/login" className="min-w-0 flex-1">
                      <Button variant="outline" className="w-full justify-center">
                        Log in
                      </Button>
                    </Link>
                    <Link to="/signup" className="min-w-0 flex-1">
                      <Button variant="secondary" className="w-full justify-center">
                        Sign up
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
