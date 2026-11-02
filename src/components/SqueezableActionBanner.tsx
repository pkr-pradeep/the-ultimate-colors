import React, { useState, useEffect, useRef } from 'react';

interface SqueezableActionBannerProps {
  type: 'show_hand' | 'skip';
  isVisible: boolean;
  onAction: () => void;
  tricksNeeded?: number;
  team1Score?: { won: number; bid: number };
  team2Score?: { won: number; bid: number };
  handNumber?: number;
  autoCollapseMs?: number;
}

export const SqueezableActionBanner: React.FC<SqueezableActionBannerProps> = ({
  type,
  isVisible,
  onAction,
  tricksNeeded = 0,
  team1Score,
  team2Score,
  handNumber = 1,
  autoCollapseMs = 4000,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const prevVisibleRef = useRef(false);
  const prevHandRef = useRef(handNumber);

  useEffect(() => {
    // When the prompt becomes visible for the first time in a hand, show expanded banner first
    const isNewOccurrence = (!prevVisibleRef.current && isVisible) || (prevHandRef.current !== handNumber && isVisible);
    prevVisibleRef.current = isVisible;
    prevHandRef.current = handNumber;

    if (isNewOccurrence) {
      setIsExpanded(true);
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, autoCollapseMs);
      return () => clearTimeout(timer);
    } else if (!isVisible) {
      setIsExpanded(false);
    }
  }, [isVisible, handNumber, autoCollapseMs]);

  if (!isVisible) return null;

  const isShowHand = type === 'show_hand';

  return (
    <div
      className={`fixed z-30 transition-all duration-700 ease-in-out select-none ${
        isExpanded
          ? 'bottom-[138px] sm:bottom-[158px] md:bottom-[175px] left-1/2 -translate-x-1/2'
          : 'bottom-[138px] sm:bottom-[158px] md:bottom-[175px] left-3 sm:left-5 translate-x-0'
      }`}
    >
      {isExpanded ? (
        /* ================= FULL EXPANDED BANNER (INITIAL APPEARANCE) ================= */
        <div className="animate-fade-in flex items-center justify-center">
          {isShowHand ? (
            <button
              type="button"
              onClick={onAction}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider shadow-2xl border-2 border-emerald-300 cursor-pointer flex items-center gap-2.5 transition-transform transform hover:scale-105 active:scale-95"
            >
              <img
                src="/assets/aistudio/image_99557782.png"
                alt="Show Hand"
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0 drop-shadow"
              />
              <span>Show Hand (Claim Remaining Tricks)</span>
              <span className="text-[10px] sm:text-xs bg-black/60 text-emerald-200 px-2 py-0.5 rounded-full font-mono font-bold">
                Need {tricksNeeded} more trick{tricksNeeded !== 1 ? 's' : ''}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-neutral-950 font-cinzel text-xs sm:text-sm font-black uppercase tracking-wider shadow-2xl border-2 border-amber-200 cursor-pointer flex items-center gap-2.5 transition-transform transform hover:scale-105 active:scale-95 animate-pulse"
            >
              <img
                src="/assets/aistudio/image_75cb92d7.png"
                alt="Skip Remaining Rounds"
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0 drop-shadow"
              />
              <span>Skip Remaining Rounds (Both Contracts Met)</span>
              {team1Score && team2Score && (
                <span className="text-[10px] sm:text-xs bg-neutral-900/85 text-amber-200 px-2 py-0.5 rounded-full font-mono font-bold">
                  T1: {team1Score.won}/{team1Score.bid} · T2: {team2Score.won}/{team2Score.bid}
                </span>
              )}
            </button>
          )}
        </div>
      ) : (
        /* ================= SQUEEZED ICON BUTTON ON THE LEFT ================= */
        <div className="relative group animate-scale-up">
          {isShowHand ? (
            <button
              type="button"
              onClick={onAction}
              title={`Show Hand: Claim remaining ${tricksNeeded} trick${tricksNeeded !== 1 ? 's' : ''}`}
              className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-neutral-900 border-2 border-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.55)] flex items-center justify-center p-1.5 sm:p-2 cursor-pointer transition-all transform hover:scale-110 active:scale-95 animate-pulse"
            >
              <img
                src="/assets/aistudio/image_99557782.png"
                alt="Show Hand Claim"
                className="w-full h-full object-contain filter drop-shadow"
              />
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-[20px] px-1 rounded-full bg-emerald-500 text-neutral-950 font-mono font-black text-[9px] sm:text-[10px] border border-white flex items-center justify-center shadow-md">
                {tricksNeeded}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onAction}
              title="Skip Remaining Rounds (Both Contracts Met)"
              className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-neutral-900 border-2 border-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.6)] flex items-center justify-center p-1.5 sm:p-2 cursor-pointer transition-all transform hover:scale-110 active:scale-95 animate-pulse"
            >
              <img
                src="/assets/aistudio/image_75cb92d7.png"
                alt="Skip Rounds"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </button>
          )}

          {/* Floating Tooltip Label on Hover */}
          <div className="hidden group-hover:block absolute left-full ml-2.5 top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1 rounded-xl bg-neutral-950/95 border border-amber-400 text-amber-200 text-xs font-cinzel shadow-2xl pointer-events-none z-50 animate-fade-in">
            {isShowHand
              ? `Show Hand (Claim ${tricksNeeded} Trick${tricksNeeded !== 1 ? 's' : ''})`
              : 'Skip Remaining Rounds (Contracts Met)'}
          </div>
        </div>
      )}
    </div>
  );
};
