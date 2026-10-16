'use client';

import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '@/types/assistant';
import { Volume2, User, Bot, Wrench, CheckCircle2 } from 'lucide-react';

interface ConversationHistoryProps {
  messages: ChatMessage[];
  onSpeakMessage?: (text: string) => void;
  onSelectPrompt?: (prompt: string) => void;
  currentLanguage: string;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  messages,
  onSpeakMessage,
  onSelectPrompt,
  currentLanguage,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const examplePromptsByLang: Record<string, string[]> = {
    'en-IN': [
      'What are your clinic operating hours?',
      'What medical and wellness services do you offer?',
      'Check availability for General Health Checkup tomorrow',
      'I want to book an appointment for dental cleaning',
    ],
    'ml-IN': [
      'ക്ലിനിക്കിന്റെ പ്രവർത്തന സമയം എന്താണ്?',
      'എന്തെല്ലാം ചികിത്സകളും സേവനങ്ങളുമാണ് ഉള്ളത്?',
      'നാളെ ഡോക്ടറെ കാണാൻ സമയം ലഭ്യമാണോ?',
      'ജനറൽ ചെക്കപ്പിനായി ഒരു അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുക',
    ],
    'hi-IN': [
      'क्लिनिक के खुलने और बंद होने का क्या समय है?',
      'आप कौन-कौन सी चिकित्सा सेवाएं प्रदान करते हैं?',
      'क्या कल जनरल हेल्थ चेकअप के लिए स्लॉट उपलब्ध है?',
      'मुझे डेंटल क्लीनिंग के लिए अपॉइंटमेंट बुक करना है',
    ],
    'ta-IN': [
      'மருத்துவமனை இயங்கும் நேரம் என்ன?',
      'உங்களிடம் என்னென்ன மருத்துவ சேவைகள் உள்ளன?',
      'நாளை மருத்துவரை சந்திக்க நேரம் கிடைக்குமா?',
      'பல் பரிசோதனைக்கு முன்பதிவு செய்ய வேண்டும்',
    ],
  };

  const currentExamples = examplePromptsByLang[currentLanguage] || examplePromptsByLang['en-IN'];

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 sm:p-10 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 mb-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-300">
          <Bot className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-100 mb-1">
          Welcome to your Voice AI Assistant
        </h3>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Tap the microphone above or type below. Speak naturally in English, Malayalam, Hindi, or Tamil to ask questions or book appointments.
        </p>

        <div className="w-full flex flex-col gap-2 text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-400/80 mb-1">
            Try saying or asking:
          </span>
          {currentExamples.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt?.(prompt)}
              className="text-xs sm:text-sm text-slate-300 bg-slate-900/60 hover:bg-teal-950/40 hover:text-teal-200 border border-slate-800 hover:border-teal-500/40 rounded-xl px-3.5 py-2.5 transition-all text-left flex items-center justify-between group"
            >
              <span>{prompt}</span>
              <span className="text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2">➔</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      id="conversation-history-list"
      className="flex flex-col gap-4 p-4 sm:p-6 overflow-y-auto max-h-[480px] sm:max-h-[550px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
    >
      {messages.map((msg) => {
        const isUser = msg.role === 'user';

        return (
          <div
            key={msg.id}
            className={`flex items-start gap-3 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar icon */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border ${
                isUser
                  ? 'bg-indigo-600/30 border-indigo-500/40 text-indigo-200'
                  : 'bg-teal-600/30 border-teal-500/40 text-teal-200'
              }`}
            >
              {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md transition-all ${
                isUser
                  ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                  : 'bg-slate-900/80 border border-slate-800/90 text-slate-100 rounded-tl-none backdrop-blur-md'
              }`}
            >
              {/* Header / tool indicators */}
              {!isUser && msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mb-2 pb-2 border-b border-slate-800">
                  {msg.toolCalls.map((tool, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-950/80 text-teal-300 border border-teal-500/40"
                    >
                      <Wrench className="w-3 h-3 text-teal-400" />
                      <span>{tool.name}</span>
                    </span>
                  ))}
                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 ml-auto">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified server data
                  </span>
                </div>
              )}

              {/* Message Content */}
              <p className="whitespace-pre-wrap select-text">{msg.content}</p>

              {/* Footer with timestamp and speak button */}
              <div
                className={`flex items-center justify-between gap-3 mt-2 pt-1 text-[10px] ${
                  isUser ? 'text-indigo-200/80' : 'text-slate-400'
                }`}
              >
                <span>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {!isUser && onSpeakMessage && (
                  <button
                    type="button"
                    aria-label="Speak response aloud"
                    onClick={() => onSpeakMessage(msg.content)}
                    className="p-1 rounded-md hover:bg-slate-800 hover:text-teal-300 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
};
