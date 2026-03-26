"use client";

import React from "react";

type SpinnerSize = "sm" | "md" | "lg";

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  label?: string;
}

function getSizeClasses(size: SpinnerSize): string {
  switch (size) {
    case "sm":
      return "h-4 w-4 border-2";
    case "md":
      return "h-8 w-8 border-3";
    case "lg":
      return "h-12 w-12 border-4";
    default:
      return "h-8 w-8 border-3";
  }
}

export function LoadingSpinner({
  size = "md",
  label = "Loading",
}: LoadingSpinnerProps) {
  const sizeClasses = getSizeClasses(size);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className="flex items-center justify-center"
    >
      <div
        className={`${sizeClasses} animate-spin rounded-full border-hc-border border-t-transparent`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}