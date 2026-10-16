'use client';

import React, { useState } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';

interface TextFallbackInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isSttSupported: boolean;
}

export const TextFallbackInput: React.FC<TextFallbackInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type a command or ask a question...',
  isSttSupported,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || disabled) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl mx-auto flex flex-col gap-1.5"
    >
      <div className="relative flex items-center">
        <input
          type="text"
          id="text-fallback-input-field"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Type your message"
          className="w-full py-3.5 pl-4 pr-12 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all backdrop-blur-md shadow-lg shadow-black/20 disabled:opacity-50"
        />

        <button
          type="submit"
          id="send-text-button"
          disabled={disabled || !inputText.trim()}
          aria-label="Send message"
          className="absolute right-2 p-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all disabled:opacity-40 disabled:hover:bg-teal-500 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center active:scale-95"
        >
          <Send className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <CornerDownLeft className="w-3 h-3 text-slate-500" />
          <span>Press Enter to send</span>
        </span>

        {!isSttSupported && (
          <span className="text-amber-400 font-medium">
            Microphone API not available — Text input is fully enabled
          </span>
        )}
      </div>
    </form>
  );
};
