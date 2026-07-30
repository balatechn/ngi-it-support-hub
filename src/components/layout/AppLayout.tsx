"use client";
import { TopNav } from "./TopNav";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <TopNav />
      {title && (
        <div style={{
          padding: "8px 24px",
          borderBottom: "1px solid var(--border-1)",
          background: "var(--surface)",
          flexShrink: 0,
        }}>
          <h1 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", lineHeight: 1.4 }}>{title}</h1>
        </div>
      )}
      <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {children}
      </main>
    </div>
  );
}
