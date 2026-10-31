import React, { useState, useEffect } from 'react';
import { AIIntelligenceLevel } from '../types/game';
import { Brain, ShieldCheck, Zap, Sparkles, Check, ChevronRight } from 'lucide-react';
import { RulebookLanguage, getSavedRulebookLanguage, saveRulebookLanguage } from '../utils/firstTimeUser';
import { LanguageSelector } from './LanguageSelector';
import { MODAL_TRANSLATIONS } from '../data/modalTranslations';

interface TacticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: AIIntelligenceLevel;
  onSelectMode: (mode: AIIntelligenceLevel) => void;
  language?: RulebookLanguage;
  onLanguageChange?: (lang: RulebookLanguage) => void;
}

export const TacticsModal: React.FC<TacticsModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
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

  if (!isOpen) return null;

  const activeLang = controlledLang || localLang;
  const t = (MODAL_TRANSLATIONS[activeLang] || MODAL_TRANSLATIONS.en).tactics;

  const handleLangChange = (lang: RulebookLanguage) => {
    setLocalLang(lang);
    saveRulebookLanguage(lang);
    onLanguageChange?.(lang);
  };

  const modes: {
    id: AIIntelligenceLevel;
    title: string;
    badge: string;
    color: string;
    icon: React.ReactNode;
    subtitle: string;
    description: string;
    unveiledTricks: string[];
    lockedTricks?: string[];
  }[] = [
    {
      id: 'novice',
      title: t.noviceTitle,
      badge: t.noviceBadge,
      color: 'from-blue-950 to-slate-900 border-blue-500/50 text-blue-300',
      icon: <Brain className="text-blue-400" size={20} />,
      subtitle: t.noviceSubtitle,
      description: t.noviceDesc,
      unveiledTricks: t.noviceUnveiled,
      lockedTricks: t.noviceLocked,
    },
    {
      id: 'master',
      title: t.masterTitle,
      badge: t.masterBadge,
      color: 'from-amber-950 to-neutral-900 border-amber-500/60 text-amber-300',
      icon: <ShieldCheck className="text-amber-400" size={20} />,
      subtitle: t.masterSubtitle,
      description: t.masterDesc,
      unveiledTricks: t.masterUnveiled,
      lockedTricks: t.masterLocked,
    },
    {
      id: 'legend',
      title: t.legendTitle,
      badge: t.legendBadge,
      color: 'from-red-950 via-amber-950 to-neutral-950 border-amber-400 text-amber-200',
      icon: <Zap className="text-amber-300" size={20} />,
      subtitle: t.legendSubtitle,
      description: t.legendDesc,
      unveiledTricks: t.legendUnveiled,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-neutral-950/85 backdrop-blur-md animate-fade-in font-outfit">
      <div className="relative w-full max-w-3xl max-h-[92dvh] overflow-y-auto bg-gradient-to-b from-[#28140B] via-[#160A05] to-[#0A0402] border-2 border-amber-600/70 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col text-amber-100">
        {/* Top Controls: Language Toggle & Close Button */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-800/40">
          <LanguageSelector
            currentLanguage={activeLang}
            onSelectLanguage={handleLangChange}
            size="sm"
            showIcon
          />
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-amber-700/60 text-amber-300 hover:text-white flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors z-20"
          >
            ✕
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-5 pr-6 sm:pr-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 border border-amber-500/50 text-amber-300 font-cinzel text-xs uppercase tracking-widest mb-1.5">
            <Sparkles size={12} className="text-amber-400" />
            <span>{t.badge}</span>
          </div>
          <h2 className="font-cinzel text-2xl sm:text-3xl font-black text-amber-200">
            {t.title}
          </h2>
          <p className="text-xs sm:text-sm text-amber-300/80 mt-1 max-w-lg mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* 3 Tier Mode Cards */}
        <div className="flex flex-col gap-3.5 mb-5">
          {modes.map(mode => {
            const isSelected = currentMode === mode.id;

            return (
              <div
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative bg-gradient-to-r ${mode.color} ${
                  isSelected
                    ? 'ring-2 ring-amber-400 shadow-xl scale-[1.01]'
                    : 'opacity-80 hover:opacity-100 hover:scale-[1.005]'
                }`}
              >
                {/* Active Indicator Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-neutral-900/80 border border-amber-500/40">
                      {mode.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-cinzel font-bold text-base sm:text-lg text-amber-100">
                          {mode.title}
                        </h3>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-neutral-950/80 border border-amber-600/40 text-amber-300">
                          {mode.badge}
                        </span>
                      </div>
                      <div className="text-xs text-amber-300/90 font-medium">
                        {mode.subtitle}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMode(mode.id);
                    }}
                    className={`px-3 py-1 rounded-lg font-cinzel text-xs font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-neutral-950 shadow-md ring-1 ring-amber-200'
                        : 'bg-neutral-900/90 text-amber-300 border border-amber-700/60 hover:bg-neutral-800'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check size={12} className="stroke-[3]" />
                        <span>{t.activeBtn}</span>
                      </>
                    ) : (
                      <>
                        <span>{t.selectBtn}</span>
                        <ChevronRight size={12} />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-amber-100/85 mb-3 leading-relaxed">
                  {mode.description}
                </p>

                {/* Unveiled Tricks */}
                <div className="space-y-1.5 text-[11px] sm:text-xs">
                  <div className="font-cinzel font-bold text-amber-300 text-[10px] uppercase tracking-wider mb-1">
                    {t.unveiledTricksHeader}
                  </div>
                  {mode.unveiledTricks.map((trick, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-amber-100">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{trick}</span>
                    </div>
                  ))}
                  {mode.lockedTricks && mode.lockedTricks.length > 0 && (
                    <div className="pt-1 mt-1 border-t border-white/10 space-y-1 opacity-60">
                      {mode.lockedTricks.map((locked, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-neutral-400 line-through text-[10px] sm:text-[11px]">
                          <span className="text-rose-400 font-bold shrink-0">✕</span>
                          <span>{locked}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-amber-800/40 text-xs text-amber-300/80">
          <div>
            {t.activeModeLabel} <strong className="text-amber-100 uppercase">{currentMode}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-cinzel font-bold text-xs uppercase rounded-xl border border-amber-200 shadow-md cursor-pointer transition-all"
          >
            {t.applyBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
