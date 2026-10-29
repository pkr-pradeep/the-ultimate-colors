import React from 'react';
import { Card, PlayerId, TrickCard } from '../types/game';
import { CardView } from './CardView';

interface CenterTrickProps {
  currentTrick: TrickCard[];
  players: Record<PlayerId, { name: string }>;
  winningPlayerId?: PlayerId | null;
  trumpCard?: Card | null;
}

// Circular/Round offsets corresponding to the 4 player positions seated around the table:
// South (bottom), West (left), North (top), East (right)
const ROUND_OFFSETS: Record<
  PlayerId,
  {
    mobile: { x: number; y: number; rotate: number };
    desktop: { x: number; y: number; rotate: number };
  }
> = {
  north: {
    mobile: { x: 0, y: -24, rotate: 2 },
    desktop: { x: 0, y: -34, rotate: 2 },
  },
  south: {
    mobile: { x: 0, y: 22, rotate: -2 },
    desktop: { x: 0, y: 32, rotate: -2 },
  },
  west: {
    mobile: { x: -32, y: -2, rotate: -8 },
    desktop: { x: -48, y: -2, rotate: -9 },
  },
  east: {
    mobile: { x: 32, y: -2, rotate: 8 },
    desktop: { x: 48, y: -2, rotate: 9 },
  },
};

export const CenterTrick: React.FC<CenterTrickProps> = ({
  currentTrick,
  players,
  winningPlayerId,
  trumpCard,
}) => {
  const leadCard = currentTrick.length > 0 ? currentTrick[0].card : null;

  return (
    <div className="relative w-72 h-44 sm:w-110 sm:h-64 flex items-center justify-center select-none">
      {/* ================= ROUND FELT ARENA (CARDS FALL IN THIS ROUND) ================= */}
      <div className="absolute w-36 h-36 sm:w-56 sm:h-56 rounded-full border-2 border-amber-600/30 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.14)_0%,rgba(146,64,14,0.06)_55%,transparent_85%)] pointer-events-none shadow-[inset_0_0_24px_rgba(10,5,2,0.85)] flex items-center justify-center">
        {/* Subtle decorative inner compass ring */}
        <div className="w-28 h-28 sm:w-44 sm:h-44 rounded-full border border-amber-500/15 pointer-events-none" />

        {/* Empty Trick subtle cue */}
        {currentTrick.length === 0 && (
          <div className="absolute text-center pointer-events-none opacity-45 select-none">
            <div className="font-script text-xl sm:text-3xl text-[#E5D7C3] tracking-wider">
              Center Table
            </div>
            <div className="text-[10px] sm:text-xs text-amber-200/70 font-outfit mt-0.5">
              Awaiting trick lead...
            </div>
          </div>
        )}
      </div>

      {/* Live Trick Lead & Winner Pill Banner */}
      {leadCard && (
        <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-neutral-950/95 border border-amber-500/70 shadow-xl text-[10px] sm:text-xs whitespace-nowrap animate-fade-in">
          <span className="text-amber-400 font-cinzel font-bold text-[9px] sm:text-[11px] uppercase tracking-wide">
            Lead:
          </span>
          <span className="font-bold text-amber-100 font-mono text-[10px] sm:text-xs">
            {leadCard.isDadajiJoker ? '★ DADAJI (2♠)' : leadCard.shortName}
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

      {/* Render Played Cards in a Round / Circle Formation */}
      <div className="relative flex items-center justify-center w-full h-full">
        {currentTrick.map((play, idx) => {
          const offsets = ROUND_OFFSETS[play.playerId] || {
            mobile: { x: 0, y: 0, rotate: 0 },
            desktop: { x: 0, y: 0, rotate: 0 },
          };
          const isWinner = winningPlayerId === play.playerId;
          const isTrump = trumpCard?.suit ? play.card.suit === trumpCard.suit : false;

          return (
            <div
              key={`${play.playerId}-${play.card.id}`}
              className="absolute animate-card-drop flex flex-col items-center pointer-events-none transition-transform duration-200 ease-out will-change-transform"
              style={{
                zIndex: isWinner ? 45 : 10 + idx * 2,
              }}
            >
              {/* Mobile Round Position */}
              <div
                className="sm:hidden flex flex-col items-center"
                style={{
                  transform: `translate(${offsets.mobile.x}px, ${offsets.mobile.y}px) rotate(${offsets.mobile.rotate}deg)`,
                }}
              >
                {/* High-Contrast Player Name & Played Card Badge */}
                <div
                  className={`flex items-center gap-1 px-1.5 py-0.5 shadow-md mb-0.5 rounded-[3px] border select-none transition-transform ${
                    isWinner
                      ? 'bg-gradient-to-r from-amber-300 to-amber-400 text-neutral-950 border-amber-600 ring-2 ring-amber-400 scale-105 z-20'
                      : 'bg-[#FAF6EC] text-[#1E120A] border-[#CBB89D]/90'
                  }`}
                >
                  <span className="font-script font-bold text-[10px] truncate max-w-[55px]">
                    {players[play.playerId]?.name.split(' ')[0] || play.playerId}
                  </span>
                  <span className="font-mono font-black text-[10px] text-amber-950 pl-0.5 border-l border-amber-900/30">
                    {play.card.shortName}
                  </span>
                  {play.card.isDadajiJoker && (
                    <span className="text-amber-600 font-bold text-[10px]">★</span>
                  )}
                  {isTrump && !play.card.isDadajiJoker && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-0.5" title="Trump Suit Card" />
                  )}
                </div>

                {/* The Played Card */}
                <div
                  className={`transform transition-transform ${
                    isWinner ? 'scale-105 ring-2 ring-amber-400 rounded-lg' : ''
                  }`}
                >
                  <CardView
                    card={play.card}
                    size="sm"
                    isLegal={false}
                    isTrump={isTrump}
                  />
                </div>
              </div>

              {/* Desktop / Tablet Round Position */}
              <div
                className="hidden sm:flex flex-col items-center"
                style={{
                  transform: `translate(${offsets.desktop.x}px, ${offsets.desktop.y}px) rotate(${offsets.desktop.rotate}deg)`,
                }}
              >
                {/* High-Contrast Player Name & Played Card Badge */}
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 shadow-md mb-1 rounded-[3px] border select-none transition-transform ${
                    isWinner
                      ? 'bg-gradient-to-r from-amber-300 to-amber-400 text-neutral-950 border-amber-600 ring-2 ring-amber-400 scale-105 z-20'
                      : 'bg-[#FAF6EC] text-[#1E120A] border-[#CBB89D]/90'
                  }`}
                >
                  <span className="font-script font-bold text-xs truncate max-w-[70px]">
                    {players[play.playerId]?.name.split(' ')[0] || play.playerId}
                  </span>
                  <span className="font-mono font-black text-xs text-amber-950 pl-0.5 border-l border-amber-900/30">
                    {play.card.shortName}
                  </span>
                  {play.card.isDadajiJoker && (
                    <span className="text-amber-600 font-bold text-xs">★</span>
                  )}
                  {isTrump && !play.card.isDadajiJoker && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 ml-0.5" title="Trump Suit Card" />
                  )}
                </div>

                {/* The Played Card */}
                <div
                  className={`transform transition-transform ${
                    isWinner ? 'scale-105 ring-2 ring-amber-400 rounded-xl' : ''
                  }`}
                >
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
