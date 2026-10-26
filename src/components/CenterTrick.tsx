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
  // Natural slight horizontal offset and rotation mimicking the reference photo center cards
  // In the reference photo, cards lie in a horizontal row overlapping across the center:
  // Card 1 on left, Card 2 in middle, Card 3 on right, Card 4
  const cardLayoutOffsets = [
    { x: -55, y: -2, rotate: -2 },
    { x: -18, y: 1, rotate: 0 },
    { x: 20, y: -1, rotate: 1 },
    { x: 58, y: 2, rotate: 3 },
  ];

  return (
    <div className="relative w-60 h-32 sm:w-96 sm:h-52 flex items-center justify-center select-none">
      {/* Empty Trick subtle cue */}
      {currentTrick.length === 0 && (
        <div className="text-center pointer-events-none opacity-30 select-none">
          <div className="font-script text-xl sm:text-2xl text-[#E5D7C3] tracking-wider">
            Center Table
          </div>
          <div className="text-[9px] sm:text-[10px] text-amber-200/60 font-outfit">
            Awaiting trick lead
          </div>
        </div>
      )}

      {/* Render Played Cards horizontally overlapping on the wood table */}
      <div className="relative flex items-center justify-center">
        {currentTrick.map((play, idx) => {
          const layout = cardLayoutOffsets[idx] || { x: 0, y: 0, rotate: 0 };
          const isWinner = winningPlayerId === play.playerId;

          return (
            <div
              key={`${play.playerId}-${play.card.id}`}
              style={{
                transform: `translateX(${layout.x}px) translateY(${layout.y}px) rotate(${layout.rotate}deg)`,
                zIndex: isWinner ? 30 : idx + 5,
              }}
              className="absolute transition-all duration-300 flex flex-col items-center"
            >
              {/* Player Name Pill */}
              <span
                className={`text-[8px] sm:text-[9px] font-script font-bold px-1.5 sm:px-2 py-0.5 shadow-md mb-0.5 sm:mb-1 rounded-[2px] border ${
                  isWinner
                    ? 'bg-amber-300 text-neutral-950 border-amber-500 ring-2 ring-amber-400'
                    : 'bg-[#FAF6EC] text-[#1E120A] border-[#CBB89D]/70'
                }`}
              >
                {players[play.playerId]?.name || play.playerId}
              </span>

              {/* The Played Card (xs on phone, sm on tablet/desktop) */}
              <div
                className={`transform transition-all ${
                  isWinner ? 'scale-105 filter drop-shadow-[0_0_15px_rgba(245,158,11,0.7)]' : 'shadow-xl'
                }`}
              >
                <div className="sm:hidden">
                  <CardView
                    card={play.card}
                    size="xs"
                    isLegal={false}
                    isTrump={trumpCard?.suit ? play.card.suit === trumpCard.suit : false}
                  />
                </div>
                <div className="hidden sm:block">
                  <CardView
                    card={play.card}
                    size="sm"
                    isLegal={false}
                    isTrump={trumpCard?.suit ? play.card.suit === trumpCard.suit : false}
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
