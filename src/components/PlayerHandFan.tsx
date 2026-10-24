import React, { useState, useEffect, useMemo } from 'react';
import { Card, Suit } from '../types/game';
import { CardView } from './CardView';
import { ArrowUpDown } from 'lucide-react';

interface PlayerHandFanProps {
  cards: Card[];
  legalCards: Card[];
  isMyTurn: boolean;
  isBidding?: boolean;
  trumpSuit: string | null;
  onPlayCard: (card: Card) => void;
}

export const PlayerHandFan: React.FC<PlayerHandFanProps> = ({
  cards,
  legalCards,
  isMyTurn,
  isBidding = false,
  trumpSuit,
  onPlayCard,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'suit' | 'rank' | 'natural'>('suit');
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  // Sorting logic for player convenience
  const sortedCards = useMemo(() => {
    if (sortBy === 'natural') return cards;

    const rankWeight: Record<string, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
      '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
    };

    const suitOrder: Record<string, number> = {
      spades: 1,
      hearts: 2,
      diamonds: 3,
      clubs: 4,
      joker: 0,
    };

    return [...cards].sort((a, b) => {
      if (a.isDadajiJoker) return -1;
      if (b.isDadajiJoker) return 1;

      if (sortBy === 'suit') {
        const suitA = suitOrder[a.suit || ''] ?? 99;
        const suitB = suitOrder[b.suit || ''] ?? 99;
        if (suitA !== suitB) return suitA - suitB;
        return (rankWeight[b.rank || ''] || 0) - (rankWeight[a.rank || ''] || 0);
      } else {
        // sortBy rank
        const rankA = rankWeight[a.rank || ''] || 0;
        const rankB = rankWeight[b.rank || ''] || 0;
        if (rankA !== rankB) return rankB - rankA;
        return (suitOrder[a.suit || ''] ?? 0) - (suitOrder[b.suit || ''] ?? 0);
      }
    });
  }, [cards, sortBy]);

  const n = sortedCards.length;
  const center = (n - 1) / 2;

  // Adaptive angle & spacing depending on number of remaining cards and viewport
  const angleStep = isMobile ? (n > 10 ? 2.0 : n > 6 ? 2.8 : 3.8) : (n > 10 ? 2.6 : n > 6 ? 3.5 : 4.5);
  const yMultiplier = isMobile ? (n > 10 ? 1.0 : 0.8) : (n > 10 ? 1.5 : 1.2);

  const handleCardClick = (card: Card) => {
    const isLegal = legalCards.some(c => c.id === card.id);
    if (!isLegal) return;

    if (selectedCardId === card.id && isMyTurn) {
      // Second tap on already selected card -> play it!
      onPlayCard(card);
      setSelectedCardId(null);
    } else {
      setSelectedCardId(card.id);
    }
  };

  const handlePlaySelected = () => {
    if (!selectedCardId || !isMyTurn) return;
    const card = cards.find(c => c.id === selectedCardId);
    if (card) {
      onPlayCard(card);
      setSelectedCardId(null);
    }
  };

  const selectedCard = sortedCards.find(c => c.id === selectedCardId);
  const isSelectedCardLegal = selectedCard
    ? legalCards.some(c => c.id === selectedCard.id)
    : false;

  // Responsive card size for hand fan (during bidding, keep cards compact so the bidding console has full view)
  const cardSize = isMobile ? 'xs' : isBidding ? 'sm' : isTablet ? 'sm' : 'md';

  // Responsive overlap margin calculation:
  // On mobile xs cards (width 52px), negative margin -28px leaves 24px visible index corner.
  // When fewer cards remain, spacing relaxes.
  const getOverlapMarginClass = () => {
    if (isMobile) {
      return n > 9 ? '-ml-7' : n > 5 ? '-ml-6' : '-ml-4';
    }
    if (isTablet || isBidding) {
      return n > 9 ? '-ml-8' : n > 5 ? '-ml-6' : '-ml-4';
    }
    return n > 10 ? '-ml-10' : n > 6 ? '-ml-8' : '-ml-6';
  };

  return (
    <div className="relative w-full flex flex-col items-center select-none pt-0.5 pb-0.5">
      {/* Top Action Bar: Play Confirmation and Quick Sort Controls */}
      <div className="w-full max-w-4xl px-2 mb-0.5 flex items-center justify-between min-h-[28px] sm:min-h-[32px]">
        {/* Quick Hand Sorting Button */}
        <button
          type="button"
          onClick={() => {
            setSortBy(prev => (prev === 'suit' ? 'rank' : prev === 'rank' ? 'natural' : 'suit'));
          }}
          title="Toggle hand arrangement (By Suit / By Rank / Deal Order)"
          className="px-2 py-1 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-amber-300/90 border border-amber-800/40 text-[10px] font-cinzel flex items-center gap-1 cursor-pointer transition-colors"
        >
          <ArrowUpDown size={11} />
          <span>Sort: {sortBy === 'suit' ? 'Suits' : sortBy === 'rank' ? 'Ranks' : 'Deal'}</span>
        </button>

        {/* Play Action Button (if card selected during player's turn) */}
        {isMyTurn && selectedCard && (
          <div className="animate-fade-in flex items-center">
            <button
              type="button"
              onClick={handlePlaySelected}
              disabled={!isSelectedCardLegal}
              className={`min-h-[40px] sm:min-h-[44px] px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelectedCardLegal
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-neutral-950 border border-amber-200 shadow-amber-500/40 animate-pulse'
                  : 'bg-neutral-800 text-neutral-400 border border-neutral-700 cursor-not-allowed'
              }`}
            >
              <span>Play {selectedCard.shortName}</span>
              {selectedCard.isDadajiJoker && <span>★ (Supreme Trump)</span>}
            </button>
          </div>
        )}

        {/* Card Counter Pill */}
        <div className="text-[10px] text-amber-400/70 font-outfit">
          <span>{cards.length} cards</span>
        </div>
      </div>

      {/* The Natural Fan Arc Container - responsive height that prevents clipping the center arena */}
      <div
        className={`relative ${
          isBidding
            ? 'h-16 sm:h-20 md:h-24'
            : 'h-20 sm:h-24 md:h-30'
        } w-full max-w-4xl flex items-end justify-center overflow-visible px-2 pb-0.5`}
      >
        {sortedCards.map((card, index) => {
          const isSelected = selectedCardId === card.id;
          const isLegal = isMyTurn ? legalCards.some(c => c.id === card.id) : true;
          const isDimmed = isMyTurn && !isLegal;

          // Fan mathematics
          const normalizedIndex = index - center;
          const rotation = normalizedIndex * angleStep;
          const yOffset = Math.pow(Math.abs(normalizedIndex), 1.4) * yMultiplier;

          return (
            <div
              key={card.id}
              style={{
                marginLeft: index === 0 ? '0' : undefined,
                transform: `rotate(${rotation}deg) translateY(${yOffset}px)`,
                zIndex: isSelected ? 40 : index + 5,
              }}
              className={`transform origin-bottom transition-all duration-200 ${
                index !== 0 ? getOverlapMarginClass() : ''
              }`}
            >
              <CardView
                card={card}
                size={cardSize}
                isSelected={isSelected}
                isLegal={isLegal}
                isDimmed={isDimmed}
                isTrump={trumpSuit ? card.suit === trumpSuit : false}
                onClick={() => handleCardClick(card)}
              />
            </div>
          );
        })}
      </div>

      {/* Fan Helper Tooltip (compact on mobile) */}
      <div className="text-[9px] sm:text-[10px] text-amber-300/80 font-outfit mt-0.5 text-center px-2 truncate max-w-md">
        {isBidding
          ? 'Bidding Phase: Examine your hand to select your bid'
          : isMyTurn
          ? 'Your Turn: Tap card to select, tap again or click Play'
          : 'Waiting for other players...'}
      </div>
    </div>
  );
};
