'use client';

import React, { useState, useEffect } from 'react';
import { PendingActionData } from '@/types/tools';
import { ShieldAlert, Check, X, Clock, Loader2 } from 'lucide-react';

interface ConfirmationDialogProps {
  pendingAction: PendingActionData | null;
  isOpen: boolean;
  onConfirm: (approved: boolean) => void;
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  pendingAction,
  isOpen,
  onConfirm,
  isLoading = false,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);

  useEffect(() => {
    if (!isOpen || !pendingAction) return;

    const interval = setInterval(() => {
      const remainingMs = pendingAction.expiresAt - Date.now();
      const sec = Math.max(0, Math.floor(remainingMs / 1000));
      setSecondsRemaining(sec);

      if (sec <= 0) {
        clearInterval(interval);
        onConfirm(false); // auto-cancel expired
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, pendingAction, onConfirm]);

  if (!isOpen || !pendingAction) {
    return null;
  }

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-action-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-950/40 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 id="confirm-action-title" className="text-lg font-bold text-slate-100">
              Confirmation Required
            </h3>
            <span className="text-xs font-medium text-amber-400">
              Consequential Action: {pendingAction.toolName}
            </span>
          </div>

          {/* Expiry timer badge */}
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-amber-300 text-xs font-mono font-semibold border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatCountdown(secondsRemaining)}</span>
          </div>
        </div>

        {/* Summary Details */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <p className="text-sm font-semibold text-slate-200 mb-3">
            {pendingAction.summary}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
            {Object.entries(pendingAction.parameters).map(([key, val]) => (
              <div key={key} className="truncate">
                <span className="text-slate-500 capitalize">{key}: </span>
                <span className="text-slate-200">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security policy note */}
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          🔒 <strong className="text-slate-300">Security Guarantee:</strong> This action requires your explicit authorization and a server-validated idempotency token. It will not execute automatically.
        </p>

        {/* Voice shortcut note */}
        <div className="mb-6 px-3 py-2 rounded-xl bg-teal-950/40 border border-teal-500/30 text-xs text-teal-300 flex items-center justify-between">
          <span>💡 Voice command supported:</span>
          <span className="font-semibold text-white">Say &ldquo;Confirm&rdquo; or &ldquo;Cancel&rdquo;</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="cancel-action-button"
            disabled={isLoading}
            onClick={() => onConfirm(false)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-sm border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4 text-rose-400" />
            <span>Cancel</span>
          </button>

          <button
            type="button"
            id="approve-action-button"
            disabled={isLoading}
            onClick={() => onConfirm(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-900/40 hover:shadow-amber-800/60 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Approve &amp; Confirm</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
