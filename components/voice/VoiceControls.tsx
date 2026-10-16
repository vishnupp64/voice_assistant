'use client';

import React from 'react';
import { Volume2, VolumeX, Square, RotateCcw, Trash2 } from 'lucide-react';

interface VoiceControlsProps {
  isSpeaking: boolean;
  isMuted: boolean;
  canRepeat: boolean;
  hasMessages: boolean;
  onStopSpeaking: () => void;
  onRepeatSpeech: () => void;
  onToggleMute: () => void;
  onClearConversation: () => void;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  isSpeaking,
  isMuted,
  canRepeat,
  hasMessages,
  onStopSpeaking,
  onRepeatSpeech,
  onToggleMute,
  onClearConversation,
}) => {
  return (
    <div
      role="toolbar"
      aria-label="Voice Assistant Controls"
      className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md"
    >
      {/* Stop Speaking / Interrupt */}
      {isSpeaking && (
        <button
          type="button"
          onClick={onStopSpeaking}
          title="Stop speaking"
          aria-label="Stop speaking"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-medium transition-all cursor-pointer animate-pulse"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Stop</span>
        </button>
      )}

      {/* Repeat Speech */}
      <button
        type="button"
        onClick={onRepeatSpeech}
        disabled={!canRepeat}
        title="Repeat last response"
        aria-label="Repeat last response"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/50 text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Repeat</span>
      </button>

      {/* Mute Toggle */}
      <button
        type="button"
        onClick={onToggleMute}
        title={isMuted ? 'Unmute voice' : 'Mute voice'}
        aria-label={isMuted ? 'Unmute voice' : 'Mute voice'}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
          isMuted
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700/50'
        }`}
      >
        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Sound On'}</span>
      </button>

      {/* Clear Conversation */}
      <button
        type="button"
        onClick={onClearConversation}
        disabled={!hasMessages}
        title="Clear conversation"
        aria-label="Clear conversation"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 border border-slate-700/50 hover:border-rose-500/30 text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ml-auto sm:ml-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Clear</span>
      </button>
    </div>
  );
};
