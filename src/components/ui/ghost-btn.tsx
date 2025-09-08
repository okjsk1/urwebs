import React from "react";

export function IconStarPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l2.5 5 5.5.8-4 3.9.9 5.6L12 16l-4.9 2.3.9-5.6-4-3.9 5.5-.8L12 3z"
        stroke="currentColor"
      />
      <path d="M18 6h4M20 4v4" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}

export function IconFolderPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 7h6l2 2h10v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7z"
        stroke="currentColor"
      />
      <path d="M12 12h6M15 9v6" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: React.ReactNode;
  hint?: string;
};

export function GhostBtn({ icon, hint, children, ...rest }: BtnProps) {
  return (
    <button className="btn-ghost" {...rest}>
      {icon}
      <span>{children}</span>
      {hint ? <span className="hint">{hint}</span> : null}
    </button>
  );
}
