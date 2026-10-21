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

  // Unlock audio context / resume synthesis on user interaction
  const unlockAudio = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {
      // ignore
    }
  }, []);

  // Speak text with robust cross-browser handling
  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setState((prev) => ({ ...prev, error: 'Speech synthesis is not supported in this browser.' }));
        return;
      }

      if (!text || state.isMuted) return;

      try {
        // 1. Resume synthesis if browser paused it (very common Chrome/Safari quirk)
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        // 2. Clear any pending speech
        window.speechSynthesis.cancel();

        // 3. Small delay to prevent Chrome cancel-after-speak race condition
        setTimeout(() => {
          try {
            const availableVoices = window.speechSynthesis.getVoices();
            const langPrefix = language.split('-')[0].toLowerCase();

            // Intelligent voice matching
            let matchedVoice =
              state.selectedVoice ||
              availableVoices.find((v) => v.lang.toLowerCase() === language.toLowerCase()) ||
              availableVoices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix)) ||
              availableVoices.find((v) => v.lang.toLowerCase().startsWith('en-in') || v.lang.toLowerCase().startsWith('hi')) ||
              availableVoices.find((v) => v.default) ||
              availableVoices[0] ||
              null;

            const utterance = new SpeechSynthesisUtterance(text);

            if (matchedVoice) {
              utterance.voice = matchedVoice;
              // If voice matches the target language, use the target language; otherwise use the voice's native language to prevent browser speech errors
              utterance.lang = matchedVoice.lang.toLowerCase().startsWith(langPrefix)
                ? language
                : matchedVoice.lang;
            } else {
              utterance.lang = language;
            }

            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            utterance.onstart = () => {
              setState((prev) => ({ ...prev, isSpeaking: true, error: null }));
            };

            utterance.onend = () => {
              (window as any).__activeSpeechUtterance = null;
              currentUtteranceRef.current = null;
              setState((prev) => ({ ...prev, isSpeaking: false }));
              onEnd?.();
            };

            utterance.onerror = (event: any) => {
              (window as any).__activeSpeechUtterance = null;
              currentUtteranceRef.current = null;
              
              if (event.error === 'interrupted' || event.error === 'canceled') {
                setState((prev) => ({ ...prev, isSpeaking: false }));
                return;
              }

              // Helpful browser-specific error messaging
              let errorMsg = `Speech playback failed (${event.error || 'unknown'}).`;
              if (event.error === 'not-allowed') {
                errorMsg = 'Audio blocked by browser. Please tap the screen to enable audio playback.';
              } else if (event.error === 'language-unavailable') {
                errorMsg = 'Your device lacks a voice for this language. Playing with default voice.';
              }

              setState((prev) => ({ ...prev, isSpeaking: false, error: errorMsg }));
              onError?.(errorMsg);
            };

            // Prevent garbage collection in Chrome during speech
            (window as any).__activeSpeechUtterance = utterance;
            currentUtteranceRef.current = utterance;
            lastSpokenTextRef.current = text;

            // Chrome paused check before speaking
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }

            window.speechSynthesis.speak(utterance);
          } catch (innerErr: any) {
            console.warn('Speech synthesis inner error:', innerErr);
            setState((prev) => ({ ...prev, isSpeaking: false, error: 'Could not initialize speech synthesis utterance.' }));
          }
        }, 50);
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
    unlockAudio,
    lastSpokenText: lastSpokenTextRef.current,
  };
}
