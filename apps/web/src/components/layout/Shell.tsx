import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useConfig } from "../../hooks/use-config.ts";
import { useTheme } from "../../hooks/use-theme.ts";
import { SearchDialog } from "../search/SearchDialog.tsx";
import { DesktopNav, MobileMenu } from "./NavTabs.tsx";

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  const { readonly, version } = useConfig();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const isGraphPage = location.pathname === "/graph";

  // Close mobile menu on route change
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Cmd+K / Ctrl+K - open search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      // "/" key - open search (only when not in input/textarea)
      if (
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
          e.preventDefault();
          setSearchOpen(true);
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <div className={`overflow-x-hidden bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 ${isGraphPage ? "h-screen flex flex-col overflow-hidden" : "min-h-screen"}`}>
      <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <Link
                to="/tasks"
                className="text-lg font-semibold tracking-tight"
              >
                taskmd
              </Link>
              {version && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {version}
                </span>
              )}
              {readonly && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  Read Only
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <DesktopNav onSearchOpen={() => setSearchOpen(true)} />
              {/* Theme toggle - always visible */}
              <button
                onClick={toggle}
                className="ml-1 p-2.5 sm:p-1.5 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 inline-flex items-center justify-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              {/* Hamburger button - mobile only */}
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="md:hidden ml-1 p-2.5 sm:p-1.5 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 inline-flex items-center justify-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {menuOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        {menuOpen && <MobileMenu />}
      </header>
      <main className={isGraphPage ? "px-2 py-2 flex-1 min-h-0" : "max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-6"}>{children}</main>
      <SearchDialog open={searchOpen} onClose={closeSearch} />
    </div>
  );
}
