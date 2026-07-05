"use client";

import React from "react";
import { X } from "lucide-react";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "default" | "danger";
}

/**
 * 二次确认弹窗：支持双按钮（确认/取消）与单按钮（仅确定，用于替代 alert）
 * variant="danger" 时确认按钮为红色，适用于删除等操作
 */
export function ConfirmDialog({
  open,
  onClose,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  variant = "default",
}: ConfirmDialogProps) {
  if (!open) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const isAlert = cancelText == null || cancelText === "";

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-5">
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {title}
              </h3>
            )}
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 shrink-0"
            aria-label="Close"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <div className="flex justify-end gap-3 px-5 pb-5">
          {!isAlert && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${
              variant === "danger"
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
