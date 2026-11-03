"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CurrentUser } from "../types";

export function ChatNavigationRail({
  currentUser,
}: {
  currentUser: CurrentUser;
}) {
  const pathname = usePathname();
  const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U";

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20v-9.5z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9 21V12h6v9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      active: pathname === "/dashboard",
    },
    {
      label: "Chat",
      href: "/chat",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      active: pathname.startsWith("/chat"),
    },
    {
      label: "Mood Tracking",
      href: "/dashboard",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M8.5 9.5h.01M15.5 9.5h.01" strokeLinecap="round" />
          <path
            d="M8.5 14.5c1 1.5 2.5 2 3.5 2s2.5-.5 3.5-2"
            strokeLinecap="round"
          />
        </svg>
      ),
      active: false,
    },
    {
      label: "Resources",
      href: "/dashboard",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" strokeLinecap="round" />
        </svg>
      ),
      active: false,
    },
    {
      label: "Profile",
      href: "/dashboard",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <circle cx="12" cy="7" r="4" />
          <path
            d="M5.5 21a6.5 6.5 0 0 1 13 0"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      active: false,
    },
  ];

  return (
    <nav
      aria-label="Application Rail"
      className="hidden md:flex w-[72px] bg-[#FBEFE6] border-r border-[#F0DED1] flex-col items-center py-5 justify-between select-none shrink-0 z-20"
    >
      {/* Top: App Brand Emblem */}
      <div className="flex flex-col items-center gap-6">
        <Link
          href="/dashboard"
          title="MindGuard AI Dashboard"
          className="h-11 w-11 rounded-full bg-[#CE643B] flex items-center justify-center text-white shadow-sm hover:opacity-90 transition transform active:scale-95"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
          >
            <path
              d="M12 21s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.5-8 11-8 11Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        {/* Navigation Items Stack */}
        <div className="flex flex-col items-center gap-3">
          {navItems.map((item) => {
            if (item.active) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={item.label}
                  className="h-11 w-11 rounded-full bg-[#CE643B] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(206,100,59,0.28)] transition transform active:scale-95"
                  aria-current="page"
                >
                  {item.icon}
                  <span className="sr-only">{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                title={item.label}
                className="h-10 w-10 rounded-full text-[#8A6D5E] hover:text-[#CE643B] hover:bg-[#F3DFD1]/60 flex items-center justify-center transition transform active:scale-95"
              >
                {item.icon}
                <span className="sr-only">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom: Heart indicator + User Initials */}
      <div className="flex flex-col items-center gap-3.5">
        <div
          title="Mindful space"
          className="h-10 w-10 rounded-full bg-[#FCE6D9] text-[#CE643B] flex items-center justify-center border border-[#F3CEBA] shadow-xs cursor-default"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>

        <div
          title={`Signed in as ${currentUser.name}`}
          className="h-10 w-10 rounded-full bg-[#35251F] text-white font-medium flex items-center justify-center text-sm shadow-sm select-none"
        >
          {initial}
        </div>
      </div>
    </nav>
  );
}
