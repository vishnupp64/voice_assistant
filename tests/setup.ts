import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Web Speech Synthesis & Utterance
if (typeof window !== 'undefined') {
  class MockSpeechSynthesisUtterance {
    text: string;
    lang = 'en-IN';
    voice: any = null;
    rate = 1;
    pitch = 1;
    onstart: (() => void) | null = null;
    onend: (() => void) | null = null;
    onerror: ((event: any) => void) | null = null;

    constructor(text: string = '') {
      this.text = text;
    }
  }

  (globalThis as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
  (window as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

  Object.defineProperty(window, 'speechSynthesis', {
    value: {
      speak: vi.fn((utterance: any) => {
        utterance?.onstart?.();
        setTimeout(() => utterance?.onend?.(), 10);
      }),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn().mockReturnValue([
        { lang: 'en-IN', name: 'English India', default: true },
        { lang: 'ml-IN', name: 'Malayalam India', default: false },
        { lang: 'hi-IN', name: 'Hindi India', default: false },
        { lang: 'ta-IN', name: 'Tamil India', default: false },
      ]),
      onvoiceschanged: null,
    },
    writable: true,
  });

  // Mock SpeechRecognition
  class MockSpeechRecognition {
    continuous = false;
    interimResults = false;
    lang = 'en-IN';
    onstart: (() => void) | null = null;
    onresult: ((event: any) => void) | null = null;
    onerror: ((event: any) => void) | null = null;
    onend: (() => void) | null = null;

    start = vi.fn(() => {
      this.onstart?.();
    });
    stop = vi.fn(() => {
      this.onend?.();
    });
    abort = vi.fn(() => {
      this.onend?.();
    });
  }

  (globalThis as any).SpeechRecognition = MockSpeechRecognition;
  (window as any).SpeechRecognition = MockSpeechRecognition;
  (globalThis as any).webkitSpeechRecognition = MockSpeechRecognition;
  (window as any).webkitSpeechRecognition = MockSpeechRecognition;
}
