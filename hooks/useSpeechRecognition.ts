'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechRecognitionHookState } from '@/types/speech';

// Extended Window interface for Web Speech API
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface UseSpeechRecognitionOptions {
  language?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
}

export function useSpeechRecognition({
  language = 'en-IN',
  onResult,
  onError,
  continuous = false,
}: UseSpeechRecognitionOptions = {}) {
  const [state, setState] = useState<SpeechRecognitionHookState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    isSupported: false,
    error: null,
    permissionState: 'unknown',
  });

  const recognitionRef = useRef<any>(null);
  const lastProcessedTranscriptRef = useRef<string>('');
  const isManuallyStoppedRef = useRef<boolean>(false);

  // Check browser support on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const win = window as unknown as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    setState((prev) => ({
      ...prev,
      isSupported: Boolean(SpeechRecognitionClass),
    }));
  }, []);

  // Initialize or update SpeechRecognition instance when language changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const win = window as unknown as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) return;

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = language;

      recognition.onstart = () => {
        isManuallyStoppedRef.current = false;
        setState((prev) => ({
          ...prev,
          isListening: true,
          error: null,
          permissionState: 'granted',
        }));
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const transcriptChunk = item[0]?.transcript || '';
          if (item.isFinal) {
            final += transcriptChunk;
          } else {
            interim += transcriptChunk;
          }
        }

        const trimmedFinal = final.trim();
        setState((prev) => ({
          ...prev,
          interimTranscript: interim,
          transcript: trimmedFinal || prev.transcript,
        }));

        if (trimmedFinal && trimmedFinal !== lastProcessedTranscriptRef.current) {
          lastProcessedTranscriptRef.current = trimmedFinal;
          onResult?.(trimmedFinal, true);
        } else if (interim) {
          onResult?.(interim, false);
        }
      };

      recognition.onerror = (event: any) => {
        let userError = 'Speech recognition error occurred.';
        let permission: SpeechRecognitionHookState['permissionState'] = 'unknown';

        switch (event.error) {
          case 'not-allowed':
          case 'service-not-allowed':
            userError = 'Microphone access was denied. Please allow microphone permissions in your browser.';
            permission = 'denied';
            break;
          case 'no-speech':
            userError = 'No speech was detected. Please try speaking closer to the microphone.';
            break;
          case 'network':
            userError = 'Network error during speech recognition. An online browser speech service may be required.';
            break;
          case 'audio-capture':
            userError = 'No microphone was found or microphone is in use by another application.';
            break;
          case 'aborted':
            userError = 'Listening was cancelled.';
            break;
          default:
            userError = `Recognition error: ${event.error}`;
        }

        setState((prev) => ({
          ...prev,
          isListening: false,
          error: userError,
          permissionState: permission,
        }));

        onError?.(userError);
      };

      recognition.onend = () => {
        setState((prev) => ({
          ...prev,
          isListening: false,
          interimTranscript: '',
        }));
      };

      recognitionRef.current = recognition;
    } catch (e: any) {
      console.warn('SpeechRecognition initialization error:', e);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [language, continuous, onResult, onError]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      lastProcessedTranscriptRef.current = '';
      setState((prev) => ({
        ...prev,
        transcript: '',
        interimTranscript: '',
        error: null,
      }));
      recognitionRef.current.start();
    } catch (err: any) {
      // If already started, ignore
      if (err.name !== 'InvalidStateError') {
        setState((prev) => ({ ...prev, error: 'Failed to start microphone. Please try again.' }));
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      // ignore
    }
  }, []);

  const resetTranscript = useCallback(() => {
    lastProcessedTranscriptRef.current = '';
    setState((prev) => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      error: null,
    }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
  };
}
