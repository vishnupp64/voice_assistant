'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechSynthesisHookState } from '@/types/speech';

export interface UseSpeechSynthesisOptions {
  language?: string;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function useSpeechSynthesis({
  language = 'en-IN',
  onEnd,
  onError,
}: UseSpeechSynthesisOptions = {}) {
  const [state, setState] = useState<SpeechSynthesisHookState>({
    isSpeaking: false,
    isMuted: false,
    isSupported: false,
    voices: [],
    selectedVoice: null,
    error: null,
  });

  const lastSpokenTextRef = useRef<string>('');
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Detect support & load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setState((prev) => ({ ...prev, isSupported: false }));
      return;
    }

    setState((prev) => ({ ...prev, isSupported: true }));

    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setState((prev) => {
        // Find best match for current language
        const matched =
          availableVoices.find((v) => v.lang.toLowerCase() === language.toLowerCase()) ||
          availableVoices.find((v) => v.lang.toLowerCase().startsWith(language.split('-')[0].toLowerCase())) ||
          availableVoices.find((v) => v.default) ||
          availableVoices[0] ||
          null;

        return {
          ...prev,
          voices: availableVoices,
          selectedVoice: matched,
        };
      });
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language]);

  // Stop speaking
  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
    currentUtteranceRef.current = null;
    setState((prev) => ({ ...prev, isSpeaking: false }));
  }, []);

  // Speak text
  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setState((prev) => ({ ...prev, error: 'Speech synthesis is not supported on this device.' }));
        return;
      }

      if (!text || state.isMuted) return;

      // Prevent overlapping playback
      window.speechSynthesis.cancel();

      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;

        // Apply matching voice if available
        if (state.selectedVoice) {
          utterance.voice = state.selectedVoice;
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          setState((prev) => ({ ...prev, isSpeaking: true, error: null }));
        };

        utterance.onend = () => {
          currentUtteranceRef.current = null;
          setState((prev) => ({ ...prev, isSpeaking: false }));
          onEnd?.();
        };

        utterance.onerror = (event: any) => {
          if (event.error === 'interrupted' || event.error === 'canceled') {
            setState((prev) => ({ ...prev, isSpeaking: false }));
            return;
          }
          const errorMsg = `Speech playback failed (${event.error || 'unknown'}).`;
          setState((prev) => ({ ...prev, isSpeaking: false, error: errorMsg }));
          onError?.(errorMsg);
        };

        currentUtteranceRef.current = utterance;
        lastSpokenTextRef.current = text;
        window.speechSynthesis.speak(utterance);
      } catch (err: any) {
        setState((prev) => ({ ...prev, isSpeaking: false, error: 'Failed to play synthesized speech.' }));
      }
    },
    [language, state.isMuted, state.selectedVoice, onEnd, onError]
  );

  // Repeat last spoken phrase
  const repeat = useCallback(() => {
    if (lastSpokenTextRef.current) {
      speak(lastSpokenTextRef.current);
    }
  }, [speak]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setState((prev) => {
      const nextMuted = !prev.isMuted;
      if (nextMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return { ...prev, isMuted: nextMuted, isSpeaking: false };
    });
  }, []);

  return {
    ...state,
    speak,
    stop,
    repeat,
    toggleMute,
    lastSpokenText: lastSpokenTextRef.current,
  };
}
