import React, { useState } from 'react';
import { Card, PlayerId, Suit, TeamId } from '../types/game';
import { SuitIcon } from './art/SuitIcon';
import { SUIT_NAMES } from '../engine/deck';
import { AlertCircle } from 'lucide-react';

interface BiddingModalProps {
  trumpSuit: Suit | null;
  trumpCard: Card | null;
  isJokerRevealHand: boolean;
  hand: Card[];
  suggestedBid: number;
  partnerName: string;
  partnerBid: number | null;
  isRevisionMode: boolean;
  onSelectBid: (bid: number) => void;
  otherPlayersBids: { name: string; bid: number | null; isHuman?: boolean; teamId: TeamId }[];
}

export const BiddingModal: React.FC<BiddingModalProps> = ({
  trumpSuit,
  trumpCard,
  isJokerRevealHand,
  hand,
  suggestedBid,
  partnerName,
  partnerBid,
  isRevisionMode,
  onSelectBid,
  otherPlayersBids,
}) => {
  const [selectedBid, setSelectedBid] = useState<number>(suggestedBid);

  // Analyze player's hand
  const trumpCount = trumpSuit && !isJokerRevealHand
    ? hand.filter(c => c.suit === trumpSuit).length
    : 0;
  const hasDadaji = hand.some(c => c.isDadajiJoker);
  const aceCount = hand.filter(c => c.rank === 'A').length;
  const kingCount = hand.filter(c => c.rank === 'K').length;

  // Partnership combined bid preview
  const estimatedCombinedBid = selectedBid + (partnerBid ?? 0);
  const isCombinedValid = partnerBid === null || estimatedCombinedBid >= 2;

  return (
    <div className="relative z-30 w-full max-w-lg mx-auto my-auto animate-fade-in px-2">
      {/* On-Board Royal Bidding Card Popup */}
      <div className="relative bg-gradient-to-b from-[#2E1810]/95 via-[#1D0F0A]/95 to-[#120704]/95 border-2 border-amber-500/80 rounded-2xl p-4 sm:p-5 shadow-[0_10px_35px_rgba(0,0,0,0.85)] text-center backdrop-blur-sm">
        {/* Top Header Badge */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-800/40">
          <div className="flex items-center gap-1.5">
            <span className="text-base sm:text-lg">👑</span>
            <div className="text-left">
              <h3 className="font-cinzel text-xs sm:text-sm font-black text-amber-200 tracking-wider">
                {isRevisionMode ? 'Partnership Bid Revision' : 'Declare Your Bid'}
              </h3>
              <span className="text-[10px] text-amber-400/80 font-outfit">
                Bids 0–13 accepted · Partnership minimum total is 2 tricks
              </span>
            </div>
          </div>

          {/* Trump Suit Reminder */}
          {isJokerRevealHand ? (
            <div className="px-2.5 py-1 rounded-lg bg-red-950/80 border border-amber-500/60 text-[10px] font-cinzel font-bold text-amber-200">
              No Permanent Trump
            </div>
          ) : trumpSuit ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-950/80 border border-amber-600/60 shadow-xs">
              <SuitIcon suit={trumpSuit} size={15} showGoldBorder />
              <span className="text-[11px] font-cinzel font-bold text-amber-100 uppercase">
                {SUIT_NAMES[trumpSuit]}
              </span>
              {trumpCard && (
                <span className="text-[10px] font-mono text-amber-300">
                  ({trumpCard.shortName})
                </span>
              )}
            </div>
          ) : null}
        </div>

        {/* Revision Warning Banner if active */}
        {isRevisionMode && (
          <div className="p-2 mb-2 rounded-lg bg-rose-950/80 border border-rose-500/70 text-rose-200 text-xs flex items-center gap-2 text-left">
            <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
            <div>
              <strong>Partnership Minimum Required:</strong> Combined bid was under 2 tricks. Please revise so your partnership bids at least 2.
            </div>
          </div>
        )}

        {/* Hand Quick Overview & Other Players' Bids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 text-[11px] font-outfit">
          {/* Hand Strength Summary */}
          <div className="p-2 rounded-lg bg-neutral-900/80 border border-amber-900/40 text-left">
            <div className="text-[10px] font-cinzel text-amber-300 font-semibold mb-1">
              Your Hand Insights:
            </div>
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-amber-200/90 text-[10px]">
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
                <span className="text-amber-400 font-semibold block w-full mt-0.5">
                  ★ Dadaji Universal Joker in hand!
                </span>
              )}
            </div>
          </div>

          {/* Opponent & Partner Declared Bids */}
          <div className="p-2 rounded-lg bg-neutral-900/80 border border-amber-900/40 text-left">
            <div className="text-[10px] font-cinzel text-amber-300 font-semibold mb-1">
              Table Declared Bids:
            </div>
            <div className="flex items-center justify-between text-[10px] text-amber-200">
              {otherPlayersBids.map((p, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-amber-400/70 text-[9px] truncate max-w-[60px]">
                    {p.name.split(' ')[0]}
                    {p.teamId === 'team1' && ' (Partner)'}
                  </span>
                  <span className="font-mono font-bold text-amber-200">
                    {p.bid !== null ? p.bid : '...'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Partnership Total Preview */}
        {partnerBid !== null && (
          <div className="py-1 px-2.5 rounded-lg bg-neutral-900/90 border border-amber-700/50 mb-2 flex items-center justify-between text-xs font-outfit">
            <span className="text-amber-300">
              Team 1 Total: You ({selectedBid}) + {partnerName} ({partnerBid}) =
            </span>
            <span
              className={`font-mono font-bold text-sm ${
                isCombinedValid ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {estimatedCombinedBid} Tricks {isCombinedValid ? '✓ (Valid)' : '⚠ (< 2 Min)'}
            </span>
          </div>
        )}

        {/* Bid Button Selector (0 through 13) */}
        <div className="mt-2 mb-3">
          <div className="flex items-center justify-between text-[11px] font-cinzel text-amber-200 mb-1.5 px-0.5">
            <span>Select Individual Bid (0–13):</span>
            <span className="text-[10px] text-amber-400 font-sans">
              Recommended: <strong className="text-amber-300">{suggestedBid}</strong>
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
                  className={`relative py-1.5 sm:py-2 rounded-lg font-cinzel text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-neutral-950 border border-amber-200 shadow-md scale-105 ring-1 ring-amber-300'
                      : 'bg-neutral-900/90 hover:bg-neutral-800 text-amber-200 border border-amber-800/40 hover:border-amber-600'
                  }`}
                >
                  {bid}
                  {isRecommended && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[6px] bg-emerald-600 text-white font-sans px-0.5 rounded-xs">
                      ★
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Confirm Bid Button */}
        <button
          type="button"
          onClick={() => onSelectBid(selectedBid)}
          className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-cinzel font-bold text-xs sm:text-sm tracking-wider uppercase rounded-xl border border-amber-200 shadow-lg hover:shadow-amber-500/30 transition-all cursor-pointer"
        >
          Confirm Bid of {selectedBid} {selectedBid === 1 ? 'Trick' : 'Tricks'}
        </button>
      </div>
    </div>
  );
};
