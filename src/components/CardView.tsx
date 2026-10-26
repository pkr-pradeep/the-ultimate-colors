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
  // Proportional sizing using exact 5:7 playing card aspect ratio (750x1050)
  const sizeMap = {
    xs: 'w-13 sm:w-15 aspect-[5/7]',
    sm: 'w-17 sm:w-19 aspect-[5/7]',
    md: 'w-21 sm:w-25 aspect-[5/7]',
    lg: 'w-30 sm:w-34 aspect-[5/7]',
    xl: 'w-44 sm:w-52 aspect-[5/7]',
  };

  if (!isFaceUp) {
    // Face down card view with authentic Indian Playing Card back design
    return (
      <div
        style={style}
        onClick={onClick}
        className={`relative ${sizeMap[size]} rounded-lg sm:rounded-xl overflow-hidden shadow-lg select-none transition-transform duration-200 cursor-pointer ${className}`}
      >
        <img
          src={getCardBackAssetUrl()}
          alt="Card Back"
          className="w-full h-full object-fill rounded-lg sm:rounded-xl border border-[#6e1423]/50 pointer-events-none select-none block"
          loading="lazy"
          draggable={false}
        />
      </div>
    );
  }

  const assetUrl = getCardAssetUrl(card);

  return (
    <div
      style={style}
      onClick={isLegal ? onClick : undefined}
      className={`relative ${sizeMap[size]} rounded-lg sm:rounded-xl select-none transition-all duration-200 ${
        isLegal ? 'cursor-pointer' : 'cursor-not-allowed'
      } ${
        isSelected
          ? '-translate-y-5 ring-2 sm:ring-3 ring-amber-400 shadow-2xl z-30'
          : ''
      } ${
        isDimmed ? 'opacity-40 grayscale-[35%]' : 'opacity-100'
      } ${
        isLegal && !isDimmed
          ? 'hover:-translate-y-2.5 hover:shadow-2xl hover:ring-2 hover:ring-amber-300'
          : ''
      } ${className}`}
    >
      {/* Outer Card Container with authentic extracted card image */}
      <div className="w-full h-full relative rounded-lg sm:rounded-xl overflow-hidden shadow-md bg-[#fbf1dc] border border-[#6e1423]/60 flex items-center justify-center">
        <img
          src={assetUrl}
          alt={card.name || `${card.rank} of ${card.suit}`}
          className="w-full h-full object-fill pointer-events-none select-none block"
          loading="lazy"
          draggable={false}
        />

        {/* Trump Card Badge Indicator */}
        {isTrump && !card.isDadajiJoker && (
          <div className="absolute top-1 right-1 z-20 px-1 py-0.5 rounded-xs bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-cinzel font-black text-[7px] sm:text-[8px] tracking-wider uppercase border border-amber-600 shadow-xs">
            TRUMP
          </div>
        )}

        {/* Dadaji Joker subtle golden aura sheen */}
        {card.isDadajiJoker && (
          <div className="absolute inset-0 pointer-events-none rounded-lg sm:rounded-xl ring-1 ring-amber-400/50 shadow-[inset_0_0_10px_rgba(245,158,11,0.35)]" />
        )}
      </div>
    </div>
  );
};
