"use client";

import React, { createContext, useContext } from "react";
import { useToast, UseToastReturn } from "@/src/hooks/useToast";
import { ToastContainer } from "@/src/components/ToastContainer";
import { ToastType } from "@/src/lib/types";

interface ToastContextType {
  addToast: (type: ToastType, message: string, duration?: number) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToastContext(): ToastContextType {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToastContext must be used within a ToastProvider."
    );
  }

  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { toasts, addToast, removeToast }: UseToastReturn = useToast();

  const contextValue: ToastContextType = {
    addToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}