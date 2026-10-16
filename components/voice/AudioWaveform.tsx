'use client';

import React from 'react';
import { AssistantState } from '@/types/assistant';

interface AudioWaveformProps {
  state: AssistantState;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ state }) => {
  const isActive = state === 'listening' || state === 'speaking';
  const barHeights = [18, 38, 55, 78, 95, 65, 45, 80, 60, 35, 20];

  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center gap-1.5 h-12 px-4 py-2"
    >
      {barHeights.map((maxH, index) => {
        const animationDelay = `${(index * 0.1).toFixed(1)}s`;
        const height = isActive ? `${maxH}%` : '15%';

        return (
          <div
            key={index}
            style={{
              height,
              animationDelay,
            }}
            className={`w-1 sm:w-1.5 rounded-full transition-all duration-300 ${
              isActive
                ? state === 'listening'
                  ? 'bg-gradient-to-t from-teal-500 to-emerald-300 animate-wave-bar'
                  : 'bg-gradient-to-t from-indigo-500 to-teal-300 animate-wave-bar'
                : 'bg-slate-700/60'
            }`}
          />
        );
      })}
    </div>
  );
};
