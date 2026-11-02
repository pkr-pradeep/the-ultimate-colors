import React from 'react';
import { X, RefreshCw } from 'lucide-react';
import { RulebookLanguage } from '../utils/firstTimeUser';

interface ReshufflePopupProps {
  isOpen: boolean;
  reason: string | null;
  onClose: () => void;
  language?: RulebookLanguage;
}

export const ReshufflePopup: React.FC<ReshufflePopupProps> = ({
  isOpen,
  reason,
  onClose,
  language = 'en',
}) => {
  if (!isOpen || !reason) return null;

  const title =
    language === 'or'
      ? 'କାର୍ଡ ପୁନଃ-ବଣ୍ଟନ ସୂଚନା'
      : language === 'hi'
      ? 'कार्ड फेरबदल सूचना'
      : 'Reshuffle Notice';

  const closeLabel =
    language === 'or' ? 'ବନ୍ଦ କରନ୍ତୁ' : language === 'hi' ? 'बंद करें' : 'Close';

  const buttonLabel =
    language === 'or' ? 'ବୁଝିଗଲି' : language === 'hi' ? 'समझ गया' : 'Understood';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#2B150C] via-[#1C0D07] to-[#120703] border-2 border-amber-500/80 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-center animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Ornate Gold Filigree Corners */}
        <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-amber-400 rounded-tl pointer-events-none" />
        <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-amber-400 rounded-tr pointer-events-none" />
        <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-amber-400 rounded-bl pointer-events-none" />
        <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-amber-400 rounded-br pointer-events-none" />

        {/* Cross (Close) Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-amber-300/80 hover:text-amber-100 border border-amber-800/50 flex items-center justify-center cursor-pointer transition-colors"
          title={closeLabel}
          aria-label={closeLabel}
        >
          <X size={15} />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
            <RefreshCw size={16} />
          </div>
          <h3 className="font-cinzel text-base sm:text-lg font-bold text-amber-300 uppercase tracking-wider">
            {title}
          </h3>
        </div>

        {/* Reason Message */}
        <p className="text-xs sm:text-sm text-amber-100/90 font-outfit leading-relaxed my-3 px-2 bg-neutral-950/40 py-2.5 rounded-xl border border-amber-900/30">
          {reason}
        </p>

        {/* Action Button */}
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-cinzel font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
