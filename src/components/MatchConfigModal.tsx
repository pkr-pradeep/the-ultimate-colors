import React, { useState, useEffect } from 'react';
import { MatchConfig, MatchMode } from '../types/game';
import { RulebookLanguage, getSavedRulebookLanguage, saveRulebookLanguage } from '../utils/firstTimeUser';
import { LanguageSelector } from './LanguageSelector';
import { MODAL_TRANSLATIONS } from '../data/modalTranslations';

interface MatchConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: MatchConfig;
  onApplyConfig: (config: MatchConfig) => void;
  language?: RulebookLanguage;
  onLanguageChange?: (lang: RulebookLanguage) => void;
}

export const MatchConfigModal: React.FC<MatchConfigModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onApplyConfig,
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

  const activeLang = controlledLang || localLang;
  const t = (MODAL_TRANSLATIONS[activeLang] || MODAL_TRANSLATIONS.en).matchConfig;

  const handleLangChange = (lang: RulebookLanguage) => {
    setLocalLang(lang);
    saveRulebookLanguage(lang);
    onLanguageChange?.(lang);
  };

  const [mode, setMode] = useState<MatchMode>(currentConfig.mode);
  const [customPoints, setCustomPoints] = useState<number>(
    currentConfig.targetPoints || 60
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(
    Math.round(currentConfig.durationSeconds / 60) || 15
  );

  if (!isOpen) return null;

  const handleSave = () => {
    onApplyConfig({
      mode,
      targetPoints: mode === 'default_points' ? 100 : customPoints,
      durationSeconds: durationMinutes * 60,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto bg-gradient-to-b from-[#2A150D] via-[#1A0C08] to-[#0F0704] border-2 border-amber-600/70 rounded-2xl p-4 sm:p-6 shadow-2xl text-amber-100 font-outfit text-center">
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
            className="w-8 h-8 rounded-full bg-neutral-900 border border-amber-700/60 text-amber-300 hover:text-white flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-amber-950 border border-amber-600/50 text-amber-300 font-cinzel text-xs uppercase tracking-widest mb-2">
          {t.badge}
        </div>
        <h3 className="font-cinzel text-xl sm:text-2xl font-black text-amber-200">
          {t.title}
        </h3>
        <p className="text-xs text-amber-300/80 mt-1 mb-5">
          {t.subtitle}
        </p>

        {/* Mode Selector */}
        <div className="space-y-3 text-left mb-6">
          {/* Mode 1: Default Points */}
          <label
            onClick={() => setMode('default_points')}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              mode === 'default_points'
                ? 'bg-amber-950/60 border-amber-400 ring-1 ring-amber-400'
                : 'bg-neutral-900/60 border-amber-800/40 hover:border-amber-600'
            }`}
          >
            <input
              type="radio"
              name="matchMode"
              checked={mode === 'default_points'}
              onChange={() => setMode('default_points')}
              className="mt-1 text-amber-500 focus:ring-amber-400"
            />
            <div>
              <div className="font-cinzel font-bold text-amber-200 text-sm">
                {t.defaultModeTitle}
              </div>
              <div className="text-[11px] text-amber-300/70">
                {t.defaultModeDesc}
              </div>
            </div>
          </label>

          {/* Mode 2: Custom Points */}
          <label
            onClick={() => setMode('custom_points')}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              mode === 'custom_points'
                ? 'bg-amber-950/60 border-amber-400 ring-1 ring-amber-400'
                : 'bg-neutral-900/60 border-amber-800/40 hover:border-amber-600'
            }`}
          >
            <input
              type="radio"
              name="matchMode"
              checked={mode === 'custom_points'}
              onChange={() => setMode('custom_points')}
              className="mt-1 text-amber-500 focus:ring-amber-400"
            />
            <div className="flex-1">
              <div className="font-cinzel font-bold text-amber-200 text-sm">
                {t.customModeTitle}
              </div>
              <div className="text-[11px] text-amber-300/70 mb-2">
                {t.customModeDesc}
              </div>
              {mode === 'custom_points' && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-amber-200">{t.targetPointsLabel}</span>
                  <input
                    type="number"
                    min="20"
                    max="200"
                    step="10"
                    value={customPoints}
                    onChange={e => setCustomPoints(Math.max(20, Number(e.target.value) || 20))}
                    className="w-20 px-2 py-1 bg-neutral-900 border border-amber-600 text-amber-200 font-mono text-xs rounded text-center"
                  />
                </div>
              )}
            </div>
          </label>

          {/* Mode 3: Time Mode */}
          <label
            onClick={() => setMode('time')}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              mode === 'time'
                ? 'bg-amber-950/60 border-amber-400 ring-1 ring-amber-400'
                : 'bg-neutral-900/60 border-amber-800/40 hover:border-amber-600'
            }`}
          >
            <input
              type="radio"
              name="matchMode"
              checked={mode === 'time'}
              onChange={() => setMode('time')}
              className="mt-1 text-amber-500 focus:ring-amber-400"
            />
            <div className="flex-1">
              <div className="font-cinzel font-bold text-amber-200 text-sm">
                {t.timeModeTitle}
              </div>
              <div className="text-[11px] text-amber-300/70 mb-2">
                {t.timeModeDesc}
              </div>
              {mode === 'time' && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-amber-200">{t.durationLabel}</span>
                  <input
                    type="number"
                    min="3"
                    max="60"
                    step="1"
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Math.max(1, Number(e.target.value) || 15))}
                    className="w-20 px-2 py-1 bg-neutral-900 border border-amber-600 text-amber-200 font-mono text-xs rounded text-center"
                  />
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-cinzel font-bold text-xs uppercase rounded-xl border border-amber-200 shadow-md cursor-pointer transition-all"
          >
            {t.btnApply}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-amber-200 font-cinzel text-xs rounded-xl border border-amber-700/50 cursor-pointer transition-colors"
          >
            {t.btnCancel}
          </button>
        </div>
      </div>
    </div>
  );
};
