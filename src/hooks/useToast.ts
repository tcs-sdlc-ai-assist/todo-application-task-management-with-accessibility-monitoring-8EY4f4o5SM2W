import { useState, useCallback, useRef } from "react";
import { Toast, ToastType } from "@/src/lib/types";

const DEFAULT_DURATION = 5000;

let toastCounter = 0;

function generateToastId(): string {
  toastCounter++;
  return `toast-${Date.now()}-${toastCounter}`;
}

export interface UseToastReturn {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => string;
  removeToast: (id: string) => void;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration?: number): string => {
      const id = generateToastId();
      const toastDuration = duration ?? DEFAULT_DURATION;

      const toast: Toast = {
        id,
        type,
        message,
        duration: toastDuration,
      };

      setToasts((prev) => [...prev, toast]);

      if (toastDuration > 0) {
        const timer = setTimeout(() => {
          removeToast(id);
        }, toastDuration);

        timersRef.current.set(id, timer);
      }

      return id;
    },
    [removeToast]
  );

  return { toasts, addToast, removeToast };
}