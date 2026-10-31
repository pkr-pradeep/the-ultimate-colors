import React, { useState, useEffect } from 'react';
import { Card, Suit } from '../types/game';
import { CardView } from './CardView';
import { MULTILINGUAL_SUIT_NAMES } from '../engine/deck';
import { RulebookLanguage, getSavedRulebookLanguage, saveRulebookLanguage } from '../utils/firstTimeUser';
import { LanguageSelector } from './LanguageSelector';
import { MODAL_TRANSLATIONS } from '../data/modalTranslations';

interface TrumpInspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  trumpSuit: Suit | null;
  trumpCard: Card | null;
  language?: RulebookLanguage;
  onLanguageChange?: (lang: RulebookLanguage) => void;
}

export const TrumpInspectModal: React.FC<TrumpInspectModalProps> = ({
  isOpen,
  onClose,
  trumpSuit,
  trumpCard,
  language: controlledLang,
  onLanguageChange,
}) => {
  const [localLang, setLocalLang] = useState<RulebookLanguage>(controlledLang || getSavedRulebookLanguage());

  useEffect(() => {
    if (controlledLang) {
      setLocalLang(controlledLang);
    } else {
      setLocalLang(getSavedRulebookLanguage());
    }
  }, [isOpen, controlledLang]);

  if (!isOpen || !trumpCard || !trumpSuit) return null;

  const activeLang = controlledLang || localLang;
  const t = (MODAL_TRANSLATIONS[activeLang] || MODAL_TRANSLATIONS.en).trumpInspect;

  const handleLangChange = (lang: RulebookLanguage) => {
    setLocalLang(lang);
    saveRulebookLanguage(lang);
    onLanguageChange?.(lang);
  };

  const suitNameLocalized = MULTILINGUAL_SUIT_NAMES[trumpSuit]?.[activeLang] || trumpSuit;
  const suitDisplay = MULTILINGUAL_SUIT_NAMES[trumpSuit]?.combined || trumpSuit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/85 backdrop-blur-md animate-fade-in font-outfit">
      <div className="relative w-full max-w-sm max-h-[90dvh] overflow-y-auto bg-gradient-to-b from-[#2E1810] via-[#1F100B] to-[#120704] border-2 border-amber-600/70 rounded-2xl p-4 sm:p-6 shadow-2xl text-center flex flex-col items-center">
        {/* Top Controls: Language Toggle & Close Button */}
        <div className="w-full flex items-center justify-between mb-3 pb-2 border-b border-amber-800/40">
          <LanguageSelector
            currentLanguage={activeLang}
            onSelectLanguage={handleLangChange}
            size="xs"
            showIcon
          />
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-amber-700/60 text-amber-300 hover:text-white flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-amber-950 border border-amber-600/50 text-amber-300 font-cinzel text-xs uppercase tracking-widest mb-2 sm:mb-3">
          {t.badge}
        </div>

        <h3 className="font-cinzel text-lg sm:text-xl font-black text-amber-200">
          {t.title}
        </h3>
        <p className="text-xs text-amber-300/90 font-outfit mt-1 mb-2 sm:mb-4 font-semibold">
          {t.subtitle(suitDisplay)}
        </p>

        {/* Display Card View */}
        <div className="my-1 sm:my-2 transform hover:scale-105 transition-transform">
          <div className="sm:hidden">
            <CardView card={trumpCard} size="md" isLegal={false} isTrump />
          </div>
          <div className="hidden sm:block">
            <CardView card={trumpCard} size="lg" isLegal={false} isTrump />
          </div>
        </div>

        <p className="text-xs text-amber-200/80 font-outfit mt-4 leading-relaxed px-2">
          {t.description(suitNameLocalized)}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-cinzel font-bold text-xs uppercase rounded-xl border border-amber-200 shadow-md cursor-pointer transition-all"
        >
          {t.btnClose}
        </button>
      </div>
    </div>
  );
};
