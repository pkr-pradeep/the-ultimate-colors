import React from 'react';
import { Card } from '../types/game';
import { DadajiArtwork } from './art/DadajiArtwork';
import { RoyalCourtArtwork } from './art/RoyalCourtArtwork';
import { SuitIcon } from './art/SuitIcon';

interface CardViewProps {
  card: Card;
  isFaceUp?: boolean;
  isSelected?: boolean;
  isLegal?: boolean;
  isDimmed?: boolean;
  isTrump?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  isFaceUp = true,
  isSelected = false,
  isLegal = true,
  isDimmed = false,
  isTrump = false,
  size = 'md',
  onClick,
  className = '',
  style,
}) => {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const rankTextColor = card.isDadajiJoker
    ? 'text-amber-600'
    : isRed
    ? 'text-red-700'
    : 'text-neutral-900';

  // Size dimensions
  const sizeMap = {
    xs: 'w-13 h-21 sm:w-16 sm:h-25 text-[10px]',
    sm: 'w-18 h-28 sm:w-20 sm:h-30 text-xs',
    md: 'w-22 h-34 sm:w-26 sm:h-40 text-sm',
    lg: 'w-32 h-48 sm:w-36 sm:h-54 text-base',
    xl: 'w-48 h-72 sm:w-56 sm:h-84 text-lg',
  };

  const suitIconSize = {
    xs: 13,
    sm: 18,
    md: 24,
    lg: 32,
    xl: 42,
  }[size];

  const rankTextClass = {
    xs: 'text-xs sm:text-sm font-black',
    sm: 'text-sm font-black',
    md: 'text-base sm:text-lg font-black',
    lg: 'text-xl sm:text-2xl font-black',
    xl: 'text-3xl sm:text-4xl font-black',
  }[size];

  const centerPipSize = {
    xs: 10,
    sm: 14,
    md: 20,
    lg: 26,
    xl: 36,
  }[size];

  if (!isFaceUp) {
    // Face down card view
    return (
      <div
        style={style}
        onClick={onClick}
        className={`relative ${sizeMap[size]} rounded-xl overflow-hidden shadow-lg select-none transition-transform duration-200 cursor-pointer ${className}`}
      >
        <div className="w-full h-full bg-gradient-to-br from-red-900 via-rose-950 to-neutral-950 p-1 border border-amber-600/60 rounded-xl flex items-center justify-center">
          <div className="w-full h-full border border-amber-400/40 rounded-lg flex items-center justify-center relative overflow-hidden bg-[radial-gradient(circle,#881337_0%,#450A0A_70%,#180303_100%)]">
            {/* Jaali lattice lines */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FDE68A_1px,transparent_1px)] [background-size:8px_8px]" />
            <div className="w-8 h-8 rounded-full border border-amber-400/60 flex items-center justify-center bg-amber-950/60 shadow-inner">
              <span className="text-amber-300 font-cinzel text-xs font-bold">UJ</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Face-Up Card View: Antique Ivory Paper with Double Gold Borders
  return (
    <div
      style={style}
      onClick={isLegal ? onClick : undefined}
      className={`relative ${sizeMap[size]} rounded-xl select-none transition-all duration-200 ${
        isLegal ? 'cursor-pointer' : 'cursor-not-allowed'
      } ${isSelected ? '-translate-y-5 ring-2 ring-amber-400 shadow-xl z-30' : ''} ${
        isDimmed ? 'opacity-50 grayscale-[25%]' : 'opacity-100'
      } ${
        isLegal && !isDimmed ? 'hover:-translate-y-3 hover:shadow-xl hover:ring-1 hover:ring-amber-300/80' : ''
      } ${className}`}
    >
      {/* Outer Card Body: Warm Antique Ivory Paper Background */}
      <div className="w-full h-full rounded-xl bg-[#FAF6EC] shadow-md border-[1.5px] border-[#D4AF37] relative flex flex-col justify-between overflow-hidden p-1 sm:p-1.5 transition-colors">
        {/* Subtle Paper Grain Overlay & Warmth Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF7] via-[#FAF6EC] to-[#F2ECD8] pointer-events-none" />

        {/* Inner Gold Inlay Border */}
        <div className="absolute inset-1 sm:inset-1.5 border border-[#E5C365] rounded-lg pointer-events-none opacity-80" />

        {/* Corner Flourish Decors */}
        <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-[#B45309] rounded-tl pointer-events-none" />
        <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-[#B45309] rounded-tr pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-[#B45309] rounded-bl pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-[#B45309] rounded-br pointer-events-none" />

        {/* Trump Card Banner Badge */}
        {isTrump && !card.isDadajiJoker && (
          <div className="absolute top-1/2 -right-3 -translate-y-1/2 rotate-90 text-[8px] sm:text-[9px] font-cinzel font-black text-amber-950 bg-gradient-to-r from-amber-300 to-amber-400 px-1.5 py-0.5 rounded-xs shadow-xs border border-amber-600 tracking-wider">
            TRUMP
          </div>
        )}

        {/* Top-Right Secondary Suit Medallion on Court Cards for instant visibility */}
        {(card.rank === 'K' || card.rank === 'Q' || card.rank === 'J') && (
          <div className="absolute top-1 right-1 z-20 bg-[#FAF6EC]/95 rounded-full p-0.5 border border-[#D4AF37] shadow-xs flex items-center justify-center">
            <SuitIcon suit={card.suit as any} size={size === 'sm' ? 12 : 16} />
          </div>
        )}

        {/* TOP-LEFT INDEX (ENLARGED) */}
        <div className="relative z-10 flex flex-col items-center leading-none pl-0.5 pt-0.5">
          {card.isDadajiJoker ? (
            <div className="flex flex-col items-center">
              <span className="font-cinzel font-black text-amber-700 text-xs sm:text-sm tracking-tighter">
                JOKER
              </span>
              <span className="text-xs sm:text-sm text-amber-600 font-bold">★</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className={`font-cinzel font-black tracking-tighter ${rankTextColor} ${rankTextClass}`}>
                {card.rank}
              </span>
              {card.suit !== 'joker' && (
                <div className="mt-0.5">
                  <SuitIcon suit={card.suit} size={suitIconSize} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* CENTER ARTWORK / PIPS */}
        <div className="relative z-0 flex-1 w-full flex items-center justify-center p-0.5 overflow-hidden">
          {card.isDadajiJoker ? (
            // DADAJI UNIVERSAL JOKER
            <div className="w-full h-full flex items-center justify-center py-0.5">
              <DadajiArtwork isDetailed={size !== 'sm' && size !== 'xs'} />
            </div>
          ) : card.rank === 'K' || card.rank === 'Q' || card.rank === 'J' || card.rank === 'A' ? (
            // ROYAL INDIAN COURT ARTWORK
            <div className="w-full h-full flex items-center justify-center py-0.5">
              <RoyalCourtArtwork rank={card.rank} suit={card.suit as any} />
            </div>
          ) : (
            // NUMBER CARDS (Pips with Mughal floral watermark & enlarged pips)
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              {/* Subtle central Mughal flower watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-16 h-16 fill-[#B45309]">
                  <circle cx="50" cy="50" r="15" />
                  <ellipse cx="50" cy="25" rx="8" ry="16" />
                  <ellipse cx="50" cy="75" rx="8" ry="16" />
                  <ellipse cx="25" cy="50" rx="16" ry="8" />
                  <ellipse cx="75" cy="50" rx="16" ry="8" />
                </svg>
              </div>

              {/* Multi-pip display with enlarged pips */}
              <div className="grid grid-cols-2 gap-x-2.5 sm:gap-x-3 gap-y-1 sm:gap-y-1.5 items-center justify-items-center">
                {Array.from({ length: Math.min(Number(card.rank) || 4, 6) }).map((_, i) => (
                  <SuitIcon
                    key={i}
                    suit={card.suit as any}
                    size={centerPipSize}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM-RIGHT INVERTED INDEX (ENLARGED) */}
        <div className="relative z-10 flex flex-col items-center leading-none pr-0.5 pb-0.5 rotate-180 self-end">
          {card.isDadajiJoker ? (
            <div className="flex flex-col items-center">
              <span className="font-cinzel font-black text-amber-700 text-xs sm:text-sm tracking-tighter">
                JOKER
              </span>
              <span className="text-xs sm:text-sm text-amber-600 font-bold">★</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className={`font-cinzel font-black tracking-tighter ${rankTextColor} ${rankTextClass}`}>
                {card.rank}
              </span>
              {card.suit !== 'joker' && (
                <div className="mt-0.5">
                  <SuitIcon suit={card.suit} size={suitIconSize} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
