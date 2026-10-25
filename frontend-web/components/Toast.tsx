"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Toast Notification System for Scrowpoint.
 *
 * Requirements (UI Context Spec 2 Tier 2 & UI Context Spec 5, §5):
 * - Supports `info`, `error`, `warning`, and `success` variants.
 * - Semantic colors: state success, warning, error, and primary information.
 * - Auto-dismissible with configurable duration (default 5000ms).
 * - Fixed z-50 overlay positioning at top-right or bottom-right.
 * - Accessible and responsive with single-click manual dismiss.
 */

export type ToastType = "info" | "error" | "warning" | "success";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastContextValue {
  toasts: ToastMessage[];
  toast: (options: Omit<ToastMessage, "id">) => string;
  dismiss: (id: string) => void;
  info: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
  success: (title: string, description?: string) => string;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ duration = 5000, ...options }: Omit<ToastMessage, "id">) => {
      const id = "toast_" + Math.random().toString(36).slice(2, 9);
      const newToast: ToastMessage = { id, duration, ...options };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }

      return id;
    },
    [dismiss]
  );

  const info = useCallback(
    (title: string, description?: string) => toast({ type: "info", title, description }),
    [toast]
  );

  const error = useCallback(
    (title: string, description?: string) => toast({ type: "error", title, description }),
    [toast]
  );

  const warning = useCallback(
    (title: string, description?: string) => toast({ type: "warning", title, description }),
    [toast]
  );

  const success = useCallback(
    (title: string, description?: string) => toast({ type: "success", title, description }),
    [toast]
  );

  const value = useMemo(
    () => ({
      toasts,
      toast,
      dismiss,
      info,
      error,
      warning,
      success,
    }),
    [toasts, toast, dismiss, info, error, warning, success]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return context;
}

/**
 * ToastViewport renders the floating stack of toast notifications.
 */
function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex max-h-screen w-full max-w-sm flex-col gap-2 p-4 pointer-events-none sm:top-4 sm:bottom-auto sm:right-4"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

/**
 * Individual Toast Card
 */
export function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss?: () => void;
}) {
  const config = {
    info: {
      icon: Info,
      containerClasses:
        "border-border/80 bg-card text-card-foreground shadow-md border-l-4 border-l-primary",
      iconClasses: "text-primary bg-primary/10",
      badgeLabel: "INFO",
    },
    error: {
      icon: AlertCircle,
      containerClasses:
        "border-destructive/40 bg-card text-card-foreground shadow-md border-l-4 border-l-destructive",
      iconClasses: "text-destructive bg-destructive/10",
      badgeLabel: "ERROR",
    },
    warning: {
      icon: AlertTriangle,
      containerClasses:
        "border-warning/40 bg-card text-card-foreground shadow-md border-l-4 border-l-warning",
      iconClasses: "text-warning-text bg-warning/20",
      badgeLabel: "WARNING",
    },
    success: {
      icon: CheckCircle2,
      containerClasses:
        "border-state-success/40 bg-card text-card-foreground shadow-md border-l-4 border-l-state-success",
      iconClasses: "text-state-success bg-state-success/10",
      badgeLabel: "SUCCESS",
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "pointer-events-auto relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-[var(--shadow-soft-md)] backdrop-blur-md transition-all duration-200 ease-out animate-in fade-in-50 slide-in-from-top-2 sm:slide-in-from-right-4",
        config.containerClasses
      )}
    >
      {/* Type Icon */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md mt-0.5",
          config.iconClasses
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1 pr-6 min-w-0">
        <div className="flex items-center gap-2">
          <h5 className="font-heading text-xs font-bold leading-tight text-foreground truncate">
            {toast.title}
          </h5>
          <span className="label-caps text-muted-foreground px-1.5 py-0.5 rounded-md bg-muted/60">
            {config.badgeLabel}
          </span>
        </div>

        {toast.description && (
          <p className="font-body text-sm leading-5 text-muted-foreground wrap-break-words">
            {toast.description}
          </p>
        )}

        {toast.action && (
          <button
            type="button"
            onClick={toast.action.onClick}
            className="mt-2 text-xs font-semibold text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Dismiss Button */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export default ToastProvider;
