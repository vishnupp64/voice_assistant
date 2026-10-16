import { SupportedLanguage } from '@/types/speech';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    code: 'en-IN',
    name: 'English (India)',
    nativeName: 'English (India)',
    flag: '🇮🇳',
    speechRecognitionLocale: 'en-IN',
    defaultGreeting: 'Hello! I am your AI voice assistant. How can I assist you today?',
    scriptDirection: 'ltr',
  },
  {
    code: 'ml-IN',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    flag: '🌴',
    speechRecognitionLocale: 'ml-IN',
    defaultGreeting: 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ വോയ്സ് അസിസ്റ്റന്റാണ്. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?',
    scriptDirection: 'ltr',
  },
  {
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    speechRecognitionLocale: 'hi-IN',
    defaultGreeting: 'नमस्ते! मैं आपका एआई वॉयस असिस्टेंट हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?',
    scriptDirection: 'ltr',
  },
  {
    code: 'ta-IN',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    speechRecognitionLocale: 'ta-IN',
    defaultGreeting: 'வணக்கம்! நான் உங்கள் ஏஐ குரல் உதவியாளர். இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?',
    scriptDirection: 'ltr',
  },
  {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English (US)',
    flag: '🇺🇸',
    speechRecognitionLocale: 'en-US',
    defaultGreeting: 'Hi there! I am your AI voice assistant. What can I help you with today?',
    scriptDirection: 'ltr',
  },
  {
    code: 'es-ES',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    speechRecognitionLocale: 'es-ES',
    defaultGreeting: '¡Hola! Soy tu asistente de voz con IA. ¿En qué puedo ayudarte hoy?',
    scriptDirection: 'ltr',
  },
];

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES[0];

export function getLanguageByCode(code: string): SupportedLanguage {
  const found = SUPPORTED_LANGUAGES.find(
    (l) => l.code.toLowerCase() === code.toLowerCase() || l.speechRecognitionLocale.toLowerCase() === code.toLowerCase()
  );
  return found || DEFAULT_LANGUAGE;
}
