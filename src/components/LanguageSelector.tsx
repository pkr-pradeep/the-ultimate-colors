import React from 'react';
import { RulebookLanguage, saveRulebookLanguage } from '../utils/firstTimeUser';
import { Languages } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: RulebookLanguage;
  onSelectLanguage: (lang: RulebookLanguage) => void;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  showLabel?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onSelectLanguage,
  size = 'sm',
  showIcon = true,
  showLabel = false,
}) => {
  const handleSelect = (lang: RulebookLanguage) => {
    saveRulebookLanguage(lang);
    onSelectLanguage(lang);
  };

  const btnClasses = (isActive: boolean) => {
    const base = 'rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center';
    const sizePadding =
      size === 'xs'
        ? 'px-2 py-0.5 text-[11px]'
        : size === 'md'
        ? 'px-3.5 py-1.5 text-xs sm:text-sm'
        : 'px-2.5 py-1 text-xs';

    if (isActive) {
      return `${base} ${sizePadding} bg-amber-500 text-neutral-950 font-bold shadow ring-1 ring-amber-300`;
    }
    return `${base} ${sizePadding} text-amber-200/80 hover:text-white hover:bg-white/10`;
  };

  return (
    <div className="inline-flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-amber-700/50 backdrop-blur-sm select-none">
      {showIcon && <Languages size={15} className="text-amber-400 ml-1 flex-shrink-0" />}
      {showLabel && (
        <span className="text-[11px] font-cinzel text-amber-300 font-bold uppercase tracking-wider hidden sm:inline mr-0.5">
          Lang:
        </span>
      )}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleSelect('en')}
          className={btnClasses(currentLanguage === 'en')}
          title="English"
        >
          🇬🇧 <span className="ml-1">EN</span>
        </button>
        <button
          type="button"
          onClick={() => handleSelect('hi')}
          className={btnClasses(currentLanguage === 'hi')}
          title="हिंदी (Hindi)"
        >
          🇮🇳 <span className="ml-1">HI</span>
        </button>
        <button
          type="button"
          onClick={() => handleSelect('or')}
          className={btnClasses(currentLanguage === 'or')}
          title="ଓଡ଼ିଆ (Odia)"
        >
          🇮🇳 <span className="ml-1">OR</span>
        </button>
      </div>
    </div>
  );
};
