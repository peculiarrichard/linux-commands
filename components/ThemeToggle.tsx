"use client";

import { useState, useEffect } from "react";

type Theme = "system" | "light" | "dark";

// Icons from Lucide Icons:
// You can remove them and use text if you perfer.
// https://lucide.dev/icons/sun
// https://lucide.dev/icons/moon
// https://lucide.dev/icons/monitor

const SunIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-sun-icon lucide-sun"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);
const MoonIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-moon-icon lucide-moon"
  >
    <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
  </svg>
);
const SystemIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-monitor-icon lucide-monitor"
  >
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </svg>
);

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || "system";
    }
    return "system";
  });

  // Apply theme to DOM whenever state changes
  useEffect(() => {
    const root = window.document.documentElement;
    const systemMedia = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      if (theme === "system") {
        root.removeAttribute("data-theme");
      } else {
        root.dataset.theme = theme;
      }
    };

    applyTheme();
    localStorage.setItem("theme", theme);

    const handleSystemChange = () => {
      if (theme === "system") applyTheme();
    };

    systemMedia.addEventListener("change", handleSystemChange);
    return () => systemMedia.removeEventListener("change", handleSystemChange);
  }, [theme]);

  const themeButtons = [
    { id: "light" as Theme, icon: SunIcon, label: "Light" },
    { id: "dark" as Theme, icon: MoonIcon, label: "Dark" },
    { id: "system" as Theme, icon: SystemIcon, label: "System" },
  ];

  // Single cycling button for mobile
  const nextTheme: Record<Theme, Theme> = { light: "dark", dark: "system", system: "light" };

  return (
    <>
      {/* Mobile: single cycling button */}
      <button
        onClick={() => setTheme(nextTheme[theme])}
        className="inline-flex items-center p-1.5 border border-border rounded-md sm:hidden bg-bg text-fg hover:bg-accent/70 hover:text-accent-fg transition-colors duration-300"
        aria-label={`Theme: ${theme}. Click to change.`}
      >
        {theme === "light" ? SunIcon : theme === "dark" ? MoonIcon : SystemIcon}
      </button>

      {/* Desktop: full 3-button group */}
      <div className="hidden sm:inline-flex" role="group">
        {themeButtons.map((btn, index) => {
          const isActive = theme === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => setTheme(btn.id)}
              className={`p-1.5 border border-border ${isActive ? "bg-accent text-accent-fg" : "bg-bg text-fg"}
            ${index === 0 ? "rounded-l-md" : ""} ${index === themeButtons.length - 1 ? "rounded-r-md" : ""}
            hover:bg-accent/70 hover:text-accent-fg transition-colors duration-300`}
              aria-label={btn.label}
            >
              {btn.icon}
            </button>
          );
        })}
      </div>
    </>
  );
}
