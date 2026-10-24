import React from 'react';
import { Player } from '../types/game';
import { CardBack } from './CardBack';

interface PlayerSeatProps {
  player: Player;
  position: 'top' | 'bottom' | 'left' | 'right';
  isCurrentTurn: boolean;
  isDealer: boolean;
  teamScore?: number;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  position,
  isCurrentTurn,
  isDealer,
  teamScore,
}) => {
  const cardCount = player.hand.length;

  // Nameplate component matching the exact calligraphic ivory strip from the reference photo
  const renderNameplate = (extraClass = '') => (
    <div
      className={`relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-0.5 sm:py-1 bg-[#FAF6EC] text-[#1A1009] border border-[#C5B499]/80 shadow-[0_4px_10px_rgba(0,0,0,0.35)] rounded-[2px] select-none transition-all duration-300 ${
        isCurrentTurn
          ? 'ring-2 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
          : ''
      } ${extraClass}`}
    >
      {/* Dealer Coin Token */}
      {isDealer && (
        <span
          title="Dealer (Rotates Counter-Clockwise)"
          className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border border-amber-200 text-neutral-950 font-cinzel font-black text-[8px] sm:text-[9px] flex items-center justify-center shadow-xs flex-shrink-0"
        >
          D
        </span>
      )}

      {/* Script Name */}
      <span className="font-script text-base sm:text-2xl font-bold tracking-wide whitespace-nowrap">
        {player.name}
      </span>

      {/* Discreet Game Info (Bid / Won) */}
      <span className="text-[9px] sm:text-[10px] font-outfit text-amber-950/70 border-l border-amber-800/20 pl-1.5 sm:pl-2 whitespace-nowrap">
        B:{player.bid !== null ? player.bid : '—'} · W:{player.tricksWon}
      </span>
    </div>
  );

  // Compact Mobile Token for West & East side players on phone viewports (< 640px)
  const renderMobileSideToken = () => (
    <div
      className={`sm:hidden relative flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-lg bg-[#FAF6EC] text-[#1A1009] border border-[#C5B499]/90 shadow-[0_4px_10px_rgba(0,0,0,0.4)] transition-all duration-300 ${
        isCurrentTurn
          ? 'ring-2 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)] scale-105'
          : ''
      }`}
    >
      {isDealer && (
        <span
          title="Dealer"
          className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border border-amber-200 text-neutral-950 font-cinzel font-black text-[8px] flex items-center justify-center shadow-xs"
        >
          D
        </span>
      )}
      <span className="font-script text-sm font-bold tracking-tight text-center leading-tight">
        {player.name}
      </span>
      <div className="flex flex-col items-center text-[8px] font-mono text-amber-950/80 leading-tight">
        <span>B:{player.bid !== null ? player.bid : '—'}</span>
        <span>W:{player.tricksWon}</span>
      </div>
      {/* Mini 3-card stack with card count */}
      {cardCount > 0 && (
        <div className="relative w-5 h-7 flex items-center justify-center mt-0.5">
          <div className="absolute inset-0 rounded-[2px] bg-[#450A0A] border border-amber-500/50 shadow-xs -rotate-6" />
          <div className="absolute inset-0 rounded-[2px] bg-[#5B0E0E] border border-amber-500/50 shadow-xs rotate-3" />
          <div className="absolute inset-0 rounded-[2px] bg-[#6F1313] border border-amber-400/80 shadow-xs flex items-center justify-center">
            <span className="text-[8px] font-bold text-amber-200 font-mono">{cardCount}</span>
          </div>
        </div>
      )}
    </div>
  );

  // TOP SEAT: Hriday
  if (position === 'top') {
    return (
      <div className="flex flex-col items-center gap-0.5 sm:gap-1 select-none flex-shrink-0">
        {/* Hriday Nameplate */}
        {renderNameplate()}

        {/* 13 Face-Down Cards in a Downward Bridge Arc (responsive scaling) */}
        {cardCount > 0 && (
          <div className="relative flex items-center justify-center -space-x-4 sm:-space-x-5 pt-0.5 pb-0.5">
            {Array.from({ length: cardCount }).map((_, i) => {
              const centerIdx = (cardCount - 1) / 2;
              const norm = i - centerIdx;
              const rot = norm * 2.5;
              const yOffset = Math.pow(Math.abs(norm), 1.4) * 0.9;

              return (
                <div
                  key={i}
                  style={{
                    transform: `rotate(${rot}deg) translateY(${yOffset}px)`,
                    zIndex: i + 1,
                  }}
                  className="transform origin-top transition-transform"
                >
                  <div className="sm:hidden">
                    <CardBack width={22} height={32} />
                  </div>
                  <div className="hidden sm:block">
                    <CardBack width={28} height={40} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // LEFT SEAT: Shilaa
  if (position === 'left') {
    return (
      <div className="relative flex items-center justify-center select-none w-auto sm:w-28 md:w-32 min-h-0 flex-shrink-0">
        {/* Compact Token on Mobile (< 640px) */}
        {renderMobileSideToken()}

        {/* Full Desktop / Tablet View (>= 640px) */}
        <div className="hidden sm:flex relative items-center justify-center w-full min-h-0 py-2">
          {/* Shilaa Nameplate Centered Horizontally across the vertical arc */}
          <div className="absolute z-20">
            {renderNameplate()}
          </div>

          {/* Vertical Curved Crescent Arc of Face-Down Cards */}
          {cardCount > 0 && (
            <div className="relative flex flex-col items-center justify-center -space-y-8 sm:-space-y-8.5 z-10 scale-90 sm:scale-95">
              {Array.from({ length: cardCount }).map((_, i) => {
                const centerIdx = (cardCount - 1) / 2;
                const norm = i - centerIdx;
                // Curves outward to the left
                const rot = norm * -3.8;
                const xOffset = -Math.pow(centerIdx - Math.abs(norm), 1.05) * 3;

                return (
                  <div
                    key={i}
                    style={{
                      transform: `translateX(${xOffset}px) rotate(${rot}deg)`,
                      zIndex: i + 1,
                    }}
                    className="transform origin-center transition-transform"
                  >
                    <CardBack width={32} height={46} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // RIGHT SEAT: Mainaa
  if (position === 'right') {
    return (
      <div className="relative flex items-center justify-center select-none w-auto sm:w-28 md:w-32 min-h-0 flex-shrink-0">
        {/* Compact Token on Mobile (< 640px) */}
        {renderMobileSideToken()}

        {/* Full Desktop / Tablet View (>= 640px) */}
        <div className="hidden sm:flex relative items-center justify-center w-full min-h-0 py-2">
          {/* Mainaa Nameplate Centered Horizontally across the vertical arc */}
          <div className="absolute z-20">
            {renderNameplate()}
          </div>

          {/* Vertical Curved Crescent Arc of Face-Down Cards */}
          {cardCount > 0 && (
            <div className="relative flex flex-col items-center justify-center -space-y-8 sm:-space-y-8.5 z-10 scale-90 sm:scale-95">
              {Array.from({ length: cardCount }).map((_, i) => {
                const centerIdx = (cardCount - 1) / 2;
                const norm = i - centerIdx;
                // Curves outward to the right
                const rot = norm * 3.8;
                const xOffset = Math.pow(centerIdx - Math.abs(norm), 1.05) * 3;

                return (
                  <div
                    key={i}
                    style={{
                      transform: `translateX(${xOffset}px) rotate(${rot}deg)`,
                      zIndex: i + 1,
                    }}
                    className="transform origin-center transition-transform"
                  >
                    <CardBack width={32} height={46} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // BOTTOM SEAT: Aadesh (Nameplate centered beneath the fan hand)
  return (
    <div className="flex flex-col items-center select-none pt-0.5">
      {renderNameplate()}
    </div>
  );
};
