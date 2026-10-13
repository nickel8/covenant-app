"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function CovenantLogo() {
  // Two rings, filled overlap = agreed terms
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="15" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
      {/* filled overlap lens */}
      <path
        d="M12 6.07a7 7 0 0 1 0 11.86A7 7 0 0 1 12 6.07z"
        fill="currentColor"
        opacity="0.25"
      />
    </svg>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top nav */}
      <header className="h-12 border-b border-border bg-surface flex items-center px-5 gap-4 shrink-0">
        <Link href="/assets/asset-1" className="flex items-center gap-2 text-brand font-medium">
          <CovenantLogo />
          <span className="font-display text-[17px]">Covenant</span>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center font-mono text-[11px]">
            SR
          </div>
          <span className="text-[13px] text-muted hidden sm:block">Sam Reid</span>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
