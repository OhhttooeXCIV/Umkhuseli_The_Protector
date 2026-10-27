import { useState, useCallback } from "react";
import { ToastItem } from "../components/common/HttpToastNotification";

export function useHttpToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback(
    (
      type: "success" | "failed" | "warning" | "info",
      title: string,
      message: string,
      statusCode?: number | string,
      durationMs: number = 4500
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = {
        id,
        type,
        title,
        message,
        statusCode,
        timestamp: new Date().toISOString()
      };

      setToasts((prev) => [newToast, ...prev].slice(0, 4));

      if (durationMs > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, durationMs);
      }

      return id;
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    showToast: addToast,
    dismissToast,
    removeToast: dismissToast,
    clearToasts
  };
}
