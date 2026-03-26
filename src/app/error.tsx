"use client";

import React, { useEffect } from "react";
import { logError } from "@/src/lib/logger";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    logError(error, {
      component: "ErrorPage",
      action: "global-error",
      extra: {
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <div
      role="alert"
      className="card flex flex-col items-center justify-center gap-4 p-8 text-center"
    >
      <h2 className="text-xl font-bold text-hc-fg">
        Something went wrong
      </h2>
      <p className="text-sm text-hc-fg opacity-80">
        An unexpected error occurred. Please try again.
      </p>
      {error.message && (
        <p className="error-text" aria-live="polite">
          {error.message}
        </p>
      )}
      <button
        type="button"
        className="btn btn-primary"
        onClick={reset}
        aria-label="Retry loading the page"
      >
        Try again
      </button>
    </div>
  );
}