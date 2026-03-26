"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { Toast, ToastType } from "@/src/lib/types";

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

function getToastStyles(type: ToastType): string {
  switch (type) {
    case "success":
      return "border-hc-success bg-hc-bg text-hc-fg";
    case "error":
      return "border-hc-error bg-hc-bg text-hc-fg";
    case "warning":
      return "border-hc-border bg-hc-bg text-hc-fg";
    case "info":
    default:
      return "border-hc-border bg-hc-bg text-hc-fg";
  }
}

function getToastIcon(type: ToastType): string {
  switch (type) {
    case "success":
      return "✓";
    case "error":
      return "✕";
    case "warning":
      return "⚠";
    case "info":
    default:
      return "ℹ";
  }
}

function getToastLabel(type: ToastType): string {
  switch (type) {
    case "success":
      return "Success";
    case "error":
      return "Error";
    case "warning":
      return "Warning";
    case "info":
    default:
      return "Information";
  }
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const toastRef = useRef<HTMLDivElement>(null);

  const handleDismiss = useCallback(() => {
    onDismiss(toast.id);
  }, [onDismiss, toast.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleDismiss();
      }
    },
    [handleDismiss]
  );

  useEffect(() => {
    const el = toastRef.current;
    if (el) {
      const dismissButton = el.querySelector<HTMLButtonElement>(
        "[data-toast-dismiss]"
      );
      if (dismissButton) {
        dismissButton.focus();
      }
    }
  }, []);

  const styles = getToastStyles(toast.type);
  const icon = getToastIcon(toast.type);
  const label = getToastLabel(toast.type);

  return (
    <div
      ref={toastRef}
      className={`card flex items-start gap-3 border-l-4 p-4 shadow-md ${styles}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      onKeyDown={handleKeyDown}
    >
      <span className="flex-shrink-0 text-lg" aria-hidden="true">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-sm mt-0.5">{toast.message}</p>
      </div>
      <button
        type="button"
        data-toast-dismiss
        className="flex-shrink-0 inline-flex items-center justify-center rounded-md p-1 text-hc-fg hover:opacity-70 transition-opacity"
        onClick={handleDismiss}
        aria-label={`Dismiss ${label.toLowerCase()} notification: ${toast.message}`}
      >
        <span aria-hidden="true" className="text-lg leading-none">
          ×
        </span>
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 w-full max-w-sm"
      aria-label="Notifications"
      role="region"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}