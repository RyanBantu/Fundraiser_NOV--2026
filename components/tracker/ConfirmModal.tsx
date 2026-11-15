"use client";

import { useEffect, useRef } from "react";

export function ConfirmModal({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-board/50 p-4 backdrop-blur-sm sm:items-center" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="fade-up w-full max-w-sm rounded-3xl bg-cream p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="font-display text-2xl font-semibold">
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted">{body}</p>
        <div className="mt-6 flex gap-2">
          <button ref={cancelRef} type="button" onClick={onCancel} className="flex-1 rounded-xl bg-white py-3 font-semibold ring-1 ring-line">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="flex-1 rounded-xl bg-ember py-3 font-semibold text-cream">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
