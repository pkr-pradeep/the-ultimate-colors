import React, { useState, useEffect } from 'react';
import { Card, PlayerId, Suit, TeamId } from '../types/game';
import { CardView } from './CardView';
import { SuitIcon } from './art/SuitIcon';
import { getSuitDisplayName } from '../engine/deck';
import { AlertCircle } from 'lucide-react';
import { RulebookLanguage } from '../utils/firstTimeUser';

interface TableBiddingCenterProps {
  trumpSuit: Suit | null;
  trumpCard: Card | null;
  isJokerRevealHand: boolean;
  dealerName: string;
  isHumanBiddingTurn: boolean;
  isRevisionMode: boolean;
  currentBidderId?: PlayerId;
  currentBidderName?: string;
  reshuffleReason?: string | null;
  hand: Card[];
  suggestedBid: number;
  partnerName: string;
  partnerBid: number | null;
  players: Record<PlayerId, { name: string; bid: number | null; teamId: TeamId; isHuman: boolean }>;
  onSelectBid: (bid: number) => void;
  language?: RulebookLanguage;
}

const BIDDING_LOCALES = {
  en: {
    dealer: 'Dealer',
    trumpColor: 'Trump Color',
    universalJoker: 'Universal Joker (All colors equal)',
    declaredBids: 'Declared Bids',
    yourBid: 'Your Bid',
    suggested: 'Suggested',
    selectToConfirm: 'Select a Bid to Confirm',
    teamMin: 'Team Minimum 2 Tricks Required',
    confirmBid: 'Confirm Bid of',
    trickSingular: 'Trick',
    tricksPlural: 'Tricks',
    team1: 'Team 1',
    you: 'You',
    valid: 'Valid',
    minRequired: 'Combined team bid was under 2 tricks. Please revise.',
    waitingBids: 'is declaring bid...',
    biddingProgress: 'Bidding in progress...',
    inspectNote: 'Examine your hand cards below while bids are being placed.',
  },
  or: {
    dealer: 'ଡିଲର୍',
    trumpColor: 'ଟ୍ରମ୍ପ୍ ରଙ୍ଗ',
    universalJoker: 'ସାର୍ବଜନୀନ ଜୋକର୍ (ସମସ୍ତ ରଙ୍ଗ ସମାନ)',
    declaredBids: 'ଘୋଷିତ ଡାକ',
    yourBid: 'ଆପଣଙ୍କ ଡାକ',
    suggested: 'ପରାମର୍ଶିତ',
    selectToConfirm: 'ନିଶ୍ଚିତ କରିବାକୁ ଡାକ ବାଛନ୍ତୁ',
    teamMin: 'ଦଳ ପାଇଁ ଅତି କମରେ ୨ ରାଉଣ୍ଡ ଆବଶ୍ୟକ',
    confirmBid: 'ନିଶ୍ଚିତ କରନ୍ତୁ ଡାକ',
    trickSingular: 'ରାଉଣ୍ଡ',
    tricksPlural: 'ରାଉଣ୍ଡ',
    team1: 'ଦଳ ୧',
    you: 'ଆପଣ',
    valid: 'ଠିକ୍',
    minRequired: 'ଦଳର ମୋଟ ଡାକ ୨ ରୁ କମ୍ ଥିଲା। ଦୟାକରି ସଂଶୋଧନ କରନ୍ତୁ।',
    waitingBids: 'ଡାକ ଘୋଷଣା କରୁଛନ୍ତି...',
    biddingProgress: 'ଡାକ ପ୍ରକ୍ରିୟା ଚାଲିଛି...',
    inspectNote: 'ଡାକ ଚାଲିଥିବା ସମୟରେ ତଳେ ଥିବା ଆପଣଙ୍କ ହାତ ତାସ୍ ଦେଖନ୍ତୁ।',
  },
  hi: {
    dealer: 'डीलर',
    trumpColor: 'ट्रम्प रंग',
    universalJoker: 'सार्वभौमिक जोकर (सभी रंग बराबर)',
    declaredBids: 'घोषित बोलियां',
    yourBid: 'आपकी बोली',
    suggested: 'अनुशंसित',
    selectToConfirm: 'पुष्टि करने के लिए बोली चुनें',
    teamMin: 'टीम के लिए न्यूनतम 2 ट्रिक्स आवश्यक',
    confirmBid: 'पुष्टि करें बोली',
    trickSingular: 'ट्रिक',
    tricksPlural: 'ट्रिक्स',
    team1: 'टीम 1',
    you: 'आप',
    valid: 'वैध',
    minRequired: 'टीम की कुल बोली 2 से कम थी। कृपया संशोधित करें।',
    waitingBids: 'बोली लगा रहे हैं...',
    biddingProgress: 'बोली प्रगति पर है...',
    inspectNote: 'बोली के दौरान नीचे अपने हाथ के पत्ते देखें।',
  },
};

