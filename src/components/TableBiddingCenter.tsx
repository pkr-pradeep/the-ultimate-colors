import React, { useState } from 'react';
import { Card, PlayerId, Suit, TeamId } from '../types/game';
import { CardView } from './CardView';
import { SuitIcon } from './art/SuitIcon';
import { SUIT_NAMES } from '../engine/deck';
import { AlertCircle } from 'lucide-react';

interface TableBiddingCenterProps {
  trumpSuit: Suit | null;
  trumpCard: Card | null;
  isJokerRevealHand: boolean;
  dealerName: string;
  isHumanBiddingTurn: boolean;
  isRevisionMode: boolean;
  currentBidderId?: PlayerId;
  currentBidderName?: string;
  hand: Card[];
  suggestedBid: number;
  partnerName: string;
  partnerBid: number | null;
  players: Record<PlayerId, { name: string; bid: number | null; teamId: TeamId; isHuman: boolean }>;
  onSelectBid: (bid: number) => void;
}

export const TableBiddingCenter: React.FC<TableBiddingCenterProps> = ({
  trumpSuit,
  trumpCard,
  isJokerRevealHand,
  dealerName,
  isHumanBiddingTurn,
  isRevisionMode,
  currentBidderName,
  hand,
  suggestedBid,
  partnerName,
  partnerBid,
  players,
  onSelectBid,
}) => {
  const [selectedBid, setSelectedBid] = useState<number>(suggestedBid);

  // Analyze player's hand insights
  const trumpCount =
    trumpSuit && !isJokerRevealHand
      ? hand.filter(c => c.suit === trumpSuit).length
      : 0;
  const hasDadaji = hand.some(c => c.isDadajiJoker);
  const aceCount = hand.filter(c => c.rank === 'A').length;
  const kingCount = hand.filter(c => c.rank === 'K').length;

  // Partnership combined bid preview
  const estimatedCombinedBid = selectedBid + (partnerBid ?? 0);
  const isCombinedValid = partnerBid === null || estimatedCombinedBid >= 2;

  return (
    <div className="relative w-full max-w-xl mx-auto my-auto animate-fade-in select-none">
      {/* Tabletop Wooden Felt Mat Container - guaranteed to fit within tablet & mobile landscape */}
      <div className="relative bg-gradient-to-b from-[#2B150C]/95 via-[#1C0D07]/95 to-[#120703]/95 border-2 border-amber-600/70 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-md max-h-[min(370px,calc(100dvh-200px))] sm:max-h-[min(400px,calc(100dvh-220px))] overflow-y-auto">
        {/* Ornate Gold Filigree Corners */}
        <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-400/80 rounded-tl pointer-events-none" />
        <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-400/80 rounded-tr pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-400/80 rounded-bl pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400/80 rounded-br pointer-events-none" />

        {/* ================= TOP SECTION: 13TH DEALT CARD (TRUMP DECIDER) ================= */}
        <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-amber-800/40 flex-shrink-0">
          {/* Card Presentation Resting on Table */}
          <div className="flex items-center gap-2 min-w-0">
            {trumpCard && (
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/30 to-yellow-400/20 rounded-md blur-xs" />
                <CardView
                  card={trumpCard}
                  size="xs"
                  isLegal={false}
                  isTrump={true}
                  className="shadow-md ring-1 ring-amber-400/80"
                />
              </div>
            )}

            {/* Plaque Description */}
            <div className="text-left flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1 leading-tight">
                <span className="text-[11px]">👑</span>
                <span className="text-[10px] sm:text-[11px] font-cinzel font-black tracking-wider text-amber-300 uppercase truncate">
                  13th Dealt Card (Trump Decider)
                </span>
                <span className="text-amber-500/60 hidden sm:inline">·</span>
                <span className="text-[9px] sm:text-[10px] text-amber-200/80 font-outfit hidden sm:inline truncate">
                  Dealer: <strong className="text-amber-100">{dealerName}</strong>
                </span>
              </div>

              {/* Trump Decider Banner */}
              <div className="mt-0.5">
                {isJokerRevealHand ? (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-red-950 via-amber-950 to-neutral-950 border border-amber-400/80 shadow-xs">
                    <span className="text-amber-300 font-bold text-xs">★</span>
                    <span className="text-[10px] sm:text-[11px] font-cinzel font-black text-amber-200">
                      UNIVERSAL JOKER REVEALED
                    </span>
                    <span className="text-[9px] text-amber-300/80 font-sans hidden xs:inline">
                      · All suits equal
                    </span>
                  </div>
                ) : trumpSuit ? (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-950/90 to-neutral-950/90 border border-amber-500/70 shadow-xs">
                    <SuitIcon suit={trumpSuit} size={15} showGoldBorder />
                    <span className="text-[10px] sm:text-[11px] font-cinzel font-black text-amber-200 uppercase tracking-wide">
                      Trump: {SUIT_NAMES[trumpSuit]}
                    </span>
                    {trumpCard && (
                      <span className="text-[9px] font-mono text-amber-300 bg-amber-950/80 px-1 rounded border border-amber-800/40">
                        {trumpCard.shortName}
                      </span>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Persistent Rules Note */}
          <div className="hidden sm:flex flex-col items-end text-right flex-shrink-0">
            <span className="px-2 py-0.5 rounded-full bg-amber-900/40 border border-amber-700/40 text-[9px] font-cinzel text-amber-300 uppercase tracking-wider">
              Bidding Active
            </span>
            <span className="text-[8px] text-amber-400/60 font-outfit mt-0.5">
              Rotates Counter-Clockwise
            </span>
          </div>
        </div>

        {/* ================= MIDDLE / BOTTOM SECTION: BIDDING INTERACTION ================= */}
        {isHumanBiddingTurn ? (
          /* Human Player Bidding Console */
          <div className="flex flex-col gap-1.5">
            {/* Revision Notice Banner */}
            {isRevisionMode && (
              <div className="p-1.5 rounded-lg bg-rose-950/90 border border-rose-500 text-rose-200 text-[11px] flex items-center gap-2 text-left animate-pulse">
                <AlertCircle size={14} className="text-rose-400 flex-shrink-0" />
                <div>
                  <strong>Partnership Minimum Required:</strong> Combined team bid was under 2 tricks. Please revise your bid.
                </div>
              </div>
            )}

            {/* Hand Insights & Table Declared Bids Summary (Compact 2-col or unified bar) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] font-outfit">
              {/* Hand Overview */}
              <div className="py-1 px-2 rounded-lg bg-neutral-900/85 border border-amber-900/40 text-left flex items-center justify-between">
                <span className="font-cinzel text-amber-300 font-bold text-[9px] sm:text-[10px]">
                  Hand:
                </span>
                <div className="flex items-center gap-1.5 text-amber-200/90 text-[10px]">
                  {!isJokerRevealHand && (
                    <span>
                      Trumps: <strong className="text-amber-300 font-mono">{trumpCount}</strong>
                    </span>
                  )}
                  <span>
                    Aces: <strong className="text-amber-300 font-mono">{aceCount}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Kings: <strong className="text-amber-300 font-mono">{kingCount}</strong>
                  </span>
                  {hasDadaji && (
                    <span className="text-amber-400 font-semibold">
                      ★ Joker
                    </span>
                  )}
                </div>
              </div>

              {/* Table Declared Bids */}
              <div className="py-1 px-2 rounded-lg bg-neutral-900/85 border border-amber-900/40 text-left flex items-center justify-between">
                <span className="font-cinzel text-amber-300 font-bold text-[9px] sm:text-[10px]">
                  Bids:
                </span>
                <div className="flex items-center gap-2 text-[10px] text-amber-200">
                  {Object.entries(players).map(([pid, p]) => (
                    <span key={pid} className="truncate">
                      <span className="text-amber-400/80 text-[9px]">
                        {p.name.split(' ')[0]}:
                      </span>{' '}
                      <strong className="font-mono text-amber-100 font-bold">
                        {p.bid !== null ? p.bid : '...'}
                      </strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Partnership Total Check */}
            {partnerBid !== null && (
              <div className="py-0.5 px-2 rounded-lg bg-neutral-900/90 border border-amber-700/50 flex items-center justify-between text-[11px] font-outfit">
                <span className="text-amber-300">
                  Team 1: You ({selectedBid}) + {partnerName} ({partnerBid}) =
                </span>
                <span
                  className={`font-mono font-bold text-xs ${
                    isCombinedValid ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {estimatedCombinedBid} Tricks {isCombinedValid ? '✓ Valid' : '⚠ (< 2 Min)'}
                </span>
              </div>
            )}

            {/* 0 to 13 Bid Selector Buttons */}
            <div>
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-cinzel text-amber-200 mb-0.5 px-0.5">
                <span>Select Your Bid (0–13 tricks):</span>
                <span className="text-[9px] sm:text-[10px] text-amber-400 font-sans">
                  Recommended: <strong className="text-amber-300 font-mono">{suggestedBid}</strong>
                </span>
              </div>

              <div className="grid grid-cols-7 sm:grid-cols-14 gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(bid => {
                  const isSelected = selectedBid === bid;
                  const isRecommended = bid === suggestedBid;

                  return (
                    <button
                      key={bid}
                      type="button"
                      onClick={() => setSelectedBid(bid)}
                      className={`relative h-7 sm:h-8 rounded-lg font-cinzel text-xs sm:text-sm font-bold transition-all cursor-pointer touch-manipulation flex items-center justify-center ${
                        isSelected
                          ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-neutral-950 border border-amber-200 shadow-md scale-105 ring-2 ring-amber-300 z-10'
                          : 'bg-neutral-900/90 hover:bg-neutral-800 text-amber-200 border border-amber-800/40 hover:border-amber-500'
                      }`}
                    >
                      {bid}
                      {isRecommended && (
                        <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[7px] bg-emerald-600 text-white font-sans px-0.5 rounded-xs leading-none">
                          ★
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Bid Button - always visible & never hidden */}
            <button
              type="button"
              onClick={() => onSelectBid(selectedBid)}
              className="w-full h-8 sm:h-9 mt-0.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-cinzel font-black text-xs sm:text-sm tracking-wider uppercase rounded-xl border border-amber-200 shadow-lg hover:shadow-amber-500/30 transition-all cursor-pointer touch-manipulation flex items-center justify-center flex-shrink-0"
            >
              Confirm Bid of {selectedBid} {selectedBid === 1 ? 'Trick' : 'Tricks'}
            </button>
          </div>
        ) : (
          /* Waiting for AI Player Bids Display */
          <div className="flex flex-col items-center py-1 text-center">
            {/* Active Bidder Pulse Indicator */}
            <div className="flex items-center gap-1.5 mb-1.5 px-3 py-0.5 rounded-full bg-amber-950/60 border border-amber-700/50">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-[11px] sm:text-xs font-cinzel font-bold text-amber-200">
                {currentBidderName ? `${currentBidderName} is declaring bid...` : 'Bidding in progress...'}
              </span>
            </div>

            {/* Bids Table Status */}
            <div className="w-full max-w-md grid grid-cols-4 gap-1.5 my-1 text-center">
              {Object.entries(players).map(([pid, p]) => (
                <div
                  key={pid}
                  className={`py-1 px-1.5 rounded-lg border transition-all ${
                    p.bid !== null
                      ? 'bg-neutral-900/90 border-amber-600/60 text-amber-200'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="text-[9px] sm:text-[10px] font-cinzel font-bold truncate">
                    {p.name.split(' ')[0]}
                  </div>
                  <div className="text-[8px] text-amber-400/60">
                    {p.isHuman ? 'You' : p.teamId === 'team1' ? 'Partner' : 'Opponent'}
                  </div>
                  <div className="mt-0.5 font-mono font-bold text-xs sm:text-sm">
                    {p.bid !== null ? (
                      <span className="text-amber-300">{p.bid}</span>
                    ) : (
                      <span className="text-neutral-500 animate-pulse">···</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[9px] text-amber-400/70 font-outfit mt-0.5">
              Examine your hand cards below while bids are being placed. Trick play begins once all bids are set.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
