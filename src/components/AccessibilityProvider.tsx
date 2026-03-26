"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

interface AccessibilityContextType {
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (enabled: boolean) => void;
  announce: (message: string, priority?: "polite" | "assertive") => void;
  focusMain: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(
  undefined
);

const HC_STORAGE_KEY = "todo-app-high-contrast";
const RM_STORAGE_KEY = "todo-app-reduce-motion";

function getStoredBoolean(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const stored = localStorage.getItem(key);
    if (stored === "true") return true;
    if (stored === "false") return false;
    return fallback;
  } catch {
    return fallback;
  }
}

function setStoredBoolean(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // localStorage unavailable
  }
}

export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider."
    );
  }

  return context;
}

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({
  children,
}: AccessibilityProviderProps) {
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [reduceMotion, setReduceMotionState] = useState<boolean>(false);
  const [politeMessage, setPoliteMessage] = useState<string>("");
  const [assertiveMessage, setAssertiveMessage] = useState<string>("");

  const politeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const assertiveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    const storedHC = getStoredBoolean(HC_STORAGE_KEY, false);
    setHighContrastState(storedHC);

    const prefersContrast = window.matchMedia(
      "(prefers-contrast: more)"
    ).matches;
    if (!localStorage.getItem(HC_STORAGE_KEY) && prefersContrast) {
      setHighContrastState(true);
    }

    const storedRM = getStoredBoolean(RM_STORAGE_KEY, false);
    setReduceMotionState(storedRM);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!localStorage.getItem(RM_STORAGE_KEY) && prefersReducedMotion) {
      setReduceMotionState(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-high-contrast",
      String(highContrast)
    );
  }, [highContrast]);

  useEffect(() => {
    if (reduceMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
  }, [reduceMotion]);

  const setHighContrast = useCallback((enabled: boolean) => {
    setHighContrastState(enabled);
    setStoredBoolean(HC_STORAGE_KEY, enabled);
  }, []);

  const setReduceMotion = useCallback((enabled: boolean) => {
    setReduceMotionState(enabled);
    setStoredBoolean(RM_STORAGE_KEY, enabled);
  }, []);

  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      if (priority === "assertive") {
        if (assertiveTimeoutRef.current) {
          clearTimeout(assertiveTimeoutRef.current);
        }
        setAssertiveMessage("");
        requestAnimationFrame(() => {
          setAssertiveMessage(message);
        });
        assertiveTimeoutRef.current = setTimeout(() => {
          setAssertiveMessage("");
        }, 10000);
      } else {
        if (politeTimeoutRef.current) {
          clearTimeout(politeTimeoutRef.current);
        }
        setPoliteMessage("");
        requestAnimationFrame(() => {
          setPoliteMessage(message);
        });
        politeTimeoutRef.current = setTimeout(() => {
          setPoliteMessage("");
        }, 10000);
      }
    },
    []
  );

  const focusMain = useCallback(() => {
    const mainElement = document.getElementById("main-content");
    if (mainElement) {
      mainElement.setAttribute("tabindex", "-1");
      mainElement.focus();
      mainElement.removeAttribute("tabindex");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (politeTimeoutRef.current) {
        clearTimeout(politeTimeoutRef.current);
      }
      if (assertiveTimeoutRef.current) {
        clearTimeout(assertiveTimeoutRef.current);
      }
    };
  }, []);

  const handleSkipToContent = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.preventDefault();
      focusMain();
    },
    [focusMain]
  );

  const contextValue: AccessibilityContextType = {
    highContrast,
    setHighContrast,
    reduceMotion,
    setReduceMotion,
    announce,
    focusMain,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      <a
        href="#main-content"
        className="skip-link"
        onClick={handleSkipToContent}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleSkipToContent(e);
          }
        }}
      >
        Skip to main content
      </a>

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>

      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>

      {children}
    </AccessibilityContext.Provider>
  );
}