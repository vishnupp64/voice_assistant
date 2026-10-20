'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { AssistantState, ChatMessage, Role } from '@/types/assistant';
import { PendingActionData } from '@/types/tools';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { DEFAULT_LANGUAGE, getLanguageByCode } from '@/lib/languages';

const SESSION_STORAGE_KEY = 'voice_assistant_lang';

export function useVoiceAssistant() {
  const [currentLanguage, setCurrentLanguage] = useState<string>(DEFAULT_LANGUAGE.code);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [pendingAction, setPendingAction] = useState<PendingActionData | null>(null);
  const [isConfirmingAction, setIsConfirmingAction] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Restore language from session if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        setCurrentLanguage(saved);
      }
    }
  }, []);

  // Update session language
  const changeLanguage = useCallback((newLangCode: string) => {
    setCurrentLanguage(newLangCode);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, newLangCode);
    }
  }, []);

  // Speech Synthesis Hook
  const {
    speak,
    stop: stopSpeaking,
    repeat: repeatLastSpeech,
    toggleMute,
    isSpeaking,
    isMuted,
    isSupported: isTtsSupported,
  } = useSpeechSynthesis({
    language: currentLanguage,
    onEnd: () => {
      setAssistantState((prev) => (prev === 'speaking' ? 'idle' : prev));
    },
    onError: (err) => {
      console.warn('Speech synthesis error:', err);
      setAssistantState((prev) => (prev === 'speaking' ? 'idle' : prev));
    },
  });

  // Core send message handler (for both voice transcripts and typed inputs)
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      setApiError(null);
      stopSpeaking();

      // Check if user is answering a pending action confirmation with voice
      if (pendingAction) {
        const textLower = text.toLowerCase();
        if (
          textLower.includes('yes') ||
          textLower.includes('confirm') ||
          textLower.includes('sure') ||
          textLower.includes('ഉറപ്പാണ്') || // Malayalam "sure"
          textLower.includes('हाँ') || // Hindi "yes"
          textLower.includes('சரி') // Tamil "ok/yes"
        ) {
          await handleConfirmPendingAction(true);
          return;
        } else if (
          textLower.includes('no') ||
          textLower.includes('cancel') ||
          textLower.includes('stop') ||
          textLower.includes('വേണ്ട') || // Malayalam "no/cancel"
          textLower.includes('नहीं') // Hindi "no"
        ) {
          await handleConfirmPendingAction(false);
          return;
        }
      }

      // Add user message to state
      const userMessage: ChatMessage = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        role: 'user',
        content: text.trim(),
        timestamp: Date.now(),
        language: currentLanguage,
      };

      setMessages((prev) => [...prev, userMessage]);
      setAssistantState('processing');

      try {
        const historyForApi = messages.slice(-10).map((m) => ({
          role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
          content: m.content,
        }));

        const response = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            conversationHistory: historyForApi,
            language: currentLanguage,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with status ${response.status}`);
        }

        const data = await response.json();

        const assistantMsg: ChatMessage = {
          id: `asst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          role: 'assistant',
          content: data.message,
          timestamp: Date.now(),
          language: data.language || currentLanguage,
          toolCalls: data.toolExecutions?.map((t: any) => ({ name: t.toolName, args: {} })),
          toolResults: data.toolExecutions?.map((t: any) => ({ name: t.toolName, result: t.data || t.error })),
          pendingAction: data.pendingAction,
        };

        setMessages((prev) => [...prev, assistantMsg]);

        if (data.pendingAction) {
          setPendingAction(data.pendingAction);
          setAssistantState('confirming');
        } else {
          setAssistantState('speaking');
        }

        // Speak the assistant's response aloud
        if (data.message) {
          speak(data.message);
        }
      } catch (err: any) {
        console.error('Failed to communicate with assistant:', err);
        const errorMsg = err.message || 'Unable to connect to assistant service.';
        setApiError(errorMsg);
        setAssistantState('error');

        // Add error note to chat
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            role: 'assistant',
            content: `⚠️ Error: ${errorMsg}. Please try again.`,
            timestamp: Date.now(),
          },
        ]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentLanguage, messages, pendingAction, speak, stopSpeaking]
  );

  // Speech Recognition Hook
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: isSttSupported,
    error: speechError,
    permissionState,
    startListening: startRecognition,
    stopListening: stopRecognition,
    resetTranscript,
  } = useSpeechRecognition({
    language: currentLanguage,
    onResult: (finalText, isFinal) => {
      if (isFinal && finalText.trim()) {
        sendMessage(finalText);
      }
    },
    onError: (err) => {
      setApiError(err);
      setAssistantState('idle');
    },
  });

  // Toggle listening button
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopRecognition();
      setAssistantState('idle');
    } else {
      stopSpeaking();
      startRecognition();
      setAssistantState('listening');
    }
  }, [isListening, startRecognition, stopRecognition, stopSpeaking]);

  // Handle action confirmation dialog response
  const handleConfirmPendingAction = useCallback(
    async (approved: boolean) => {
      if (!pendingAction) return;

      setIsConfirmingAction(true);
      try {
        const res = await fetch('/api/actions/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionId: pendingAction.actionId,
            idempotencyKey: pendingAction.idempotencyKey,
            confirmed: approved,
          }),
        });

        const data = await res.json();
        const responseText = data.message || (approved ? 'Action confirmed.' : 'Action cancelled.');

        const confirmMsg: ChatMessage = {
          id: `conf_${Date.now()}`,
          role: 'assistant',
          content: `${approved ? '✅' : '❌'} ${responseText}`,
          timestamp: Date.now(),
          language: currentLanguage,
        };

        setMessages((prev) => [...prev, confirmMsg]);
        setPendingAction(null);
        setAssistantState('speaking');
        speak(responseText);
      } catch (err: any) {
        setApiError('Failed to confirm action. Please retry.');
      } finally {
        setIsConfirmingAction(false);
      }
    },
    [pendingAction, currentLanguage, speak]
  );

  // Clear conversation history
  const clearConversation = useCallback(() => {
    stopSpeaking();
    stopRecognition();
    resetTranscript();
    setMessages([]);
    setPendingAction(null);
    setAssistantState('idle');
    setApiError(null);
  }, [stopSpeaking, stopRecognition, resetTranscript]);

  // Update assistant state if speech is listening
  useEffect(() => {
    if (isListening) {
      setAssistantState('listening');
    } else if (isSpeaking) {
      setAssistantState('speaking');
    } else if (pendingAction) {
      setAssistantState('confirming');
    } else if (assistantState !== 'processing' && assistantState !== 'error') {
      setAssistantState('idle');
    }
  }, [isListening, isSpeaking, pendingAction]);

  const speakMessage = useCallback(
    (text: string) => {
      stopRecognition();
      speak(text);
    },
    [stopRecognition, speak]
  );

  return {
    currentLanguage,
    changeLanguage,
    messages,
    assistantState,
    pendingAction,
    isConfirmingAction,
    apiError,
    // Voice recognition
    isListening,
    transcript,
    interimTranscript,
    isSttSupported,
    speechError,
    permissionState,
    toggleListening,
    startListening: startRecognition,
    stopListening: stopRecognition,
    // Voice playback
    isSpeaking,
    isMuted,
    isTtsSupported,
    speak: speakMessage,
    stopSpeaking,
    repeatLastSpeech,
    toggleMute,
    // Interactions
    sendMessage,
    handleConfirmPendingAction,
    clearConversation,
  };
}
