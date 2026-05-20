import type { ReactNode } from "react";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section
      style={{
        background: "var(--paper-2)",
        padding: "72px 0",
        minHeight: "calc(100vh - 220px)",
      }}
    >
      <div className="wrap" style={{ maxWidth: 520 }}>
        <div
          style={{
            background: "var(--paper-card)",
            border: "1px solid var(--rule)",
            borderRadius: 12,
            padding: "40px 36px",
            boxShadow: "0 14px 40px rgba(24,19,15,0.06)",
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 12 }}>
            Arthub
          </div>
          <h1
            className="serif"
            style={{ fontSize: 32, lineHeight: 1.1, marginBottom: 8 }}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="muted" style={{ marginTop: 0, marginBottom: 28 }}>
              {subtitle}
            </p>
          ) : (
            <div style={{ height: 16 }} />
          )}
          {children}
          {footer ? (
            <div
              style={{
                marginTop: 24,
                paddingTop: 20,
                borderTop: "1px solid var(--rule)",
                fontSize: 13.5,
                color: "var(--ink-soft)",
                textAlign: "center",
              }}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid var(--rule-strong)",
  borderRadius: 8,
  background: "#fff",
  color: "var(--ink)",
  font: "inherit",
  outline: "none",
};

export const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ink-soft)",
  marginBottom: 6,
};

export const fieldStyle: React.CSSProperties = { marginBottom: 18 };

export const errorBoxStyle: React.CSSProperties = {
  background: "#FBECE6",
  border: "1px solid #C56A4A55",
  color: "#7B2E18",
  padding: "10px 12px",
  borderRadius: 8,
  fontSize: 13.5,
  marginBottom: 18,
};
