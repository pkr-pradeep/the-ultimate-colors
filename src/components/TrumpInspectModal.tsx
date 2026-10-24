import React from 'react';
import { Card, Suit } from '../types/game';
import { CardView } from './CardView';
import { SUIT_NAMES } from '../engine/deck';

interface TrumpInspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  trumpSuit: Suit | null;
  trumpCard: Card | null;
}

export const TrumpInspectModal: React.FC<TrumpInspectModalProps> = ({
  isOpen,
  onClose,
  trumpSuit,
  trumpCard,
}) => {
  if (!isOpen || !trumpCard || !trumpSuit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm max-h-[90dvh] overflow-y-auto bg-gradient-to-b from-[#2E1810] via-[#1F100B] to-[#120704] border-2 border-amber-600/70 rounded-2xl p-4 sm:p-6 shadow-2xl text-center flex flex-col items-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-neutral-900 border border-amber-700/60 text-amber-300 hover:text-white flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors"
        >
          ✕
        </button>

        <div className="inline-block px-3 py-1 rounded-full bg-amber-950 border border-amber-600/50 text-amber-300 font-cinzel text-xs uppercase tracking-widest mb-2 sm:mb-3">
          13th Final Dealt Card
        </div>

        <h3 className="font-cinzel text-lg sm:text-xl font-black text-amber-200">
          The Ruling Trump Suit
        </h3>
        <p className="text-xs text-amber-300/80 font-outfit mt-1 mb-2 sm:mb-4">
          Determined by the final card dealt: {SUIT_NAMES[trumpSuit]}
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
          All cards of suit <strong className="text-amber-300 uppercase">{trumpSuit}</strong> will trump standard leads in this round! (Unless Dadaji Joker is played).
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-cinzel font-bold text-xs uppercase rounded-xl border border-amber-200 shadow-md cursor-pointer transition-all"
        >
          Close Inspection
        </button>
      </div>
    </div>
  );
};
