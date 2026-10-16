'use client';

import React, { useState } from 'react';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { MicButton } from '@/components/voice/MicButton';
import { AudioWaveform } from '@/components/voice/AudioWaveform';
import { AssistantStateBadge } from '@/components/voice/AssistantStateBadge';
import { LanguageSelector } from '@/components/voice/LanguageSelector';
import { TranscriptView } from '@/components/voice/TranscriptView';
import { ConversationHistory } from '@/components/voice/ConversationHistory';
import { ConfirmationDialog } from '@/components/voice/ConfirmationDialog';
import { VoiceControls } from '@/components/voice/VoiceControls';
import { TextFallbackInput } from '@/components/voice/TextFallbackInput';
import { Sparkles, ShieldCheck, Cpu, AlertTriangle, Info, HelpCircle } from 'lucide-react';

export default function VoiceAssistantPage() {
  const {
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
    permissionState,
    toggleListening,
    // Voice synthesis
    isSpeaking,
    isMuted,
    stopSpeaking,
    repeatLastSpeech,
    toggleMute,
    // Interactions
    sendMessage,
    handleConfirmPendingAction,
    clearConversation,
  } = useVoiceAssistant();

  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <main className="min-h-screen flex flex-col justify-between p-3 sm:p-6 max-w-5xl mx-auto">
      {/* 1. Header Navigation Bar */}
      <header className="glass-panel rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-900/50">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>Voice AI Agent</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                Gemini
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Multilingual Voice Assistant &amp; Autonomous Agent
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          <AssistantStateBadge state={assistantState} />

          <LanguageSelector
            currentLanguage={currentLanguage}
            onLanguageChange={changeLanguage}
            disabled={isListening || assistantState === 'processing'}
          />

          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            title="System Capabilities & Architecture"
            aria-label="System Capabilities and Architecture"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Error / Notice Banner */}
      {apiError && (
        <div
          role="alert"
          className="my-3 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs sm:text-sm flex items-center gap-3 shadow-lg shadow-rose-950/40 animate-fadeIn"
        >
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span className="flex-1">{apiError}</span>
        </div>
      )}

      {/* 3. Central Interactive Voice Core */}
      <section className="my-6 flex flex-col items-center justify-center text-center">
        {/* Dynamic Waveform Visualizer */}
        <AudioWaveform state={assistantState} />

        {/* Central Animated Microphone Button */}
        <div className="my-3">
          <MicButton
            state={assistantState}
            isListening={isListening}
            isSupported={isSttSupported}
            onClick={toggleListening}
          />
        </div>

        {/* Live Interim Transcript Bubble */}
        <TranscriptView
          isListening={isListening}
          transcript={transcript}
          interimTranscript={interimTranscript}
        />

        {/* Voice Playback and Session Control Toolbar */}
        <div className="mt-2">
          <VoiceControls
            isSpeaking={isSpeaking}
            isMuted={isMuted}
            canRepeat={Boolean(messages.find((m) => m.role === 'assistant'))}
            hasMessages={messages.length > 0}
            onStopSpeaking={stopSpeaking}
            onRepeatSpeech={repeatLastSpeech}
            onToggleMute={toggleMute}
            onClearConversation={clearConversation}
          />
        </div>
      </section>

      {/* 4. Chat & Conversation Feed Section */}
      <section className="glass-panel rounded-3xl overflow-hidden shadow-2xl mb-4 border border-slate-800 flex-1 flex flex-col justify-between">
        <ConversationHistory
          messages={messages}
          onSpeakMessage={stopSpeaking ? (txt) => { stopSpeaking(); } : undefined}
          onSelectPrompt={(prompt) => sendMessage(prompt)}
          currentLanguage={currentLanguage}
        />

        {/* Text Fallback Input Container */}
        <div className="p-3 sm:p-4 bg-slate-950/70 border-t border-slate-800/80">
          <TextFallbackInput
            onSendMessage={sendMessage}
            disabled={assistantState === 'processing'}
            isSttSupported={isSttSupported}
            placeholder={
              currentLanguage === 'ml-IN'
                ? 'ഇവിടെ ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ മൈക്രോഫോൺ ഉപയോഗിക്കുക...'
                : currentLanguage === 'hi-IN'
                ? 'यहाँ टाइप करें या माइक्रोफ़ोन का उपयोग करें...'
                : currentLanguage === 'ta-IN'
                ? 'இங்கே தட்டச்சு செய்யவும் அல்லது பேசவும்...'
                : 'Type your message or tap the microphone above...'
            }
          />
        </div>
      </section>

      {/* 5. Consequential Action Confirmation Dialog Modal */}
      <ConfirmationDialog
        pendingAction={pendingAction}
        isOpen={Boolean(pendingAction)}
        onConfirm={handleConfirmPendingAction}
        isLoading={isConfirmingAction}
      />

      {/* 6. Capabilities & Architecture Info Modal */}
      {showInfoModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
        >
          <div className="w-full max-w-2xl bg-slate-900 border border-teal-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-lg">
                <Info className="w-5 h-5" />
                <span>Agent Architecture &amp; Security Controls</span>
              </div>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 my-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <h4 className="font-semibold text-white flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  Consequential Action Confirmation
                </h4>
                <p className="text-slate-400 text-xs">
                  Actions such as booking appointments or modifying records are strictly gated on the server. Gemini generates a pending action token with a 5-minute TTL and idempotency key. Actions are never executed until explicitly confirmed by the user.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <h4 className="font-semibold text-white flex items-center gap-2 mb-1">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  9-Step Tool Execution Pipeline
                </h4>
                <p className="text-slate-400 text-xs">
                  Every tool call passes through: 1) Registry check, 2) Zod schema validation, 3) User authentication, 4) Resource authorization, 5) Server-side business rule validation, 6) Confirmation necessity check, 7) Backend execution, 8) Grounded real-result return, and 9) Audit logging with secrets redaction.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <h4 className="font-semibold text-white flex items-center gap-2 mb-1">
                  🌐 Multilingual Speech Engine
                </h4>
                <p className="text-slate-400 text-xs">
                  Built on Web Speech API recognition and synthesis with native support for English (`en-IN`, `en-US`), Malayalam (`ml-IN`), Hindi (`hi-IN`), Tamil (`ta-IN`), and Spanish (`es-ES`). Gemini prompts are dynamically contextualized in the chosen target language.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 7. Footer */}
      <footer className="mt-3 text-center text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 px-2">
        <span>Google Gemini &bull; Web Speech API &bull; Next.js App Router</span>
        <span className="flex items-center gap-1.5 text-teal-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          Server-Side Validated Function Calling &amp; Idempotency
        </span>
      </footer>
    </main>
  );
}
