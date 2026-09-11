"use client";

import { useEffect, useState } from "react";
import { usePay8Ui } from "@/lib/pay8-ui-store";
import { usePay8 } from "@/lib/pay8-store";
import { X, Check, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function ToastHost() {
  const toasts = usePay8Ui((s) => s.toastQueue);
  const dismiss = usePay8Ui((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-3">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: { id: string; title: string; description?: string; variant?: "default" | "success" | "error" | "warning" };
  onDismiss: () => void;
}) {
  const Icon =
    toast.variant === "success" ? Check : toast.variant === "error" ? AlertTriangle : toast.variant === "warning" ? AlertTriangle : Info;
  const accent =
    toast.variant === "success"
      ? "text-accent bg-accent/10"
      : toast.variant === "error"
        ? "text-destructive bg-destructive/10"
        : toast.variant === "warning"
          ? "text-amber-600 bg-amber-100"
          : "text-primary bg-primary/10";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-border bg-card p-3 pay8-elev-2"
    >
      <div className={cn("mt-0.5 rounded-full p-1.5", accent)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground">{toast.title}</div>
        {toast.description && <div className="mt-0.5 text-xs text-muted-foreground">{toast.description}</div>}
      </div>
      <button onClick={onDismiss} className="rounded-full p-1 text-muted-foreground hover:bg-muted">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

interface PinPadProps {
  purpose: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PinPad({ purpose, onSuccess, onCancel }: PinPadProps) {
  const verifyPin = usePay8((s) => s.verifyPin);
  const [entry, setEntry] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (entry.length === 6) {
      const t = setTimeout(() => {
        if (verifyPin(entry)) {
          setEntry("");
          setError(false);
          onSuccess();
        } else {
          setError(true);
          setEntry("");
        }
      }, 120);
      return () => clearTimeout(t);
    }
  }, [entry, onSuccess, verifyPin]);

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"];

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl border-t border-border bg-card px-6 pb-8 pt-6 pay8-elev-3"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Pay8 Secure PIN</div>
          <div className="mt-1 text-lg font-semibold text-foreground">{purpose}</div>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-3.5 w-3.5 rounded-full border-2 transition-all",
                i < entry.length
                  ? error
                    ? "border-destructive bg-destructive"
                    : "border-primary bg-primary"
                  : error
                    ? "border-destructive/60"
                    : "border-border",
              )}
            />
          ))}
        </div>

        {error && (
          <div className="mt-3 text-center text-xs text-destructive">Incorrect PIN. Please try again.</div>
        )}

        <div className="mt-6 grid grid-cols-3 gap-3">
          {keys.map((k, idx) => {
            const isAction = k === "clear" || k === "back";
            return (
              <button
                key={`${k}-${idx}`}
                onClick={() => {
                  if (k === "clear") {
                    setEntry("");
                    setError(false);
                  } else if (k === "back") {
                    setEntry((e) => e.slice(0, -1));
                  } else if (entry.length < 6) {
                    setError(false);
                    setEntry((e) => e + k);
                  }
                }}
                className={cn(
                  "flex h-14 items-center justify-center rounded-2xl text-xl font-medium transition-all active:scale-95",
                  isAction ? "bg-muted text-muted-foreground hover:bg-muted/80" : "bg-muted/50 text-foreground hover:bg-muted",
                )}
              >
                {k === "back" ? "⌫" : k === "clear" ? "C" : k}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            setEntry("");
            onCancel();
          }}
          className="mt-4 w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
}