export const TableBiddingCenter = React.memo<TableBiddingCenterProps>(({
  trumpSuit,
  trumpCard,
  isJokerRevealHand,
  dealerName,
  isHumanBiddingTurn,
  isRevisionMode,
  currentBidderName,
  reshuffleReason,
  suggestedBid,
  partnerName,
  partnerBid,
  players,
  onSelectBid,
  language = 'en',
}) => {
  const loc = BIDDING_LOCALES[language] || BIDDING_LOCALES.en;

  // Reset previous bid number. No number is selected from start.
  const [selectedBid, setSelectedBid] = useState<number | null>(null);

  // Automatically reset selected bid to null on new hand, redeal, or revision turn
  useEffect(() => {
    setSelectedBid(null);
  }, [trumpCard?.id, dealerName, isRevisionMode]);

  // Partnership combined bid preview
  const estimatedCombinedBid = selectedBid !== null ? selectedBid + (partnerBid ?? 0) : null;
  const isCombinedValid =
    partnerBid === null ||
    selectedBid === null ||
    (estimatedCombinedBid !== null && estimatedCombinedBid >= 2);

  return (
    <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto my-auto lg:-translate-y-7 xl:-translate-y-9 lg:z-40 animate-fade-in select-none">
      {/* Tabletop Wooden Felt Mat Container - guaranteed zero scrolling needed */}
      <div className="relative bg-gradient-to-b from-[#2B150C]/95 via-[#1C0D07]/95 to-[#120703]/95 border-2 border-amber-600/70 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-md overflow-hidden flex flex-col gap-1 sm:gap-1.5">
        {/* Ornate Gold Filigree Corners */}
        <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-400/80 rounded-tl pointer-events-none" />
        <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-400/80 rounded-tr pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-400/80 rounded-bl pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400/80 rounded-br pointer-events-none" />

        {/* ================= 1. CENTER TOP: DEALER NAME ================= */}
        <div className="flex items-center justify-center gap-1.5 py-0.5 text-center border-b border-amber-800/40 flex-shrink-0">
          <span className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border border-amber-200 text-neutral-950 font-cinzel font-black text-[9px] flex items-center justify-center shadow-xs flex-shrink-0">
            D
          </span>
          <span className="text-[11px] sm:text-xs font-cinzel font-bold text-amber-200 tracking-wide">
            {loc.dealer}: <strong className="text-amber-100 font-script text-base sm:text-lg ml-0.5">{dealerName}</strong>
          </span>
          <span className="text-amber-400 text-xs ml-0.5" title="Rotates Counter-Clockwise">↺</span>
        </div>

        {/* ================= 2. TRUMP COLOR (SINGLE LANGUAGE ONLY) ================= */}
        <div className="flex items-center justify-center gap-2 py-1 flex-shrink-0">
          {trumpCard && (
            <div className="relative flex-shrink-0">
              <CardView
                card={trumpCard}
                size="xs"
                isLegal={false}
                isTrump={true}
                className="shadow-sm ring-1 ring-amber-400/80 scale-90 sm:scale-95 origin-center"
              />
            </div>
          )}

          <div className="flex flex-col items-start justify-center leading-tight">
            <span className="text-[10px] sm:text-[11px] font-cinzel font-bold text-amber-300 uppercase tracking-wider">
              {loc.trumpColor}
            </span>
            <div className="mt-0.5">
              {isJokerRevealHand ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-950/90 border border-amber-400/80 text-[10px] sm:text-[11px] font-cinzel font-black text-amber-200">
                  ★ {loc.universalJoker}
                </span>
              ) : trumpSuit ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/90 border border-amber-500/70 text-[10px] sm:text-[11px] font-cinzel font-black text-amber-200">
                  <SuitIcon suit={trumpSuit} size={14} showGoldBorder />
                  <span>{getSuitDisplayName(trumpSuit, language)}</span>
                  {trumpCard && (
                    <span className="font-mono text-amber-300 ml-1 bg-amber-950/90 px-1 py-0.2 rounded border border-amber-800/40 text-[9px]">
                      {trumpCard.shortName}
                    </span>
                  )}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* ================= 3. BIDDING INTERACTION ================= */}
        {isHumanBiddingTurn ? (
          /* Human Player Bidding Console */
          <div className="flex flex-col gap-1 sm:gap-1.5">
            {/* Revision Notice Banner */}
            {isRevisionMode && (
              <div className="p-1 rounded-lg bg-rose-950/90 border border-rose-500 text-rose-200 text-[10px] sm:text-[11px] flex items-center gap-1.5 text-left animate-pulse flex-shrink-0">
                <AlertCircle size={13} className="text-rose-400 flex-shrink-0" />
                <div>
                  <strong>{loc.teamMin}:</strong> {loc.minRequired}
                </div>
              </div>
            )}

            {/* Table Declared Bids Summary (Hand info removed completely per request) */}
            <div className="py-0.5 px-2 rounded-lg bg-neutral-900/85 border border-amber-900/40 flex items-center justify-between text-[10px] font-outfit text-amber-200 flex-shrink-0">
              <span className="font-cinzel text-amber-300 font-bold text-[9px] sm:text-[10px]">
                {loc.declaredBids}:
              </span>
              <div className="flex items-center gap-2">
                {Object.entries(players).map(([pid, p]) => (
                  <span key={pid} className="font-mono text-[9px] sm:text-[10px]">
                    <span className="text-amber-400/80">{p.name.split(' ')[0]}:</span>{' '}
                    <strong className="text-amber-100 font-bold">{p.bid !== null ? p.bid : '·'}</strong>
                  </span>
                ))}
              </div>
            </div>

            {/* Partnership Total Check Banner */}
            {partnerBid !== null && (
              <div className="py-0.5 px-2 rounded-lg bg-neutral-900/90 border border-amber-700/50 flex items-center justify-between text-[10px] sm:text-[11px] font-outfit flex-shrink-0">
                <span className="text-amber-300 truncate">
                  {loc.team1}: {loc.you} ({selectedBid !== null ? selectedBid : '—'}) + {partnerName} ({partnerBid}) =
                </span>
                <span
                  className={`font-mono font-bold text-xs flex-shrink-0 ${
                    selectedBid === null
                      ? 'text-amber-400/70'
                      : isCombinedValid
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {selectedBid !== null
                    ? `${estimatedCombinedBid} ${loc.tricksPlural} ${isCombinedValid ? `✓ ${loc.valid}` : `⚠ (${loc.teamMin})`}`
                    : loc.selectToConfirm}
                </span>
              </div>
            )}

            {/* 0 to 13 Bid Selector Buttons - no mention of "0 to 13" in header text */}
            <div className="flex-shrink-0">
              <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-cinzel text-amber-200 mb-0.5 px-0.5">
                <span>{loc.yourBid}:</span>
                <span className="text-amber-400 font-sans">
                  {loc.suggested}: <strong className="text-amber-300 font-mono">{suggestedBid}</strong>
                </span>
              </div>

              <div className="grid grid-cols-14 gap-0.5 sm:gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(bid => {
                  const isSelected = selectedBid === bid;
                  const isRecommended = bid === suggestedBid;

                  return (
                    <button
                      key={bid}
                      type="button"
                      onClick={() => setSelectedBid(bid)}
                      className={`relative h-6.5 sm:h-7 rounded-md font-cinzel text-[11px] sm:text-xs font-bold transition-all cursor-pointer touch-manipulation flex items-center justify-center ${
                        isSelected
                          ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-neutral-950 border border-amber-200 shadow-md scale-105 ring-2 ring-amber-300 z-10'
                          : 'bg-neutral-900/90 hover:bg-neutral-800 text-amber-200 border border-amber-800/40 hover:border-amber-500'
                      }`}
                    >
                      {bid}
                      {isRecommended && selectedBid === null && (
                        <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[7px] text-emerald-400 font-sans leading-none pointer-events-none">
                          ★
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Bid Button - always visible with ZERO scrolling */}
            <button
              type="button"
              onClick={() => {
                if (selectedBid !== null && isCombinedValid) {
                  onSelectBid(selectedBid);
                }
              }}
              disabled={selectedBid === null || !isCombinedValid}
              className={`w-full h-8 sm:h-8.5 rounded-xl font-cinzel font-black text-xs sm:text-sm tracking-wider uppercase border shadow-md transition-all flex items-center justify-center flex-shrink-0 ${
                selectedBid === null
                  ? 'bg-neutral-800/80 text-neutral-400 border-neutral-700 cursor-not-allowed'
                  : !isCombinedValid
                  ? 'bg-rose-950/80 text-rose-300 border-rose-600/70 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-neutral-950 border-amber-200 shadow-amber-500/30 cursor-pointer active:scale-98'
              }`}
            >
              {selectedBid === null
                ? loc.selectToConfirm
                : !isCombinedValid
                ? loc.teamMin
                : `${loc.confirmBid} ${selectedBid} ${selectedBid === 1 ? loc.trickSingular : loc.tricksPlural}`}
            </button>
          </div>
        ) : (
          /* Waiting for AI Player Bids Display */
          <div className="flex flex-col items-center py-1 text-center">
            {/* Active Bidder Pulse Indicator */}
            <div className="flex items-center gap-1.5 mb-1 px-3 py-0.5 rounded-full bg-amber-950/60 border border-amber-700/50">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-[10px] sm:text-[11px] font-cinzel font-bold text-amber-200">
                {currentBidderName ? `${currentBidderName} ${loc.waitingBids}` : loc.biddingProgress}
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
                    {p.isHuman ? loc.you : p.teamId === 'team1' ? 'Partner' : 'Opponent'}
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
              {loc.inspectNote}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

TableBiddingCenter.displayName = 'TableBiddingCenter';
