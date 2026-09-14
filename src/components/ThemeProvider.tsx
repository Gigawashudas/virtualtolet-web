"use client";

import { useEffect } from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
};

export default function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    const savedTheme = window.localStorage.getItem("virtualtolet-theme");

    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  return <>{children}</>;
}
