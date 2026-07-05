"use client";

import { useEffect, useState } from "react";
import type { ModalField } from "./types";

export interface DailyGrowModalProps {
  open: boolean;
  title: string;
  subtitle: string;
  fields: ModalField[];
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: (data: Record<string, string>) => void;
  onCancel: () => void;
}

export function DailyGrowModal({
  open,
  title,
  subtitle,
  fields,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: DailyGrowModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const initial: Record<string, string> = {};
    fields.forEach((f) => {
      initial[f.id] =
        f.defaultValue !== undefined ? String(f.defaultValue) : "";
    });
    setValues(initial);
  }, [open, fields]);

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm(values);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-none border-2 border-[#1A1A1A] p-6 w-full max-w-[310px] shadow-[6px_6px_0px_0px_#1A1A1A] flex flex-col gap-4">
        <div className="text-center">
          <h4 className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-1">
            {title}
          </h4>
          <h3 className="text-xs font-bold text-[#1A1A1A]">{subtitle}</h3>
        </div>

        <div>
          {fields.map((f) => {
            if (f.type === "text" || f.type === "number") {
              return (
                <div key={f.id} className="mb-3">
                  <input
                    type={f.type}
                    value={values[f.id] ?? ""}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [f.id]: e.target.value }))
                    }
                    className="w-full bg-white border border-[#1A1A1A] rounded-none py-2.5 px-3 text-xs font-bold text-black outline-none focus:border-black transition-all"
                    placeholder={f.placeholder}
                  />
                </div>
              );
            }

            if (f.type === "select") {
              return (
                <div key={f.id} className="mb-3">
                  {f.label && (
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 font-accent">
                      {f.label}
                    </label>
                  )}
                  <select
                    value={values[f.id] ?? ""}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [f.id]: e.target.value }))
                    }
                    className="w-full bg-white border border-[#1A1A1A] rounded-none py-2.5 px-3 text-xs font-bold text-black outline-none focus:border-black transition-all"
                  >
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            return null;
          })}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-none bg-white border border-[#1A1A1A] text-black font-bold text-xs"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-none bg-[#1A1A1A] text-white font-bold text-xs border border-[#1A1A1A]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
