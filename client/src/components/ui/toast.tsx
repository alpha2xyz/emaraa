import * as React from "react";

export type ToastActionElement = React.ReactElement;

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Toast({ title, description, variant = "default", open, onOpenChange }: ToastProps) {
  if (!open) return null;
  return (
    <div
      className={`pointer-events-auto flex w-full max-w-sm rounded-lg border p-4 shadow-lg ${variant === "destructive" ? "border-red-700 bg-red-600 text-white" : "bg-gray-900 border-gray-700 text-white"}`}
    >
      <div className="flex-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      <button onClick={() => onOpenChange?.(false)} className="ml-2 text-gray-300 hover:text-white">
        ✕
      </button>
    </div>
  );
}
