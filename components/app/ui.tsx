import Link from "next/link";
import type { ReactNode } from "react";

// ============================================================================
// PageHeader — birebir Claude Design UI.jsx:3-14
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
    <div
      className="flex items-start justify-between gap-4"
      style={{ marginBottom: 40 }}
    >
      <div className="min-w-0 flex-1">
        {kicker && (
          <p
            className="m-0 font-display italic text-brand-400"
            style={{ marginBottom: 8, fontSize: 18 }}
          >
            {kicker}
          </p>
        )}
        <h1
          className="m-0 font-display text-ink-100"
          style={{
            fontWeight: 400,
            fontSize: 42,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="m-0 text-ink-300"
            style={{
              marginTop: 12,
              maxWidth: 640,
              fontSize: 15,
              lineHeight: 1.55,
            }}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ============================================================================
// SectionCard — birebir Claude Design UI.jsx:16-42
// ============================================================================

export function SectionCard({
  children,
  className = "",
  hoverable,
  accent,
  onClick,
  style,
}: {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  accent?: "brand";
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const accentClass = accent === "brand"
    ? "border-brand-500/30 bg-gradient-to-br from-brand-500/5 to-transparent"
    : `border-ink-800 bg-ink-900/40 ${hoverable ? "hover:border-brand-500/40 hover:bg-ink-900/60" : ""}`;

  return (
    <div
      onClick={onClick}
      className={`rounded-[20px] border backdrop-blur-[8px] transition-all duration-[160ms] ${accentClass} ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Button — birebir Claude Design UI.jsx:44-94
// ============================================================================

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-500 text-white shadow-[0_10px_20px_-8px_rgba(225,29,72,0.4)] hover:bg-brand-600 border-0",
  secondary:
    "border border-ink-700 bg-ink-900/60 text-ink-100 hover:border-ink-600 hover:bg-ink-800",
  ghost:
    "text-ink-300 hover:bg-ink-900 hover:text-ink-100 border-0 bg-transparent",
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
  // CD sm: padding 6px 14px, fontSize 13
  // CD md: padding 12px 20px, fontSize 14, fontWeight 500
  const sizeStyle =
    size === "sm"
      ? "px-[14px] py-[6px] text-[13px]"
      : "px-5 py-3 text-[14px] font-medium";
  return (
    <button
      {...rest}
      className={`rounded-[14px] transition-all duration-[160ms] disabled:cursor-not-allowed disabled:opacity-40 ${BUTTON_STYLES[variant]} ${sizeStyle} ${
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
  const sizeStyle =
    size === "sm"
      ? "px-[14px] py-[6px] text-[13px]"
      : "px-5 py-3 text-[14px] font-medium";
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-[14px] transition-all duration-[160ms] ${BUTTON_STYLES[variant]} ${sizeStyle} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {children}
    </Link>
  );
}

// ============================================================================
// Label — birebir Claude Design UI.jsx:96-103
// ============================================================================

export function Label({
  children,
  required,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <span
      className="block font-semibold uppercase text-ink-300"
      style={{
        marginBottom: 8,
        fontSize: 10,
        letterSpacing: "0.25em",
      }}
    >
      {children}
      {required && <span className="ml-1 text-brand-500">*</span>}
    </span>
  );
}

// ============================================================================
// Input — birebir Claude Design UI.jsx:105-129
// ============================================================================

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-[14px] border border-ink-700 bg-ink-900/60 text-ink-100 placeholder-ink-500 outline-none transition-[border] duration-[160ms] focus:border-brand-500 ${props.className ?? ""}`}
      style={{
        padding: "12px 16px",
        fontSize: 15,
        boxSizing: "border-box",
        ...props.style,
      }}
    />
  );
}

// ============================================================================
// Textarea — birebir Claude Design UI.jsx:131-158
// ============================================================================

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={`w-full resize-y rounded-[14px] border border-ink-700 bg-ink-900/60 text-ink-100 placeholder-ink-500 outline-none transition-[border] duration-[160ms] focus:border-brand-500 ${props.className ?? ""}`}
      style={{
        padding: "12px 16px",
        fontSize: 15,
        lineHeight: 1.55,
        boxSizing: "border-box",
        ...props.style,
      }}
    />
  );
}

// ============================================================================
// Select
// ============================================================================

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & {
    children: ReactNode;
  },
) {
  return (
    <select
      {...props}
      className={`w-full rounded-[14px] border border-ink-700 bg-ink-900/60 text-ink-100 outline-none transition-[border] duration-[160ms] focus:border-brand-500 ${props.className ?? ""}`}
      style={{
        padding: "12px 16px",
        fontSize: 15,
        boxSizing: "border-box",
        ...props.style,
      }}
    >
      {props.children}
    </select>
  );
}

// ============================================================================
// Chip — birebir Claude Design UI.jsx:160-178
// ============================================================================

export function Chip({
  active,
  children,
  onClick,
  small,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border transition-all duration-[160ms] ${
        active
          ? "border-brand-500 text-brand-400"
          : "border-ink-700 text-ink-200 hover:border-ink-600"
      }`}
      style={{
        padding: small ? "6px 12px" : "8px 16px",
        fontSize: small ? 12 : 14,
        background: active ? "rgba(225,29,72,0.12)" : "rgba(17,17,24,0.4)",
      }}
    >
      {children}
    </button>
  );
}

// ============================================================================
// StatTile — birebir Claude Design UI.jsx:180-188
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
    <SectionCard style={{ padding: 20, minWidth: 0, overflow: "hidden" }}>
      <p
        className="m-0 truncate font-semibold uppercase text-ink-400"
        style={{
          marginBottom: 8,
          fontSize: 10,
          letterSpacing: "0.25em",
        }}
      >
        {label}
      </p>
      <p
        className="m-0 break-words font-display text-ink-100"
        style={{
          fontWeight: 400,
          fontSize: 26,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </p>
      {subtext && (
        <p
          className="m-0 text-ink-400"
          style={{ marginTop: 8, fontSize: 11, lineHeight: 1.4 }}
        >
          {subtext}
        </p>
      )}
    </SectionCard>
  );
}

// ============================================================================
// InfoBanner — birebir Claude Design UI.jsx:190-199
// ============================================================================

export function InfoBanner({
  children,
  variant = "info",
}: {
  children: ReactNode;
  variant?: "info" | "error";
}) {
  const isError = variant === "error";
  return (
    <div
      className={`rounded-[14px] border ${
        isError
          ? "border-red-500/30 bg-red-500/5 text-red-300"
          : "border-ink-700 bg-ink-900/40 text-ink-200"
      }`}
      style={{ padding: 14, fontSize: 13, lineHeight: 1.55 }}
    >
      {children}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return <InfoBanner variant="error">{message}</InfoBanner>;
}

// ============================================================================
// Empty State
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
    <SectionCard style={{ padding: 40 }}>
      <div className="text-center">
        <p
          className="m-0 font-display italic text-brand-400"
          style={{ marginBottom: 8, fontSize: 22 }}
        >
          —
        </p>
        <h3
          className="m-0 font-display text-ink-100"
          style={{
            marginBottom: 8,
            fontSize: 22,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            className="mx-auto m-0 text-ink-300"
            style={{
              marginBottom: 24,
              maxWidth: 420,
              fontSize: 14,
              lineHeight: 1.55,
            }}
          >
            {description}
          </p>
        )}
        {action}
      </div>
    </SectionCard>
  );
}

// ============================================================================
// Skeleton loader
// ============================================================================

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[14px] bg-ink-900/60 ${className}`} />;
}
