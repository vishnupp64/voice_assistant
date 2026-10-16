'use client';

import React from 'react';
import { Mic } from 'lucide-react';

interface TranscriptViewProps {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({
  isListening,
  transcript,
  interimTranscript,
}) => {
  if (!isListening && !interimTranscript && !transcript) {
    return null;
  }

  const displayText = interimTranscript || transcript;

  return (
    <div
      id="live-transcript-container"
      className="w-full max-w-xl mx-auto my-3 px-4 py-3 rounded-2xl bg-teal-950/40 border border-teal-500/30 backdrop-blur-md shadow-lg shadow-teal-950/20 transition-all animate-fadeIn"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
          Live Transcription
        </span>
      </div>

      <p className="text-sm sm:text-base text-slate-100 italic leading-relaxed min-h-[1.5rem]">
        {displayText ? (
          <>
            <span className="font-normal text-slate-100">{transcript}</span>
            <span className="text-teal-300 opacity-80 animate-pulse ml-1">{interimTranscript}</span>
          </>
        ) : (
          <span className="text-slate-400">Listening to your voice... Speak now.</span>
        )}
      </p>
    </div>
  );
};
