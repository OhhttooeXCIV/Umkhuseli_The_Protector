import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export interface ToastItem {
  id: string;
  type: "success" | "failed" | "warning" | "info";
  statusCode?: number | string;
  title: string;
  message: string;
  timestamp?: string;
}

interface Props {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const HttpToastNotification: React.FC<Props> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="System Feedback Notifications"
      className="fixed top-4 right-4 left-4 z-[9999] max-w-md mx-auto pointer-events-none flex flex-col gap-2.5"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isFailed = toast.type === "failed";
        const isWarning = toast.type === "warning";

        const bgClass = isSuccess
          ? "bg-slate-900 border-emerald-500 text-emerald-200 shadow-emerald-950/40"
          : isFailed
          ? "bg-slate-900 border-rose-500 text-rose-200 shadow-rose-950/40"
          : isWarning
          ? "bg-slate-900 border-amber-500 text-amber-200 shadow-amber-950/40"
          : "bg-slate-900 border-sky-500 text-sky-200 shadow-sky-950/40";

        const badgeClass = isSuccess
          ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/50"
          : isFailed
          ? "bg-rose-950/80 text-rose-300 border-rose-700/50"
          : isWarning
          ? "bg-amber-950/80 text-amber-300 border-amber-700/50"
          : "bg-sky-950/80 text-sky-300 border-sky-700/50";

        const IconComponent = isSuccess
          ? CheckCircle2
          : isFailed
          ? AlertCircle
          : isWarning
          ? AlertTriangle
          : Info;

        return (
          <div
            key={toast.id}
            data-testid={`http-toast-${toast.type}`}
            className={`pointer-events-auto border rounded-2xl p-3.5 shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-top-3 flex items-start justify-between gap-3 ${bgClass}`}
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 shrink-0">
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white tracking-tight">
                    {toast.title}
                  </span>
                  {toast.statusCode && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold ${badgeClass}`}>
                      {typeof toast.statusCode === "number"
                        ? `HTTP ${toast.statusCode}`
                        : toast.statusCode}
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300 font-medium">
                  {toast.message}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
