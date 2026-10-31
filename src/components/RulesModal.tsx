import React, { useState, useEffect } from 'react';
import { getSavedRulebookLanguage, RulebookLanguage, saveRulebookLanguage } from '../utils/firstTimeUser';
import { RULEBOOK_TRANSLATIONS } from '../data/rulebookTranslations';
import { SuitIcon } from './art/SuitIcon';
import { BookOpen, Sparkles, X, Star } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLanguage?: RulebookLanguage;
  onLanguageChange?: (lang: RulebookLanguage) => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  initialLanguage,
  onLanguageChange,
}) => {
  const [language, setLanguage] = useState<RulebookLanguage>(initialLanguage || getSavedRulebookLanguage());

  useEffect(() => {
    if (initialLanguage) {
      setLanguage(initialLanguage);
    } else {
      setLanguage(getSavedRulebookLanguage());
    }
  }, [isOpen, initialLanguage]);

  if (!isOpen) return null;

  const handleSelectLanguage = (lang: RulebookLanguage) => {
    setLanguage(lang);
    saveRulebookLanguage(lang);
    onLanguageChange?.(lang);
  };

  const content = RULEBOOK_TRANSLATIONS[language] || RULEBOOK_TRANSLATIONS.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-gradient-to-b from-[#2A150D] via-[#1A0C08] to-[#0F0704] border-2 border-amber-600/70 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-y-auto text-amber-100 font-outfit flex flex-col">
        {/* Top Bar with Language Tabs & Close Button */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-800/40 gap-2 flex-wrap">
          <LanguageSelector
            currentLanguage={language}
            onSelectLanguage={handleSelectLanguage}
            size="sm"
            showIcon
            showLabel
          />

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-amber-700/60 text-amber-300 hover:text-white flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Header */}
        <div className="text-center my-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/50 text-amber-300 font-cinzel text-xs uppercase tracking-widest mb-1.5">
            <Sparkles size={12} />
            <span>{content.headerBadge}</span>
          </div>
          <h2 className="font-cinzel text-2xl sm:text-3xl font-black text-amber-200 tracking-wide">
            {content.title}
          </h2>
          <p className="text-xs sm:text-sm text-amber-300/80 mt-1 max-w-xl mx-auto">
            {content.subtitle}
          </p>
        </div>

        {/* Dadaji Spotlight Card */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-red-950/60 to-amber-950/60 border border-amber-500/50 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-20 sm:w-24 aspect-[5/7] flex-shrink-0">
            <div className="w-full h-full rounded-xl bg-[#FAF6EC] border border-[#6e1423] p-0.5 shadow-md overflow-hidden">
              <img
                src="/assets/Indian_Playing_Cards/svg/53_Joker.svg"
                alt="Dadaji Universal Joker"
                className="w-full h-full object-fill rounded-lg select-none pointer-events-none"
              />
            </div>
          </div>
          <div className="text-left">
            <h3 className="font-cinzel text-base sm:text-lg font-bold text-amber-200">
              {content.jokerTitle}
            </h3>
            <p className="text-xs text-amber-200/90 leading-relaxed mt-1">
              {content.jokerDesc}
            </p>
            <p className="text-xs text-amber-300 font-semibold mt-1.5 flex items-center gap-1.5">
              <span>★</span>
              <span>{content.jokerTagline}</span>
            </p>
          </div>
        </div>

        {/* Suit & Joker Regional Nomenclature Card Grid */}
        <div className="mb-4 p-3 rounded-2xl bg-neutral-900/90 border border-amber-600/40">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="font-cinzel text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>🎴</span>
              <span>
                {language === 'or'
                  ? 'ତାସ୍ ରଙ୍ଗ ଏବଂ ଜୋକର୍ ନାମାବଳୀ (Suits & Joker)'
                  : language === 'hi'
                  ? 'पत्तों के रंग एवं जोकर के आधिकारिक नाम (Suits & Joker)'
                  : 'Official Card Suits & Joker Nomenclature'}
              </span>
            </span>
            <span className="text-[10px] text-amber-400/80 font-mono">
              Clubs · Hearts · Spades · Diamond · Joker
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {/* Clubs */}
            <div className="p-2.5 rounded-xl bg-black/50 border border-neutral-700/60 flex flex-col items-center text-center">
              <div className="flex items-center gap-1.5 mb-1">
                <SuitIcon suit="clubs" size={16} showGoldBorder />
                <span className="font-cinzel font-bold text-neutral-100">Clubs</span>
              </div>
              <div className="text-[11px] text-amber-300 font-semibold">ଚିଡ଼ିଆ</div>
              <div className="text-[10px] text-neutral-400">चिडि</div>
            </div>

            {/* Hearts */}
            <div className="p-2.5 rounded-xl bg-black/50 border border-neutral-700/60 flex flex-col items-center text-center">
              <div className="flex items-center gap-1.5 mb-1">
                <SuitIcon suit="hearts" size={16} showGoldBorder />
                <span className="font-cinzel font-bold text-rose-300">Hearts</span>
              </div>
              <div className="text-[11px] text-rose-300 font-semibold">ଲାଲ୍ ପାନ୍</div>
              <div className="text-[10px] text-neutral-400">पान</div>
            </div>

            {/* Spades */}
            <div className="p-2.5 rounded-xl bg-black/50 border border-neutral-700/60 flex flex-col items-center text-center">
              <div className="flex items-center gap-1.5 mb-1">
                <SuitIcon suit="spades" size={16} showGoldBorder />
                <span className="font-cinzel font-bold text-neutral-100">Spades</span>
              </div>
              <div className="text-[11px] text-amber-300 font-semibold">କଳା ପାନ୍</div>
              <div className="text-[10px] text-neutral-400">हुकुम</div>
            </div>

            {/* Diamond */}
            <div className="p-2.5 rounded-xl bg-black/50 border border-neutral-700/60 flex flex-col items-center text-center">
              <div className="flex items-center gap-1.5 mb-1">
                <SuitIcon suit="diamonds" size={16} showGoldBorder />
                <span className="font-cinzel font-bold text-rose-300">Diamond</span>
              </div>
              <div className="text-[11px] text-rose-300 font-semibold">ଠିକିରି</div>
              <div className="text-[10px] text-neutral-400">ईट</div>
            </div>

            {/* Joker */}
            <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/50 flex flex-col items-center text-center">
              <div className="flex items-center gap-1.5 mb-1">
                <Star size={15} className="text-amber-400 fill-amber-400" />
                <span className="font-cinzel font-bold text-amber-200">Joker</span>
              </div>
              <div className="text-[11px] text-amber-300 font-semibold">ଜୋକର୍</div>
              <div className="text-[10px] text-amber-200/80">जोकर</div>
            </div>
          </div>
        </div>

        {/* Rules Chapters */}
        <div className="space-y-3.5 text-xs sm:text-sm text-amber-100/90 text-left my-2">
          {content.sections.map((section, idx) => (
            <div
              key={idx}
              className="p-3.5 sm:p-4 rounded-2xl bg-neutral-900/70 border border-amber-800/40 hover:border-amber-700/60 transition-colors"
            >
              <h4 className="font-cinzel font-bold text-amber-300 text-xs sm:text-sm mb-2 flex items-center gap-2">
                <BookOpen size={14} className="text-amber-400 flex-shrink-0" />
                <span>{section.title}</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-amber-200/85">
                {section.points.map((pt, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Return to Table Button */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-cinzel font-bold text-xs sm:text-sm tracking-wider uppercase rounded-xl border border-amber-200 shadow-md cursor-pointer transition-all"
          >
            {content.returnButton}
          </button>
        </div>
      </div>
    </div>
  );
};
