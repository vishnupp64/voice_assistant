'use client';

import React from 'react';
import { Globe, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '@/lib/languages';

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (langCode: string) => void;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  disabled = false,
}) => {
  const activeLang = getLanguageByCode(currentLanguage);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mr-1">
        <Globe className="w-4 h-4 text-teal-400" />
        <span>Language:</span>
      </div>

      {/* Quick pill switchers for the 4 primary requested Indian languages */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center" role="radiogroup" aria-label="Select Language">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = lang.code.toLowerCase() === currentLanguage.toLowerCase();
          return (
            <button
              key={lang.code}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onLanguageChange(lang.code)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 shadow-sm shadow-teal-900/30 font-semibold'
                  : 'bg-slate-800/40 text-slate-400 border border-slate-700/40 hover:bg-slate-800/70 hover:text-slate-200'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
            >
              <span>{lang.flag}</span>
              <span>{lang.nativeName}</span>
              {isSelected && <Check className="w-3 h-3 text-teal-400 ml-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
