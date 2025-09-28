import { ReactNode } from "react";

interface DashboardLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function DashboardLayout({ title, description, actions, children }: DashboardLayoutProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
        {actions}
      </header>
      <main>{children}</main>
    </div>
  );
}
