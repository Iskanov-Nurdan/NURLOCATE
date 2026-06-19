import type { ReactNode } from "react";

export function Card({
  title,
  children,
  className = "",
  noPadding = false,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <section
      className={`rounded-card border border-border bg-panel shadow-card ${
        noPadding ? "" : "p-5"
      } ${className}`}
    >
      {title ? (
        <h2
          className={`text-base font-semibold text-text ${
            noPadding ? "px-5 pt-5 pb-4" : "mb-4"
          }`}
        >
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between border-b border-border px-5 py-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
