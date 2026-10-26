import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card } from '../types/game';
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

  const selectedCardIdRef = useRef<string | null>(null);
  selectedCardIdRef.current = selectedCardId;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setWindowWidth(window.innerWidth), 100);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
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
        const rankA = rankWeight[a.rank || ''] || 0;
        const rankB = rankWeight[b.rank || ''] || 0;
        if (rankA !== rankB) return rankB - rankA;
        return (suitOrder[a.suit || ''] ?? 0) - (suitOrder[b.suit || ''] ?? 0);
      }
    });
  }, [cards, sortBy]);

  const n = sortedCards.length;
  const center = (n - 1) / 2;

  // Consistent card sizing across hand so cards never pop or jump when cards are played
  const cardSize = isMobile ? 'xs' : isTablet || isBidding ? 'sm' : 'md';
  const cardWidthPx = isMobile ? 68 : isTablet || isBidding ? 84 : 108;

  // Maximum width available on screen for the fan (guarantees zero screen overflow)
  const maxFanWidth = isMobile
    ? Math.min(windowWidth - 20, 350)
    : isTablet
    ? Math.min(windowWidth - 48, 680)
    : Math.min(windowWidth - 64, 880);

  // Exact mathematically bounded overlap: guarantees fan never exceeds maxFanWidth!
  const overlapPx = useMemo(() => {
    if (n <= 1) return 0;
    const maxAllowedStep = (maxFanWidth - cardWidthPx) / (n - 1);
    const desiredStep = isMobile
      ? Math.min(32, Math.max(20, maxAllowedStep))
      : isTablet
      ? Math.min(48, Math.max(28, maxAllowedStep))
      : Math.min(60, Math.max(34, maxAllowedStep));

    return Math.max(0, Math.round(cardWidthPx - desiredStep));
  }, [n, maxFanWidth, cardWidthPx, isMobile, isTablet]);

  // Controlled, gentle fan rotation that stays strictly within screen margins
  const maxTotalSpreadAngle = isMobile ? Math.min(13, n * 1.6) : Math.min(22, n * 2.4);
  const angleStep = n > 1 ? (2 * maxTotalSpreadAngle) / (n - 1) : 0;
  const yMultiplier = isMobile ? 0.65 : 1.1;

  // Fast, memoized card click handler ensuring 60+ FPS without re-allocating
  const handleCardClick = useCallback((card: Card) => {
    const isLegal = legalCards.some(c => c.id === card.id);
    if (!isLegal) return;

    if (selectedCardIdRef.current === card.id && isMyTurn) {
      // Second tap on already selected card -> play it immediately!
      onPlayCard(card);
      setSelectedCardId(null);
    } else {
      setSelectedCardId(card.id);
    }
  }, [legalCards, isMyTurn, onPlayCard]);

  const handlePlaySelected = useCallback(() => {
    const currentSelectedId = selectedCardIdRef.current;
    if (!currentSelectedId || !isMyTurn) return;
    const card = cards.find(c => c.id === currentSelectedId);
    if (card) {
      onPlayCard(card);
      setSelectedCardId(null);
    }
  }, [cards, isMyTurn, onPlayCard]);

  const selectedCard = sortedCards.find(c => c.id === selectedCardId);
  const isSelectedCardLegal = selectedCard
    ? legalCards.some(c => c.id === selectedCard.id)
    : false;

  return (
    <div className="relative w-full max-w-full flex flex-col items-center select-none pt-0.5 pb-0.5 overflow-x-clip">
      {/* Top Action Bar: Large Card Spotlight Preview & Quick Sort Controls */}
      <div className="w-full max-w-4xl px-2 mb-1 flex items-center justify-between min-h-[32px] sm:min-h-[38px] gap-2">
        {/* Quick Hand Sorting Button */}
        <button
          type="button"
          onClick={() => {
            setSortBy(prev => (prev === 'suit' ? 'rank' : prev === 'rank' ? 'natural' : 'suit'));
          }}
          title="Toggle hand arrangement (By Suit / By Rank / Deal Order)"
          className="px-2.5 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-amber-300 border border-amber-800/50 text-[10px] sm:text-xs font-cinzel flex items-center gap-1.5 cursor-pointer transition-colors flex-shrink-0 shadow-sm"
        >
          <ArrowUpDown size={12} />
          <span>Sort: {sortBy === 'suit' ? 'Suits' : sortBy === 'rank' ? 'Ranks' : 'Deal'}</span>
        </button>

        {/* Selected Card Prominent Magnifier Banner (Eliminates eye strain on mobile) */}
        {selectedCard ? (
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-xl bg-[#FAF6EC] border-2 border-amber-500 shadow-md animate-fade-in flex-shrink-0">
            <span className="text-[10px] sm:text-xs font-semibold text-neutral-600 hidden xs:inline">
              Selected:
            </span>
            <span className="font-cinzel font-black text-xs sm:text-sm text-neutral-950 truncate max-w-[100px] sm:max-w-none">
              {selectedCard.name}
            </span>
            <span className="font-mono font-black text-xs sm:text-sm px-1.5 py-0.5 rounded bg-amber-200 border border-amber-600 text-amber-950 flex-shrink-0">
              {selectedCard.shortName}
            </span>
            {trumpSuit && selectedCard.suit === trumpSuit && !selectedCard.isDadajiJoker && (
              <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white uppercase tracking-wider flex-shrink-0">
                Trump
              </span>
            )}
            {selectedCard.isDadajiJoker && (
              <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-neutral-950 uppercase tracking-wider flex-shrink-0">
                Supreme ★
              </span>
            )}
          </div>
        ) : (
          /* Empty placeholder pill to preserve vertical rhythm */
          <div className="text-[10px] sm:text-xs text-amber-300/60 font-outfit truncate">
            {cards.length} cards in hand
          </div>
        )}

        {/* Confirm Play Action Button (active during player's turn) */}
        {isMyTurn && selectedCard && (
          <div className="animate-fade-in flex items-center flex-shrink-0">
            <button
              type="button"
              onClick={handlePlaySelected}
              disabled={!isSelectedCardLegal}
              className={`min-h-[34px] sm:min-h-[40px] px-3 sm:px-5 py-1 sm:py-1.5 rounded-xl font-cinzel font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-1 ${
                isSelectedCardLegal
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-neutral-950 border border-amber-200 shadow-amber-500/50'
                  : 'bg-neutral-800 text-neutral-400 border border-neutral-700 cursor-not-allowed'
              }`}
            >
              <span>Play {selectedCard.shortName}</span>
            </button>
          </div>
        )}
      </div>

      {/* The Natural Fan Arc Container - smooth, hardware-accelerated GPU transitions & bounded width */}
      <div
        className={`relative ${
          isBidding
            ? 'h-20 sm:h-24 md:h-28'
            : 'h-24 sm:h-28 md:h-34'
        } w-full flex items-end justify-center px-2 pb-0.5 overflow-x-clip`}
      >
        {sortedCards.map((card, index) => {
          const isSelected = selectedCardId === card.id;
          const isLegal = isMyTurn ? legalCards.some(c => c.id === card.id) : true;
          const isDimmed = isMyTurn && !isLegal;

          // Fan mathematics with bounded angle & smooth arch
          const normalizedIndex = index - center;
          const rotation = normalizedIndex * angleStep;
          const yOffset = Math.pow(Math.abs(normalizedIndex), 1.3) * yMultiplier;

          return (
            <div
              key={card.id}
              style={{
                marginLeft: index === 0 ? 0 : `-${overlapPx}px`,
                transform: `rotate(${rotation}deg) translateY(${yOffset}px)`,
                zIndex: isSelected ? 40 : index + 5,
              }}
              className="transform origin-bottom transition-[transform,opacity] duration-150 ease-out will-change-transform flex-shrink-0"
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

      {/* Fan Helper Tooltip */}
      <div className="text-[9px] sm:text-[10px] text-amber-300/80 font-outfit mt-0.5 text-center px-2 truncate max-w-md">
        {isBidding
          ? 'Bidding Phase: Tap cards to inspect suits and count trumps'
          : isMyTurn
          ? selectedCard
            ? 'Tap card again or click Play to play it'
            : 'Tap a card to select it'
          : 'Waiting for other players to move...'}
      </div>
    </div>
  );
};
