'use client';

import React from 'react';
import { AssistantState } from '@/types/assistant';

interface AssistantStateBadgeProps {
  state: AssistantState;
}

export const AssistantStateBadge: React.FC<AssistantStateBadgeProps> = ({ state }) => {
  const configs: Record<AssistantState, { text: string; dotClass: string; containerClass: string }> = {
    idle: {
      text: 'Ready',
      dotClass: 'bg-slate-400',
      containerClass: 'bg-slate-800/60 text-slate-300 border-slate-700/60',
    },
    listening: {
      text: 'Listening...',
      dotClass: 'bg-teal-400 animate-ping',
      containerClass: 'bg-teal-950/70 text-teal-300 border-teal-500/50 shadow-sm shadow-teal-900/50',
    },
    processing: {
      text: 'Thinking with Gemini...',
      dotClass: 'bg-indigo-400 animate-pulse',
      containerClass: 'bg-indigo-950/70 text-indigo-300 border-indigo-500/50 shadow-sm shadow-indigo-900/50',
    },
    speaking: {
      text: 'Speaking response',
      dotClass: 'bg-emerald-400 animate-bounce',
      containerClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-900/50',
    },
    confirming: {
      text: 'Awaiting Action Confirmation',
      dotClass: 'bg-amber-400 animate-pulse',
      containerClass: 'bg-amber-950/70 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-900/50',
    },
    error: {
      text: 'Attention Needed',
      dotClass: 'bg-rose-400',
      containerClass: 'bg-rose-950/70 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-900/50',
    },
  };

  const { text, dotClass, containerClass } = configs[state] || configs.idle;

  return (
    <div
      id="assistant-status-badge"
      className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium border backdrop-blur-md transition-all duration-300 ${containerClass}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotClass}`} />
      <span>{text}</span>
    </div>
  );
};
