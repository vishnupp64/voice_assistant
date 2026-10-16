import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

describe('Speech Hooks', () => {
  describe('useSpeechRecognition', () => {
    it('detects browser SpeechRecognition support', () => {
      const { result } = renderHook(() => useSpeechRecognition({ language: 'en-IN' }));
      expect(result.current.isSupported).toBe(true);
      expect(result.current.isListening).toBe(false);
    });

    it('handles start and stop listening callbacks', () => {
      const { result } = renderHook(() => useSpeechRecognition({ language: 'ml-IN' }));

      act(() => {
        result.current.startListening();
      });
      expect(result.current.isListening).toBe(true);

      act(() => {
        result.current.stopListening();
      });
      expect(result.current.isListening).toBe(false);
    });

    it('resets transcript safely', () => {
      const { result } = renderHook(() => useSpeechRecognition({ language: 'hi-IN' }));

      act(() => {
        result.current.resetTranscript();
      });
      expect(result.current.transcript).toBe('');
      expect(result.current.interimTranscript).toBe('');
    });
  });

  describe('useSpeechSynthesis', () => {
    it('detects synthesis support and loads voices', () => {
      const { result } = renderHook(() => useSpeechSynthesis({ language: 'ta-IN' }));
      expect(result.current.isSupported).toBe(true);
      expect(result.current.voices.length).toBeGreaterThan(0);
    });

    it('handles mute toggling', () => {
      const { result } = renderHook(() => useSpeechSynthesis({ language: 'en-IN' }));
      expect(result.current.isMuted).toBe(false);

      act(() => {
        result.current.toggleMute();
      });
      expect(result.current.isMuted).toBe(true);

      act(() => {
        result.current.toggleMute();
      });
      expect(result.current.isMuted).toBe(false);
    });

    it('invokes window.speechSynthesis.speak when speak is called', () => {
      const { result } = renderHook(() => useSpeechSynthesis({ language: 'en-IN' }));

      act(() => {
        result.current.speak('Hello from testing');
      });
      expect(window.speechSynthesis.speak).toHaveBeenCalled();
      expect(result.current.lastSpokenText).toBe('Hello from testing');
    });

    it('invokes cancel when stop is called', () => {
      const { result } = renderHook(() => useSpeechSynthesis({ language: 'en-IN' }));

      act(() => {
        result.current.stop();
      });
      expect(window.speechSynthesis.cancel).toHaveBeenCalled();
      expect(result.current.isSpeaking).toBe(false);
    });
  });
});
