import { useEffect, useState } from "react";

let externalPush = null;

// optional helper you can import elsewhere if you want
export function showToast(message, opts = {}) {
  if (externalPush) {
    externalPush({
      id: Date.now() + Math.random(),
      message,
      type: opts.type || "info",
      duration: opts.duration || 3500,
    });
  }
}

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    externalPush = (toast) => {
      setToasts((prev) => [...prev, toast]);
      // auto-remove after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, toast.duration);
    };

    return () => {
      externalPush = null;
    };
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] space-y-3 max-w-sm w-[90vw] sm:w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            "rounded-xl border px-4 py-3 shadow-lg",
            "bg-[#101511]/95 backdrop-blur-sm text-sm text-[#e8ebea]",
            t.type === "error"
              ? "border-red-400/70"
              : t.type === "success"
              ? "border-[#8AE79A]/70"
              : "border-white/15",
          ].join(" ")}
        >
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-xs uppercase tracking-[0.18em] text-[#9fb2a0]">
              {t.type === "error"
                ? "ERROR"
                : t.type === "success"
                ? "SUCCESS"
                : "NOTICE"}
            </span>
          </div>
          <p className="mt-1 leading-snug">{t.message}</p>
        </div>
      ))}
    </div>
  );
}