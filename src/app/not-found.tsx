import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found - Todo App",
  description: "The page you are looking for could not be found.",
};

export default function NotFound() {
  return (
    <div
      role="alert"
      className="card flex flex-col items-center justify-center gap-4 p-8 text-center"
    >
      <h2 className="text-xl font-bold text-hc-fg">
        404 — Page Not Found
      </h2>
      <p className="text-sm text-hc-fg opacity-80">
        The page you are looking for does not exist or has been moved.
      </p>
      <a
        href="/"
        className="btn btn-primary"
        aria-label="Go back to the home page"
      >
        Go to Home
      </a>
    </div>
  );
}