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
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur supports-[backdrop-filter]:bg-canvas/70">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:px-6">
        <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-500 text-[#04201d]">
            <BarChart3 className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </span>
          <span className="truncate text-[17px] font-semibold tracking-tight">
            Sort<span className="text-brand-600 dark:text-brand-400">Craft</span>
          </span>
        </Link>

        <nav className="hidden min-w-0 items-center gap-0.5 lg:flex">
          {publicLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-surface-2 text-fg"
                    : "text-ink hover:bg-surface-2 hover:text-fg"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="h-[18px] w-[18px]" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
          </Button>

          {/* Desktop auth area. While `loading` is true we render a neutral
              skeleton so logged-out buttons never flash for a signed-in user. */}
          <div className="hidden items-center gap-1.5 md:flex">
            {loading ? (
              <div
                className="h-9 w-32 animate-pulse rounded-md bg-surface-2"
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
            {open ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-canvas px-3 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium",
                    isActive
                      ? "bg-surface-2 text-fg"
                      : "text-ink"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="mt-2 border-t border-line pt-3">
              {loading ? (
                <div
                  className="h-10 w-full animate-pulse rounded-md bg-surface-2"
                  role="status"
                  aria-label="Checking your session"
                />
              ) : user ? (
                <>
                  <div className="mb-2 flex items-center gap-2.5 px-1">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-500 text-xs font-bold text-white">
                      {initialsOf(displayName)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {displayName}
                      </span>
                      <span className="block text-xs text-muted">Signed in</span>
                    </span>
                  </div>
                  {accountLinks.map(({ to, label, Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-ink"
                    >
                      <Icon className="h-4 w-4 text-muted" />
                      {label}
                    </NavLink>
                  ))}
                  <button
                    onClick={handleSignOut}
                    className="mt-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-rose-500"
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
                      <Button className="w-full justify-center">
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