import React from 'react';
import { Card, PlayerId, TrickCard } from '../types/game';
import { CardView } from './CardView';

interface CenterTrickProps {
  currentTrick: TrickCard[];
  players: Record<PlayerId, { name: string }>;
  winningPlayerId?: PlayerId | null;
  trumpCard?: Card | null;
}

export const CenterTrick: React.FC<CenterTrickProps> = ({
  currentTrick,
  players,
  winningPlayerId,
  trumpCard,
}) => {
  // Balanced horizontal distribution across the wooden table with clear spacing
  const cardLayoutOffsets = [
    { x: -70, y: -2, rotate: -3 },
    { x: -24, y: 1, rotate: 0 },
    { x: 24, y: -1, rotate: 1 },
    { x: 70, y: 2, rotate: 3 },
  ];

  const leadCard = currentTrick.length > 0 ? currentTrick[0].card : null;

  return (
    <div className="relative w-72 h-36 sm:w-110 sm:h-56 flex items-center justify-center select-none">
      {/* Empty Trick subtle cue */}
      {currentTrick.length === 0 && (
        <div className="text-center pointer-events-none opacity-40 select-none">
          <div className="font-script text-xl sm:text-3xl text-[#E5D7C3] tracking-wider">
            Center Table
          </div>
          <div className="text-[10px] sm:text-xs text-amber-200/70 font-outfit mt-0.5">
            Awaiting trick lead...
          </div>
        </div>
      )}

      {/* Live Trick Lead & Winner Pill Banner */}
      {leadCard && (
        <div className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-neutral-950/95 border border-amber-500/70 shadow-lg text-[10px] sm:text-xs whitespace-nowrap animate-fade-in">
          <span className="text-amber-400 font-cinzel font-bold text-[9px] sm:text-[11px] uppercase tracking-wide">
            Lead:
          </span>
          <span className="font-bold text-amber-100 font-mono text-[10px] sm:text-xs">
            {leadCard.isDadajiJoker ? '★ DADAJI' : leadCard.shortName}
          </span>
          {winningPlayerId && (
            <>
              <span className="text-amber-500">·</span>
              <span className="text-amber-300 font-cinzel font-bold text-[9px] sm:text-[11px]">
                Taking:
              </span>
              <span className="text-amber-100 font-bold font-script text-xs sm:text-sm">
                {players[winningPlayerId]?.name.split(' ')[0]}
              </span>
            </>
          )}
        </div>
      )}

      {/* Render Played Cards horizontally overlapping on the wood table */}
      <div className="relative flex items-center justify-center">
        {currentTrick.map((play, idx) => {
          const layout = cardLayoutOffsets[idx] || { x: 0, y: 0, rotate: 0 };
          const isWinner = winningPlayerId === play.playerId;
          const isTrump = trumpCard?.suit ? play.card.suit === trumpCard.suit : false;

          return (
            <div
              key={`${play.playerId}-${play.card.id}`}
              style={{
                transform: `translateX(${layout.x}px) translateY(${layout.y}px) rotate(${layout.rotate}deg)`,
                zIndex: isWinner ? 35 : idx + 10,
              }}
              className="absolute transition-[transform,opacity] duration-200 ease-out will-change-transform flex flex-col items-center"
            >
              {/* High-Contrast Player Name & Played Card Badge */}
              <div
                className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 shadow-md mb-0.5 sm:mb-1 rounded-[3px] border select-none transition-transform ${
                  isWinner
                    ? 'bg-gradient-to-r from-amber-300 to-amber-400 text-neutral-950 border-amber-600 ring-2 ring-amber-400 scale-105 z-20'
                    : 'bg-[#FAF6EC] text-[#1E120A] border-[#CBB89D]/90'
                }`}
              >
                <span className="font-script font-bold text-[10px] sm:text-xs truncate max-w-[55px] sm:max-w-none">
                  {players[play.playerId]?.name.split(' ')[0] || play.playerId}
                </span>
                <span className="font-mono font-black text-[10px] sm:text-xs text-amber-950 pl-0.5 border-l border-amber-900/30">
                  {play.card.shortName}
                </span>
                {play.card.isDadajiJoker && (
                  <span className="text-amber-600 font-bold text-[10px]">★</span>
                )}
                {isTrump && !play.card.isDadajiJoker && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-0.5" title="Trump Suit Card" />
                )}
              </div>

              {/* The Played Card (sm on phone, md on tablet/desktop) */}
              <div
                className={`transform transition-transform ${
                  isWinner ? 'scale-105 ring-2 ring-amber-400 rounded-lg sm:rounded-xl' : ''
                }`}
              >
                <div className="sm:hidden">
                  <CardView
                    card={play.card}
                    size="sm"
                    isLegal={false}
                    isTrump={isTrump}
                  />
                </div>
                <div className="hidden sm:block">
                  <CardView
                    card={play.card}
                    size="md"
                    isLegal={false}
                    isTrump={isTrump}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
