import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Menu,
  Monitor,
  Moon,
  Search,
  Settings as SettingsIcon,
  ShieldAlert,
  Sun,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/overview", label: "Overview", icon: ShieldAlert },
  { to: "/investigations", label: "Investigations", icon: Search },
  { to: "/transactions", label: "Transactions", icon: Wallet },
  { to: "/cash-flow", label: "Cash Flow", icon: TrendingUp },
  { to: "/ai-assistant", label: "AI Assistant", icon: Brain },
];

const PAGE_TITLES = {
  "/": "Dashboard",
  "/overview": "Overview",
  "/investigations": "Investigations",
  "/transactions": "Transactions",
  "/cash-flow": "Cash Flow",
  "/ai-assistant": "AI Assistant",
  "/settings": "Settings",
};

function NavItem({ item, collapsed, onNavigate }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
          isActive
            ? "bg-accent-soft text-accent"
            : "text-ink-muted hover:bg-surface-hover hover:text-ink"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-accent transition-all duration-200 ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          />
          <Icon size={18} className="shrink-0" />
          {!collapsed && <span className="truncate">{item.label}</span>}

          {collapsed && (
            <span className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-ink opacity-0 shadow-elevated transition-opacity duration-150 group-hover:opacity-100">
              {item.label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function ThemeToggle({ compact = false }) {
  const { mode, setTheme } = useTheme();

  const options = [
    { key: "light", icon: Sun, label: "Light" },
    { key: "dark", icon: Moon, label: "Dark" },
    { key: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-border bg-surface p-0.5 ${
        compact ? "" : ""
      }`}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const active = mode === option.key;

        return (
          <button
            key={option.key}
            type="button"
            onClick={() => setTheme(option.key)}
            title={option.label}
            aria-label={option.label}
            aria-pressed={active}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 ${
              active
                ? "bg-accent text-white"
                : "text-ink-faint hover:text-ink"
            }`}
          >
            <Icon size={14} />
          </button>
        );
      })}
    </div>
  );
}

export default function AppShell() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("finsight-nav-collapsed") === "1";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(
      "finsight-nav-collapsed",
      collapsed ? "1" : "0"
    );
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const pageTitle = PAGE_TITLES[location.pathname] || "FinSight";

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 ease-out lg:flex ${
          collapsed ? "w-[76px]" : "w-[248px]"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <ShieldAlert size={19} />
          </div>

          {!collapsed && (
            <div className="min-w-0 fs-enter">
              <p className="truncate text-sm font-bold text-ink">
                FinSight AI
              </p>
              <p className="truncate text-[11px] text-ink-faint">
                From anomaly to evidence
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {!collapsed && (
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
              Workspace
            </p>
          )}

          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>

        <div className="space-y-1 border-t border-border px-3 py-3">
          <NavItem
            item={{ to: "/settings", label: "Settings", icon: SettingsIcon }}
            collapsed={collapsed}
          />

          {!collapsed && (
            <div className="px-3 pt-2">
              <ThemeToggle />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-10 items-center justify-center border-t border-border text-ink-faint transition-colors hover:bg-surface-hover hover:text-ink"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="fs-enter absolute left-0 top-0 h-full w-[260px] border-r border-border bg-surface p-3">
            <div className="mb-4 flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <ShieldAlert size={17} />
                </div>
                <p className="text-sm font-bold text-ink">FinSight AI</p>
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-surface-hover hover:text-ink"
              >
                <X size={17} />
              </button>
            </div>

            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <NavItem
                  key={item.to}
                  item={item}
                  collapsed={false}
                  onNavigate={() => setMobileOpen(false)}
                />
              ))}
            </nav>

            <div className="mt-3 space-y-1 border-t border-border pt-3">
              <NavItem
                item={{
                  to: "/settings",
                  label: "Settings",
                  icon: SettingsIcon,
                }}
                collapsed={false}
                onNavigate={() => setMobileOpen(false)}
              />
              <div className="px-3 pt-2">
                <ThemeToggle />
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-hover hover:text-ink lg:hidden"
            >
              <Menu size={19} />
            </button>

            <h1 className="text-sm font-semibold text-ink sm:text-base">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-risk-low/30 bg-risk-low-soft px-3 py-1.5 text-[11px] font-semibold text-risk-low sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-risk-low" />
              System nominal
            </div>

            <div className="lg:hidden">
              <ThemeToggle compact />
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}