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

export interface StatBoxProps {
  type: 'bid' | 'win';
  value: number | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatBox: React.FC<StatBoxProps> = ({
  type,
  value,
  size = 'md',
  className = '',
}) => {
  const isBid = type === 'bid';
  const label = isBid ? 'BID' : 'WIN';
  const displayVal = value !== null && value !== undefined ? value : '—';

  return (
    <div
      title={isBid ? `Contract Bid: ${displayVal}` : `Tricks Won: ${displayVal}`}
      className={`relative flex flex-col items-center justify-center rounded-lg select-none border-2 shadow-lg transition-transform ${
        isBid
          ? 'bg-neutral-950/95 border-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.25)] text-amber-300'
          : 'bg-neutral-950/95 border-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.25)] text-emerald-300'
      } ${
        size === 'sm'
          ? 'w-10 h-10 sm:w-11 sm:h-11'
          : size === 'lg'
          ? 'w-14 h-14 sm:w-16 sm:h-16'
          : 'w-11 h-11 sm:w-13 sm:h-13'
      } ${className}`}
    >
      <span
        className={`font-cinzel font-black uppercase tracking-wider leading-none text-center ${
          isBid ? 'text-amber-400' : 'text-emerald-400'
        } ${size === 'sm' ? 'text-[8px] sm:text-[9px]' : 'text-[9px] sm:text-[10px]'}`}
      >
        {label}
      </span>
      <span
        className={`font-mono font-black leading-none mt-0.5 text-neutral-100 ${
          size === 'sm'
            ? 'text-sm sm:text-base'
            : size === 'lg'
            ? 'text-xl sm:text-2xl'
            : 'text-base sm:text-xl'
        }`}
      >
        {displayVal}
      </span>
    </div>
  );
};

export const PlayerSeat = React.memo<PlayerSeatProps>(({
  player,
  position,
  isCurrentTurn,
  isDealer,
  teamScore,
}) => {
  const cardCount = player.hand.length;

  // Nameplate component matching the calligraphic ivory strip
  const renderNameplate = (extraClass = '') => (
    <div
      className={`relative inline-flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2.5 sm:px-3.5 md:px-5 py-0.5 sm:py-1 bg-[#FAF6EC] text-[#1A1009] border border-[#C5B499]/80 shadow-[0_4px_10px_rgba(0,0,0,0.35)] rounded-[2px] select-none transition-all duration-300 ${
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
      <span className="font-script text-sm sm:text-base md:text-xl font-bold tracking-wide whitespace-nowrap">
        {player.name}
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
      {/* Mini CardBack with card count badge */}
      {cardCount > 0 && (
        <div className="relative w-5 h-7 flex items-center justify-center mt-0.5 shadow-xs">
          <CardBack width={20} height={28} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[8px] font-bold text-amber-950 font-mono bg-amber-200/90 px-1 py-0.2 rounded-xs border border-amber-800/40 shadow-xs">
              {cardCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  // TOP SEAT: Hriday (flanked by large BID box on left and WIN box on right, matching user's red squares)
  if (position === 'top') {
    return (
      <div className="flex flex-col items-center gap-1 select-none flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <StatBox type="bid" value={player.bid} size="md" />
          {renderNameplate()}
          <StatBox type="win" value={player.tricksWon} size="md" />
        </div>

        {/* 13 Face-Down Cards in a Straight Linear Alignment (Matching reference screenshot) */}
        {cardCount > 0 && (
          <div className="relative flex items-center justify-center -space-x-3.5 sm:-space-x-4.5 md:-space-x-5 pt-1 pb-0.5 select-none">
            {Array.from({ length: cardCount }).map((_, i) => (
              <div
                key={i}
                style={{
                  zIndex: i + 1,
                }}
                className="flex-shrink-0 transition-transform shadow-xs hover:z-20"
              >
                <div className="sm:hidden">
                  <CardBack width={26} height={38} />
                </div>
                <div className="hidden sm:block md:hidden">
                  <CardBack width={32} height={46} />
                </div>
                <div className="hidden md:block">
                  <CardBack width={36} height={52} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // LEFT SEAT: Shilaa (large BID box above, WIN box below, matching user's red squares)
  if (position === 'left') {
    return (
      <div className="relative flex flex-col items-center justify-center gap-1 sm:gap-1.5 select-none w-auto sm:w-20 md:w-28 lg:w-32 min-h-0 flex-shrink-0">
        {/* BID Box Above Shilaa */}
        <StatBox type="bid" value={player.bid} size="sm" />

        {/* Compact Token on Mobile (< 640px) */}
        {renderMobileSideToken()}

        {/* Full Desktop / Tablet View (>= 640px) */}
        <div className="hidden sm:flex relative items-center justify-center w-full min-h-0 py-1">
          {/* Shilaa Nameplate Centered Horizontally across the vertical arc */}
          <div className="absolute z-20">
            {renderNameplate()}
          </div>

          {/* Vertical Curved Crescent Arc of Face-Down Cards */}
          {cardCount > 0 && (
            <div className="relative flex flex-col items-center justify-center -space-y-8 sm:-space-y-8.5 z-10 scale-75 sm:scale-80 md:scale-90 lg:scale-95">
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
                    <div className="sm:block md:hidden">
                      <CardBack width={26} height={38} />
                    </div>
                    <div className="hidden md:block">
                      <CardBack width={32} height={46} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* WIN Box Below Shilaa */}
        <StatBox type="win" value={player.tricksWon} size="sm" />
      </div>
    );
  }

  // RIGHT SEAT: Mainaa (large BID box above, WIN box below, matching user's red squares)
  if (position === 'right') {
    return (
      <div className="relative flex flex-col items-center justify-center gap-1 sm:gap-1.5 select-none w-auto sm:w-20 md:w-28 lg:w-32 min-h-0 flex-shrink-0">
        {/* BID Box Above Mainaa */}
        <StatBox type="bid" value={player.bid} size="sm" />

        {/* Compact Token on Mobile (< 640px) */}
        {renderMobileSideToken()}

        {/* Full Desktop / Tablet View (>= 640px) */}
        <div className="hidden sm:flex relative items-center justify-center w-full min-h-0 py-1">
          {/* Mainaa Nameplate Centered Horizontally across the vertical arc */}
          <div className="absolute z-20">
            {renderNameplate()}
          </div>

          {/* Vertical Curved Crescent Arc of Face-Down Cards */}
          {cardCount > 0 && (
            <div className="relative flex flex-col items-center justify-center -space-y-8 sm:-space-y-8.5 z-10 scale-75 sm:scale-80 md:scale-90 lg:scale-95">
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
                    <div className="sm:block md:hidden">
                      <CardBack width={26} height={38} />
                    </div>
                    <div className="hidden md:block">
                      <CardBack width={32} height={46} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* WIN Box Below Mainaa */}
        <StatBox type="win" value={player.tricksWon} size="sm" />
      </div>
    );
  }

  // BOTTOM SEAT: Aadesh (Nameplate centered beneath the fan hand)
  return (
    <div className="flex flex-col items-center select-none pt-0.5">
      {renderNameplate()}
    </div>
  );
});

PlayerSeat.displayName = 'PlayerSeat';
