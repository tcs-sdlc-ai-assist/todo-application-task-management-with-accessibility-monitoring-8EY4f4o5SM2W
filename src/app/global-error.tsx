"use client";

import React, { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: {
        component: "GlobalError",
        action: "root-layout-error",
      },
      extra: {
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Something went wrong - Todo App</title>
      </head>
      <body>
        <div
          role="alert"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: "16px",
            padding: "32px",
            textAlign: "center",
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
            lineHeight: 1.5,
            backgroundColor: "#ffffff",
            color: "#000000",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              margin: 0,
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              fontSize: "14px",
              opacity: 0.8,
              margin: 0,
            }}
          >
            A critical error occurred. Please try again.
          </p>
          {error.message && (
            <p
              style={{
                fontSize: "14px",
                color: "#dc2626",
                margin: 0,
              }}
              aria-live="polite"
            >
              {error.message}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            aria-label="Retry loading the page"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              border: "1px solid #000000",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: 500,
              backgroundColor: "#000000",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}