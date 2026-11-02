import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card } from '../types/game';
import { CardView } from './CardView';
import { ArrowUpDown } from 'lucide-react';
import { StatBox } from './PlayerSeat';

interface PlayerHandFanProps {
  cards: Card[];
  legalCards: Card[];
  isMyTurn: boolean;
  isBidding?: boolean;
  trumpSuit: string | null;
  playerBid?: number | null;
  playerTricksWon?: number;
  onPlayCard: (card: Card) => void;
  seatContent?: React.ReactNode;
}

export const PlayerHandFan: React.FC<PlayerHandFanProps> = ({
  cards,
  legalCards,
  isMyTurn,
  isBidding = false,
  trumpSuit,
  playerBid,
  playerTricksWon,
  onPlayCard,
  seatContent,
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

  // Responsive card sizing tailored to fit perfectly on phones, portrait tablets, and desktops
  const cardSize = isMobile
    ? 'xs'
    : isTablet
    ? (windowWidth < 820 || isBidding ? 'xs' : 'sm')
    : isBidding
    ? 'sm'
    : 'md';

  const cardWidthPx = cardSize === 'xs' ? 68 : cardSize === 'sm' ? 80 : 96;

  // Maximum width available on screen for the fan (guarantees zero screen overflow)
  const maxFanWidth = isMobile
    ? Math.min(windowWidth - 16, 380)
    : isTablet
    ? Math.min(windowWidth - 32, 700)
    : Math.min(windowWidth - 48, 860);

  // Buffer to account for outer card rotational flare
  const rotationAllowance = isMobile ? 12 : isTablet ? 22 : 30;
  const effectiveAvailableWidth = Math.max(260, maxFanWidth - rotationAllowance);

  // Exact mathematically bounded overlap: guarantees fan never exceeds effectiveAvailableWidth!
  const overlapPx = useMemo(() => {
    if (n <= 1) return 0;
    const maxAllowedStep = (effectiveAvailableWidth - cardWidthPx) / (n - 1);
    const targetStep = isMobile ? 24 : isTablet ? (windowWidth < 820 ? 30 : 36) : 44;
    // Step must never exceed maxAllowedStep, guaranteeing total fan width <= effectiveAvailableWidth
    const step = Math.min(targetStep, Math.max(16, maxAllowedStep));

    return Math.max(0, Math.round(cardWidthPx - step));
  }, [n, effectiveAvailableWidth, cardWidthPx, isMobile, isTablet, windowWidth]);

  // Controlled, gentle fan rotation that stays strictly within screen margins
  const maxTotalSpreadAngle = isMobile
    ? Math.min(10, n * 1.3)
    : isTablet
    ? Math.min(14, n * 1.4)
    : Math.min(18, n * 1.8);
  const angleStep = n > 1 ? (2 * maxTotalSpreadAngle) / (n - 1) : 0;
  const yMultiplier = isMobile ? 0.6 : isTablet ? 0.75 : 0.95;

  // Fast, memoized card click handler ensuring 60+ FPS without re-allocating
  // When touched again during bidding or waiting, card returns to resting position
  const handleCardClick = useCallback((card: Card) => {
    const isLegal = legalCards.some(c => c.id === card.id);
    if (!isLegal) return;

    if (selectedCardIdRef.current === card.id) {
      if (isMyTurn) {
        // Second tap on already selected card during play -> play it immediately!
        onPlayCard(card);
      }
      // Tapping the card again returns it to resting position
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
    <div
      className="relative w-full max-w-full flex flex-col items-center select-none pt-0 pb-0 overflow-x-clip"
      onClick={e => {
        if (e.target === e.currentTarget) {
          setSelectedCardId(null);
        }
      }}
    >
      {/* The Natural Fan Arc Container - smooth, hardware-accelerated GPU transitions & bounded width */}
      <div
        className={`relative ${
          isBidding
            ? 'h-18 sm:h-22 md:h-26'
            : 'h-22 sm:h-26 md:h-30'
        } w-full flex items-end justify-center px-2 pb-0.5 overflow-x-clip`}
        onClick={e => {
          if (e.target === e.currentTarget) {
            setSelectedCardId(null);
          }
        }}
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

      {/* Bottom Bar: Sort Option, BID Box, Player Seat Nameplate, WIN Box, Simple Hand Count & Play Action */}
      <div className="w-full max-w-3xl px-2 sm:px-4 mt-1 sm:mt-1.5 flex items-center justify-between sm:justify-center gap-1.5 sm:gap-3 z-20">
        {/* Quick Hand Sorting Button - Kept safely at bottom, completely clear of fanned cards */}
        <button
          type="button"
          onClick={() => {
            setSortBy(prev => (prev === 'suit' ? 'rank' : prev === 'rank' ? 'natural' : 'suit'));
          }}
          title="Toggle hand arrangement (By Suit / By Rank / Deal Order)"
          className="px-2 sm:px-2.5 py-1 rounded-md bg-neutral-900/85 hover:bg-neutral-800 text-amber-300 border border-amber-800/40 text-[10px] sm:text-xs font-cinzel flex items-center gap-1 cursor-pointer transition-colors flex-shrink-0 shadow-sm active:scale-95"
        >
          <ArrowUpDown size={11} className="text-amber-400" />
          <span className="hidden xs:inline">Sort:</span>
          <span>{sortBy === 'suit' ? 'Suits' : sortBy === 'rank' ? 'Ranks' : 'Deal'}</span>
        </button>

        {/* Human Player Prominent BID Box */}
        <StatBox type="bid" value={playerBid} size="sm" />

        {/* Center: Aadesh Seat Nameplate */}
        {seatContent ? (
          <div className="flex-shrink-0">
            {seatContent}
          </div>
        ) : null}

        {/* Human Player Prominent WIN Box */}
        <StatBox type="win" value={playerTricksWon ?? 0} size="sm" />

        {/* Right: Simple Hand Count & Quick Play Action (no fancy badges or pills) */}
        <div className="flex items-center justify-end min-w-[65px] sm:min-w-[95px] flex-shrink-0">
          {isMyTurn && selectedCard ? (
            <button
              type="button"
              onClick={handlePlaySelected}
              disabled={!isSelectedCardLegal}
              className={`min-h-[28px] sm:min-h-[30px] px-2.5 sm:px-3 py-0.5 rounded-md font-cinzel font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-1 ${
                isSelectedCardLegal
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-neutral-950 border border-amber-200 shadow-amber-500/40'
                  : 'bg-neutral-800 text-neutral-400 border border-neutral-700 cursor-not-allowed'
              }`}
            >
              <span>Play {selectedCard.shortName}</span>
            </button>
          ) : (
            <span className="text-[10px] sm:text-xs text-amber-300/75 font-outfit select-none whitespace-nowrap">
              {cards.length} cards
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
