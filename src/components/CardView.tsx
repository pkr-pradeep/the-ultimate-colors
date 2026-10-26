import React from 'react';
import { Card } from '../types/game';
import { getCardAssetUrl, getCardBackAssetUrl } from '../utils/cardAssets';

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

export const CardView = React.memo<CardViewProps>(({
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
  // Generously enlarged proportional dimensions for maximum readability on mobile devices
  const sizeMap = {
    xs: 'w-17 sm:w-20 aspect-[5/7]',
    sm: 'w-21 sm:w-25 aspect-[5/7]',
    md: 'w-27 sm:w-32 aspect-[5/7]',
    lg: 'w-36 sm:w-42 aspect-[5/7]',
    xl: 'w-52 sm:w-64 aspect-[5/7]',
  };

  if (!isFaceUp) {
    // Face-down card view with authentic Indian Playing Card back design
    return (
      <div
        style={style}
        onClick={onClick}
        className={`relative ${sizeMap[size]} rounded-lg sm:rounded-xl overflow-hidden shadow-md select-none transition-transform duration-150 ease-out cursor-pointer will-change-transform ${className}`}
      >
        <img
          src={getCardBackAssetUrl('png')}
          alt="Card Back"
          className="w-full h-full object-fill rounded-lg sm:rounded-xl border border-[#6e1423]/50 pointer-events-none select-none block"
          loading="eager"
          decoding="async"
          draggable={false}
        />
      </div>
    );
  }

  const assetUrl = getCardAssetUrl(card, 'png');
  const isTrumpCard = isTrump && !card.isDadajiJoker;
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  // High-contrast, vivid colors for instant corner index readability on mobile
  const rankTextColor = card.isDadajiJoker
    ? 'text-amber-800'
    : isRed
    ? 'text-rose-700'
    : 'text-neutral-950';

  const suitGlyph = card.isDadajiJoker
    ? '★'
    : card.suit === 'spades'
    ? '♠'
    : card.suit === 'hearts'
    ? '♥'
    : card.suit === 'diamonds'
    ? '♦'
    : '♣';

  // Enlarged, bold typography for corner indices to completely eliminate eye strain
  const cornerRankSize = {
    xs: 'text-xs leading-3 sm:text-sm sm:leading-3.5',
    sm: 'text-sm leading-3.5 sm:text-base sm:leading-4',
    md: 'text-base leading-4 sm:text-lg sm:leading-5',
    lg: 'text-lg leading-5 sm:text-xl sm:leading-6',
    xl: 'text-2xl leading-6 sm:text-3xl sm:leading-7',
  }[size];

  const cornerSuitSize = {
    xs: 'text-[11px] leading-[11px] sm:text-xs sm:leading-3',
    sm: 'text-xs leading-3 sm:text-sm sm:leading-3.5',
    md: 'text-sm leading-3.5 sm:text-base sm:leading-4',
    lg: 'text-base leading-4 sm:text-lg sm:leading-5',
    xl: 'text-xl leading-5 sm:text-2xl sm:leading-6',
  }[size];

  return (
    <div
      style={style}
      onClick={isLegal ? onClick : undefined}
      className={`relative ${sizeMap[size]} rounded-lg sm:rounded-xl select-none transition-[transform,opacity] duration-150 ease-out will-change-transform ${
        isLegal ? 'cursor-pointer' : 'cursor-not-allowed'
      } ${
        isSelected
          ? '-translate-y-4 sm:-translate-y-6 ring-2 sm:ring-4 ring-amber-400 z-30'
          : ''
      } ${
        isDimmed ? 'opacity-35 grayscale-[40%]' : 'opacity-100'
      } ${
        isLegal && !isDimmed
          ? 'hover:-translate-y-2.5 active:scale-98'
          : ''
      } ${className}`}
    >
      {/* Outer Card Container */}
      <div
        className={`w-full h-full relative rounded-lg sm:rounded-xl overflow-hidden bg-[#fbf1dc] flex items-center justify-center ${
          isTrumpCard
            ? 'border-[3px] sm:border-[4px] border-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.6)]'
            : 'border border-[#6e1423]/70 shadow-sm'
        }`}
      >
        <img
          src={assetUrl}
          alt={card.name || `${card.rank} of ${card.suit}`}
          className="w-full h-full object-fill pointer-events-none select-none block"
          loading="eager"
          decoding="async"
          draggable={false}
        />

        {/* Generous High-Contrast Top-Left Corner Index Overlay */}
        <div className="absolute top-1 left-1 z-20 flex flex-col items-center justify-center px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-[4px] bg-[#FAF6EC]/98 border border-[#B99F7B] shadow-[0_1px_3px_rgba(0,0,0,0.35)] pointer-events-none select-none">
          <span className={`font-cinzel font-black tracking-tight ${rankTextColor} ${cornerRankSize}`}>
            {card.isDadajiJoker ? 'J' : card.rank}
          </span>
          <span className={`font-black ${rankTextColor} ${cornerSuitSize} mt-0.5`}>
            {suitGlyph}
          </span>
        </div>

        {/* Generous High-Contrast Bottom-Right Inverted Corner Index Overlay */}
        <div className="absolute bottom-1 right-1 z-20 flex flex-col items-center justify-center px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-[4px] bg-[#FAF6EC]/98 border border-[#B99F7B] shadow-[0_1px_3px_rgba(0,0,0,0.35)] pointer-events-none select-none rotate-180">
          <span className={`font-cinzel font-black tracking-tight ${rankTextColor} ${cornerRankSize}`}>
            {card.isDadajiJoker ? 'J' : card.rank}
          </span>
          <span className={`font-black ${rankTextColor} ${cornerSuitSize} mt-0.5`}>
            {suitGlyph}
          </span>
        </div>

        {/* Bold Blue Inner Accent Ring for Trump Suit Cards */}
        {isTrumpCard && (
          <div className="absolute inset-0 pointer-events-none rounded-md sm:rounded-lg ring-1 sm:ring-2 ring-blue-400/90 ring-inset shadow-[inset_0_0_8px_rgba(37,99,235,0.35)]" />
        )}

        {/* Dadaji Joker subtle golden aura sheen */}
        {card.isDadajiJoker && (
          <div className="absolute inset-0 pointer-events-none rounded-lg sm:rounded-xl ring-1 ring-amber-400/50 shadow-[inset_0_0_8px_rgba(245,158,11,0.3)]" />
        )}
      </div>
    </div>
  );
});

CardView.displayName = 'CardView';
