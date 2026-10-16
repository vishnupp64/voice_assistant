'use client';

import React from 'react';
import { Mic, MicOff, Loader2, Volume2, AlertCircle, ShieldAlert } from 'lucide-react';
import { AssistantState } from '@/types/assistant';

interface MicButtonProps {
  state: AssistantState;
  isListening: boolean;
  isSupported: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const MicButton: React.FC<MicButtonProps> = ({
  state,
  isListening,
  isSupported,
  onClick,
  disabled = false,
}) => {
  // Determine styles & icons based on assistant state
  const getButtonContent = () => {
    if (!isSupported) {
      return {
        icon: <MicOff className="w-9 h-9 text-rose-300" />,
        ringColor: 'border-rose-500/40 bg-rose-950/40',
        glow: 'shadow-rose-900/30',
        label: 'Speech recognition not supported in this browser. Use text input below.',
      };
    }

    switch (state) {
      case 'listening':
        return {
          icon: <Mic className="w-10 h-10 text-white animate-pulse" />,
          ringColor: 'border-teal-400 bg-gradient-to-tr from-teal-500 to-emerald-400',
          glow: 'shadow-[0_0_50px_rgba(20,184,166,0.6)] animate-pulse-glow',
          label: 'Listening... Tap to stop speaking',
        };
      case 'processing':
        return {
          icon: <Loader2 className="w-10 h-10 text-indigo-300 animate-spin" />,
          ringColor: 'border-indigo-400 bg-gradient-to-tr from-indigo-700 to-purple-600',
          glow: 'shadow-[0_0_40px_rgba(99,102,241,0.5)]',
          label: 'Processing your request with Gemini...',
        };
      case 'speaking':
        return {
          icon: <Volume2 className="w-10 h-10 text-teal-200 animate-bounce" />,
          ringColor: 'border-teal-300 bg-gradient-to-tr from-teal-600 to-cyan-600',
          glow: 'shadow-[0_0_40px_rgba(45,212,191,0.5)]',
          label: 'Speaking... Tap to interrupt or speak again',
        };
      case 'confirming':
        return {
          icon: <ShieldAlert className="w-10 h-10 text-amber-300 animate-pulse" />,
          ringColor: 'border-amber-400 bg-gradient-to-tr from-amber-600 to-orange-600',
          glow: 'shadow-[0_0_45px_rgba(245,158,11,0.5)]',
          label: 'Pending confirmation required',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-10 h-10 text-rose-200" />,
          ringColor: 'border-rose-400 bg-gradient-to-tr from-rose-700 to-red-600',
          glow: 'shadow-[0_0_35px_rgba(244,63,94,0.4)]',
          label: 'Error occurred. Tap to retry microphone',
        };
      case 'idle':
      default:
        return {
          icon: <Mic className="w-9 h-9 text-teal-100 group-hover:scale-110 transition-transform" />,
          ringColor: 'border-teal-500/30 bg-gradient-to-br from-slate-900/90 via-teal-950/60 to-slate-900/90 hover:border-teal-400/60',
          glow: 'shadow-xl shadow-teal-950/40 hover:shadow-[0_0_35px_rgba(20,184,166,0.35)]',
          label: 'Tap to start speaking',
        };
    }
  };

  const { icon, ringColor, glow, label } = getButtonContent();

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <button
        type="button"
        id="voice-mic-main-button"
        aria-label={label}
        onClick={onClick}
        disabled={disabled || !isSupported}
        className={`group relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 focus:ring-teal-500/40 ${ringColor} ${glow} ${
          disabled || !isSupported ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'
        }`}
      >
        {/* Subtle ripple rings when listening */}
        {isListening && (
          <>
            <span className="absolute -inset-2 rounded-full border border-teal-400/40 animate-ping opacity-60 pointer-events-none" />
            <span className="absolute -inset-4 rounded-full border border-teal-300/20 animate-pulse pointer-events-none" />
          </>
        )}

        <div className="relative z-10 flex items-center justify-center">
          {icon}
        </div>
      </button>

      <span className="text-xs sm:text-sm font-medium tracking-wide text-slate-300 max-w-xs text-center transition-colors">
        {label}
      </span>
    </div>
  );
};
