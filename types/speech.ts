export type LanguageCode = 'en-IN' | 'ml-IN' | 'hi-IN' | 'ta-IN' | 'en-US' | 'es-ES' | 'ar-SA';

export interface SupportedLanguage {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  speechRecognitionLocale: string;
  defaultGreeting: string;
  scriptDirection?: 'ltr' | 'rtl';
}

export type AssistantState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'confirming'
  | 'error';

export interface SpeechRecognitionHookState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  error: string | null;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unknown';
}

export interface SpeechSynthesisHookState {
  isSpeaking: boolean;
  isMuted: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  error: string | null;
}
