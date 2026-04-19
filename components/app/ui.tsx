import Link from "next/link";
import type { ReactNode } from "react";

// ============================================================================
// Page Header — every dashboard page starts with one of these.
// Editorial style: italic lowercase kicker + large display heading.
// ============================================================================

export function PageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-10 flex items-start justify-between gap-4">
      <div className="min-w-0">
        {kicker && (
          <p className="mb-2 font-display italic text-lg text-brand-400">
            {kicker}
          </p>
        )}
        <h1 className="font-display text-4xl leading-tight tracking-tight text-ink-100 sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-base text-ink-300">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ============================================================================
// Section Card — standard content container
// ============================================================================

export function SectionCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-ink-800 bg-ink-900/40 backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Empty State — when there's no data to show
// ============================================================================

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <SectionCard className="p-10 text-center">
      <p className="mb-2 font-display italic text-2xl text-brand-400">—</p>
      <h3 className="mb-2 font-display text-xl">{title}</h3>
      {description && (
        <p className="mx-auto mb-6 max-w-md text-sm text-ink-300">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </SectionCard>
  );
}

// ============================================================================
// Button — primary + secondary + ghost
// ============================================================================

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-500 text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600",
  secondary:
    "border border-ink-700 bg-ink-900/60 text-ink-100 hover:border-ink-600 hover:bg-ink-800",
  ghost: "text-ink-300 hover:bg-ink-900 hover:text-ink-100",
  danger:
    "border border-red-500/30 bg-red-500/5 text-red-300 hover:bg-red-500/10",
};

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  children,
  className = "",
  ...rest
}: ButtonBaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizeCls =
    size === "sm" ? "px-3 py-1.5 text-sm" : "px-5 py-3 text-sm font-medium";
  return (
    <button
      {...rest}
      className={`rounded-xl transition disabled:cursor-not-allowed disabled:opacity-40 ${BUTTON_STYLES[variant]} ${sizeCls} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  fullWidth,
  children,
  className = "",
}: ButtonBaseProps & { href: string }) {
  const sizeCls =
    size === "sm" ? "px-3 py-1.5 text-sm" : "px-5 py-3 text-sm font-medium";
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-xl transition ${BUTTON_STYLES[variant]} ${sizeCls} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {children}
    </Link>
  );
}

// ============================================================================
// Form primitives
// ============================================================================

export function Label({
  children,
  required,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-ink-300">
      {children}
      {required && <span className="ml-1 text-brand-500">*</span>}
    </span>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-ink-100 placeholder-ink-500 outline-none transition focus:border-brand-500 ${props.className ?? ""}`}
    />
  );
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-ink-100 placeholder-ink-500 outline-none transition focus:border-brand-500 ${props.className ?? ""}`}
    />
  );
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & {
    children: ReactNode;
  },
) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-ink-100 outline-none transition focus:border-brand-500 ${props.className ?? ""}`}
    >
      {props.children}
    </select>
  );
}

// ============================================================================
// Chip / Tag — toggleable labeled options
// ============================================================================

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        active
          ? "border-brand-500 bg-brand-500/10 text-brand-400"
          : "border-ink-700 bg-ink-900/40 text-ink-200 hover:border-ink-600"
      }`}
    >
      {children}
    </button>
  );
}

// ============================================================================
// Error + Success banners
// ============================================================================

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
      {message}
    </div>
  );
}

export function InfoBanner({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-900/40 p-4 text-sm text-ink-200">
      {children}
    </div>
  );
}

// ============================================================================
// Skeleton loader
// ============================================================================

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-ink-900/60 ${className}`}
    />
  );
}

// ============================================================================
// Stat tile — editorial stat display
// ============================================================================

export function StatTile({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
      <p className="mb-2 truncate text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-400">
        {label}
      </p>
      <p
        className="break-words font-display font-normal tracking-tight text-ink-100"
        style={{ fontSize: 26, lineHeight: 1.1, letterSpacing: "-0.02em" }}
      >
        {value}
      </p>
      {subtext && (
        <p className="mt-2 text-[11px] leading-[1.4] text-ink-400">{subtext}</p>
      )}
    </div>
  );
}
