import type { Metadata } from "next";
import React from "react";
import { AccessibilityProvider } from "@/src/components/AccessibilityProvider";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import { ToastProvider } from "@/src/components/ToastContext";
import { Header } from "@/src/components/Header";
import "@/src/app/globals.css";

export const metadata: Metadata = {
  title: "Todo App",
  description: "An accessible todo application for managing your tasks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AccessibilityProvider>
          <ErrorBoundary>
            <ToastProvider>
              <div className="flex min-h-screen flex-col">
                <Header />

                <main
                  id="main-content"
                  role="main"
                  className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 lg:px-8"
                >
                  {children}
                </main>

                <footer
                  role="contentinfo"
                  className="border-t border-hc-border bg-hc-bg"
                >
                  <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-hc-fg opacity-60">
                      © {new Date().getFullYear()} Todo App. All rights reserved.
                    </p>
                  </div>
                </footer>
              </div>
            </ToastProvider>
          </ErrorBoundary>
        </AccessibilityProvider>
      </body>
    </html>
  );
}