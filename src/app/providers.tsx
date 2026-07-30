"use client";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

function ThemeInit() {
  useEffect(() => {
    const stored = localStorage.getItem("ngi-theme");
    const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored ?? (sysDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeInit />
      {children}
    </SessionProvider>
  );
}
