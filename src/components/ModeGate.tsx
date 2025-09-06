import React from "react";
import type { UIMode } from "../hooks/useUIMode";

interface ModeGateProps {
  uiMode: UIMode;
  showWhen: UIMode;
  children: React.ReactNode;
}

export function ModeGate({ uiMode, showWhen, children }: ModeGateProps) {
  if (uiMode !== showWhen) return null;
  return <>{children}</>;
}
