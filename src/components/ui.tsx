import type { ReactNode } from "react";
import type { Fit, InquiryStatus, Severity } from "@/lib/types";
import { statusLabel } from "@/lib/format";

export function Card({
  children,
  className = "",
  title,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  phase,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  phase?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="text-xs font-medium tracking-wide text-slate-500">{eyebrow}</p>}
        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {phase && <PhaseTag label={phase} />}
        </div>
        {description && <p className="mt-2 max-w-3xl text-sm text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PhaseTag({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-navy-200 bg-navy-50 px-2.5 py-0.5 text-xs font-semibold text-navy-700">
      {label}
    </span>
  );
}

const statusStyles: Record<InquiryStatus, string> = {
  pending_review: "bg-amber-50 text-amber-800 border-amber-200",
  approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
  revised: "bg-sky-50 text-sky-800 border-sky-200",
  escalated: "bg-rose-50 text-rose-800 border-rose-200",
  draft: "bg-slate-50 text-slate-600 border-slate-200",
};

export function StatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}>
      {statusLabel[status]}
    </span>
  );
}

const fitStyles: Record<Fit, string> = {
  "◎": "bg-emerald-600 text-white",
  "○": "bg-sky-600 text-white",
  "△": "bg-amber-500 text-white",
  "×": "bg-rose-600 text-white",
};

export function FitBadge({ fit, size = "md" }: { fit: Fit; size?: "md" | "lg" }) {
  const dim = size === "lg" ? "h-12 w-12 text-2xl" : "h-7 w-7 text-sm";
  return (
    <span className={`inline-flex items-center justify-center rounded-lg font-bold ${dim} ${fitStyles[fit]}`}>
      {fit}
    </span>
  );
}

const severityStyles: Record<Severity, string> = {
  高: "bg-rose-100 text-rose-800",
  中: "bg-amber-100 text-amber-800",
  低: "bg-slate-100 text-slate-700",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${severityStyles[severity]}`}>
      重要度 {severity}
    </span>
  );
}

export function Chip({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "navy" | "green" | "amber" | "rose" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    navy: "bg-navy-50 text-navy-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-800",
    rose: "bg-rose-50 text-rose-700",
  };
  return <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function Confidence({ value }: { value: number }) {
  const color = value >= 85 ? "bg-emerald-500" : value >= 70 ? "bg-sky-500" : "bg-amber-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums text-slate-700">{value}%</span>
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "navy",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  tone?: "navy" | "green" | "amber" | "sky";
}) {
  const tones = {
    navy: "bg-navy-50 text-navy-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    sky: "bg-sky-50 text-sky-700",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        {icon && <span className={`rounded-lg p-1.5 ${tones[tone]}`}>{icon}</span>}
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  const styles = {
    primary: "bg-navy-700 text-white hover:bg-navy-800 disabled:bg-slate-300",
    secondary: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 disabled:text-slate-400",
    danger: "border border-rose-300 bg-white text-rose-700 hover:bg-rose-50",
    ghost: "text-slate-600 hover:bg-slate-100",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function KeyValue({ items }: { items: { k: string; v: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-y-1 text-sm">
      {items.map(({ k, v }) => (
        <div key={k} className="flex justify-between gap-4 border-b border-slate-100 py-1.5">
          <dt className="shrink-0 text-slate-500">{k}</dt>
          <dd className="text-right font-medium text-slate-800">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
