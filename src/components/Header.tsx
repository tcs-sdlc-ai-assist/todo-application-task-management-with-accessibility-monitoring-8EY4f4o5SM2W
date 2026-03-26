"use client";

import React from "react";
import { useAccessibility } from "@/src/components/AccessibilityProvider";

export function Header() {
  const { highContrast, setHighContrast, reduceMotion, setReduceMotion } =
    useAccessibility();

  return (
    <header
      role="banner"
      className="border-b border-hc-border bg-hc-bg"
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-hc-fg sm:text-2xl">
            Todo App
          </h1>
        </div>

        <nav aria-label="Accessibility settings" className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="high-contrast-toggle"
              className="text-xs font-medium text-hc-fg sm:text-sm"
            >
              <span className="hidden sm:inline">High Contrast</span>
              <span className="sm:hidden">HC</span>
            </label>
            <button
              id="high-contrast-toggle"
              type="button"
              role="switch"
              aria-checked={highContrast}
              aria-label="Toggle high contrast mode"
              onClick={() => setHighContrast(!highContrast)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-hc-border transition-colors ${
                highContrast ? "bg-hc-fg" : "bg-hc-bg"
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 rounded-full border border-hc-border shadow transition-transform ${
                  highContrast
                    ? "translate-x-5 bg-hc-bg"
                    : "translate-x-0 bg-hc-fg"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <label
              htmlFor="reduce-motion-toggle"
              className="text-xs font-medium text-hc-fg sm:text-sm"
            >
              <span className="hidden sm:inline">Reduce Motion</span>
              <span className="sm:hidden">RM</span>
            </label>
            <button
              id="reduce-motion-toggle"
              type="button"
              role="switch"
              aria-checked={reduceMotion}
              aria-label="Toggle reduce motion"
              onClick={() => setReduceMotion(!reduceMotion)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-hc-border transition-colors ${
                reduceMotion ? "bg-hc-fg" : "bg-hc-bg"
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 rounded-full border border-hc-border shadow transition-transform ${
                  reduceMotion
                    ? "translate-x-5 bg-hc-bg"
                    : "translate-x-0 bg-hc-fg"
                }`}
              />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}