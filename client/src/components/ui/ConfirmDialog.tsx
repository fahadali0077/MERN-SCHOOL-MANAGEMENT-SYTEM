import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm mx-4 card p-6 animate-fade-up shadow-card-hover">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
          danger ? 'bg-danger/10' : 'bg-warning/10'
        }`}>
          {danger
            ? <Trash2 size={22} className="text-danger" />
            : <AlertTriangle size={22} className="text-warning" />
          }
        </div>

        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-white/5 transition-all"
        >
          <X size={16} />
        </button>

        {/* Content */}
        <div className="text-center">
          <h3 className="font-display font-bold text-lg text-text-primary">{title}</h3>
          <p className="text-text-secondary text-sm mt-2 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all ${
              danger
                ? 'bg-danger text-white hover:bg-danger/90'
                : 'bg-warning text-white hover:bg-warning/90'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
