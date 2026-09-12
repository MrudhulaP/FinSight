import { useState } from "react";
import {
  Bell,
  Check,
  Database,
  Download,
  ExternalLink,
  Info,
  Monitor,
  Moon,
  Palette,
  ShieldCheck,
  Sun,
  Trash2,
  User,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL;

const NAV_ITEMS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "data", label: "Data & Privacy", icon: Database },
  { id: "about", label: "About", icon: Info },
];

function SectionHeading({ title, description }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-ink-faint">{description}</p>
      )}
    </div>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-6 py-4">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        {description && (
          <p className="mt-1 text-xs leading-5 text-ink-faint">
            {description}
          </p>
        )}
      </div>

      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ${
          checked ? "bg-accent" : "bg-surface-2"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform duration-150 ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function ThemeOption({ id, label, icon: Icon, active, onSelect }) {
  return (
    <button
      onClick={() => onSelect(id)}
      className={`relative flex flex-col gap-3 rounded-xl border p-4 text-left transition-colors duration-150 ${
        active
          ? "border-accent/50 bg-accent-soft"
          : "border-border bg-canvas hover:border-border-strong"
      }`}
    >
      {active && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
          <Check size={12} strokeWidth={3} />
        </span>
      )}

      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          active ? "bg-surface text-accent" : "bg-surface-2 text-ink-faint"
        }`}
      >
        <Icon size={17} />
      </div>

      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
      </div>
    </button>
  );
}

function ProfileSection() {
  const [name, setName] = useState("Analyst");
  const [email, setEmail] = useState("analyst@finsight.local");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <SectionHeading
        title="Profile"
        description="Details shown on cases you review and comment on."
      />

      <div className="max-w-md space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-faint">
            Display name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-border bg-canvas px-4 py-2.5 text-sm text-ink outline-none transition-colors duration-150 focus:border-accent/50"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-faint">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border bg-canvas px-4 py-2.5 text-sm text-ink outline-none transition-colors duration-150 focus:border-accent/50"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-faint">
            Role
          </label>
          <div className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-ink-muted">
            Fraud Analyst
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-accent-strong"
          >
            Save changes
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-risk-low">
              <Check size={14} />
              Saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function AppearanceSection() {
  const { mode, setTheme } = useTheme();

  return (
    <div>
      <SectionHeading
        title="Appearance"
        description="Choose how FinSight looks on this device."
      />

      <div className="grid max-w-xl grid-cols-3 gap-3">
        <ThemeOption
          id="light"
          label="Light"
          icon={Sun}
          active={mode === "light"}
          onSelect={setTheme}
        />
        <ThemeOption
          id="dark"
          label="Dark"
          icon={Moon}
          active={mode === "dark"}
          onSelect={setTheme}
        />
        <ThemeOption
          id="system"
          label="System"
          icon={Monitor}
          active={mode === "system"}
          onSelect={setTheme}
        />
      </div>

      <p className="mt-4 max-w-xl text-xs leading-5 text-ink-faint">
        Charts and risk colors update automatically to stay readable in
        either theme.
      </p>
    </div>
  );
}

function NotificationsSection() {
  const [highRiskAlerts, setHighRiskAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);

  return (
    <div>
      <SectionHeading
        title="Notifications"
        description="Decide what FinSight should notify you about."
      />

      <div className="max-w-xl divide-y divide-border rounded-2xl border border-border bg-canvas px-5">
        <Toggle
          checked={highRiskAlerts}
          onChange={setHighRiskAlerts}
          label="High-risk case alerts"
          description="Notify me as soon as a transaction is flagged high risk."
        />
        <Toggle
          checked={weeklySummary}
          onChange={setWeeklySummary}
          label="Weekly investigation summary"
          description="A recap of new cases and their outcomes, sent every Monday."
        />
        <Toggle
          checked={productUpdates}
          onChange={setProductUpdates}
          label="Product updates"
          description="Occasional notes about new FinSight features."
        />
      </div>
    </div>
  );
}

function DataSection() {
  return (
    <div>
      <SectionHeading
        title="Data & Privacy"
        description="Where your data comes from, and how to manage it locally."
      />

      <div className="max-w-xl space-y-5">
        <div className="rounded-2xl border border-border bg-canvas p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">
            Backend endpoint
          </p>
          <p className="mt-2 break-all font-data text-sm text-ink-muted">
            {API_URL || "Not configured"}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-border bg-canvas p-5">
          <div>
            <p className="text-sm font-medium text-ink">
              Export flagged cases
            </p>
            <p className="mt-1 text-xs text-ink-faint">
              Download the current anomaly list as a CSV file.
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-150 hover:border-border-strong hover:text-ink">
            <Download size={15} />
            Export
          </button>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-risk-high/20 bg-risk-high-soft p-5">
          <div>
            <p className="text-sm font-medium text-risk-high">
              Clear local cache
            </p>
            <p className="mt-1 text-xs leading-5 text-ink-muted">
              Removes cached anomaly and cash-flow data stored in this
              browser. Nothing on the backend is affected.
            </p>
          </div>
          <button className="flex shrink-0 items-center gap-2 rounded-xl border border-risk-high/30 bg-surface px-4 py-2.5 text-sm font-medium text-risk-high transition-colors duration-150 hover:bg-risk-high-soft">
            <Trash2 size={15} />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

function AboutSection() {
  return (
    <div>
      <SectionHeading title="About FinSight" />

      <div className="max-w-xl space-y-5">
        <div className="flex items-center justify-between rounded-2xl border border-border bg-canvas p-5">
          <div>
            <p className="text-sm font-medium text-ink">Version</p>
            <p className="mt-1 text-xs text-ink-faint">FinSight AI</p>
          </div>
          <span className="font-data text-sm text-ink-muted">v0.1.0</span>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-signal/15 bg-signal-soft p-5">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-signal" />
          <div>
            <p className="text-sm font-semibold text-ink">
              Evidence-grounded by design
            </p>
            <p className="mt-1 text-xs leading-5 text-ink-muted">
              Anomaly detection and evidence collection run deterministically
              in the backend. Gemini is only used to explain evidence already
              collected, never to generate financial facts.
            </p>
          </div>
        </div>

        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-strong"
        >
          View documentation
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}

function Settings() {
  const [active, setActive] = useState("profile");

  const sections = {
    profile: ProfileSection,
    appearance: AppearanceSection,
    notifications: NotificationsSection,
    data: DataSection,
    about: AboutSection,
  };

  const ActiveSection = sections[active];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Settings
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Manage your profile, appearance, and data preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="flex gap-1 overflow-x-auto lg:h-fit lg:flex-col lg:overflow-visible">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-accent-soft text-accent"
                    : "text-ink-muted hover:bg-surface-hover hover:text-ink"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="fs-enter rounded-2xl border border-border bg-surface p-6 sm:p-7">
          <ActiveSection />
        </div>
      </div>
    </div>
  );
}

export default Settings;