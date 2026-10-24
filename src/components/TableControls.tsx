import React, { useState } from 'react';
import { Card, GameSettings, MatchConfig, Partnership, PlayerId, Suit, TeamId } from '../types/game';
import { SuitIcon } from './art/SuitIcon';
import { SUIT_NAMES } from '../engine/deck';
import { Volume2, VolumeX, BookOpen, Trophy, RotateCcw, Clock, Settings, CheckCheck, MoreVertical, X } from 'lucide-react';

interface TableControlsProps {
  handNumber: number;
  trickNumber: number;
  trumpSuit: Suit | null;
  trumpCard: Card | null;
  isJokerRevealHand: boolean;
  dealer: PlayerId;
  dealerName: string;
  statusMessage: string;
  partnerships: Record<TeamId, Partnership>;
  matchConfig: MatchConfig;
  timeRemainingSeconds: number | null;
  isTimeExpired: boolean;
  settings: GameSettings;
  onToggleSound: () => void;
  onOpenRules: () => void;
  onOpenScoreboard: () => void;
  onOpenMatchConfig: () => void;
  onOpenTestRunner: () => void;
  onRestartHand: () => void;
  onInspectTrump: () => void;
}

export const TableControls: React.FC<TableControlsProps> = ({
  handNumber,
  trickNumber,
  trumpSuit,
  trumpCard,
  isJokerRevealHand,
  dealerName,
  statusMessage,
  partnerships,
  matchConfig,
  timeRemainingSeconds,
  isTimeExpired,
  settings,
  onToggleSound,
  onOpenRules,
  onOpenScoreboard,
  onOpenMatchConfig,
  onOpenTestRunner,
  onRestartHand,
  onInspectTrump,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <header className="w-full max-w-6xl mx-auto px-2 sm:px-4 pt-1.5 sm:pt-2.5 pb-1 flex flex-col gap-1.5 sm:gap-2 z-30 select-none flex-shrink-0">
      {/* ================= DESKTOP & TABLET TOP BAR (>= 640px) ================= */}
      <div className="hidden sm:flex items-center justify-between gap-1.5 md:gap-2 flex-nowrap w-full">
        {/* Brand, Hand Number, Dealer */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-700 border border-amber-200 flex items-center justify-center shadow-md">
            <span className="text-xs sm:text-sm">🃏</span>
          </div>
          <div>
            <h1 className="font-cinzel text-xs sm:text-sm md:text-base font-black text-amber-200 tracking-wider">
              The Universal Joker
            </h1>
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-amber-400/80 font-outfit">
              <span>Hand {handNumber}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                Dealer: <strong className="text-amber-200">{dealerName}</strong>
                <span className="text-amber-400 text-xs" title="Rotates Counter-Clockwise">↺</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Team Scores & Mode Target */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap min-w-0">
          {/* Team 1 & Team 2 Live Match Points */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 sm:py-1 rounded-xl bg-neutral-900/90 border border-amber-700/50 shadow-md text-[11px] sm:text-xs font-outfit flex-shrink-0">
            <div className="flex items-center gap-1">
              <span className="text-amber-400/80 text-[9px] sm:text-[10px] font-cinzel">Team 1:</span>
              <span className="font-mono font-bold text-amber-200">{partnerships.team1.matchScore}</span>
            </div>
            <span className="text-amber-600">vs</span>
            <div className="flex items-center gap-1">
              <span className="text-amber-400/80 text-[9px] sm:text-[10px] font-cinzel">Team 2:</span>
              <span className="font-mono font-bold text-amber-200">{partnerships.team2.matchScore}</span>
            </div>
          </div>

          {/* Match Mode Target or Timer */}
          {matchConfig.mode === 'time' && timeRemainingSeconds !== null ? (
            <div
              className={`flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-xl border text-[11px] sm:text-xs font-mono font-bold shadow-md flex-shrink-0 ${
                isTimeExpired
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-neutral-900/90 border-amber-600/50 text-amber-300'
              }`}
            >
              <Clock size={12} />
              <span>{isTimeExpired ? 'Finishing Hand' : formatTime(timeRemainingSeconds)}</span>
            </div>
          ) : (
            <div className="px-2 py-0.5 sm:py-1 rounded-xl bg-neutral-900/90 border border-amber-800/40 text-[10px] sm:text-[11px] font-cinzel text-amber-300/90 shadow-md flex-shrink-0">
              Target: <strong className="text-amber-200 font-mono">{matchConfig.mode === 'default_points' ? 100 : matchConfig.targetPoints} pts</strong>
            </div>
          )}

          {/* Trump Indicator Box */}
          {isJokerRevealHand ? (
            <div className="flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-xl bg-red-950/90 border border-amber-500/60 shadow-md text-[11px] sm:text-xs font-cinzel text-amber-200 font-bold flex-shrink-0">
              <span>★ No Trump</span>
            </div>
          ) : trumpSuit ? (
            <button
              type="button"
              onClick={onInspectTrump}
              title="Click to inspect 13th final dealt trump card"
              className="flex items-center gap-1.5 px-2 py-0.5 sm:py-1 rounded-xl bg-neutral-900/90 hover:bg-neutral-800/90 border border-amber-600/60 shadow-md cursor-pointer transition-all hover:border-amber-400 flex-shrink-0"
            >
              <span className="text-[9px] sm:text-[10px] font-cinzel text-amber-300 uppercase tracking-wider hidden md:inline">
                Trump:
              </span>
              <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-amber-100 font-cinzel">
                <SuitIcon suit={trumpSuit} size={15} showGoldBorder />
                <span>{SUIT_NAMES[trumpSuit]}</span>
              </div>
              {trumpCard && (
                <span className="text-[9px] font-mono text-amber-400 bg-amber-950/90 px-1 py-0.2 rounded border border-amber-700/50">
                  {trumpCard.shortName}
                </span>
              )}
            </button>
          ) : (
            <div className="px-2 py-0.5 sm:py-1 rounded-xl bg-neutral-900/80 border border-amber-800/40 text-[9px] sm:text-[10px] text-amber-300 font-cinzel flex-shrink-0">
              Dealing...
            </div>
          )}

          {/* Trick Counter Badge */}
          <div className="px-2 py-0.5 sm:py-1 rounded-xl bg-neutral-900/90 border border-amber-700/50 shadow-md flex items-center gap-1 text-[11px] sm:text-xs text-amber-200 font-cinzel font-bold flex-shrink-0">
            <span className="text-[9px] text-amber-400/80 font-normal hidden sm:inline">Trick:</span>
            <span className="text-amber-100 font-mono">{trickNumber}/13</span>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Test Engine Verification Button */}
          <button
            type="button"
            onClick={onOpenTestRunner}
            title="Inspect 42 Automated Game Engine Tests"
            className="p-1 sm:px-2 sm:py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/50 shadow-sm transition-colors flex items-center gap-1 text-[11px] font-cinzel cursor-pointer"
          >
            <CheckCheck size={13} />
            <span className="hidden md:inline">Tests (42)</span>
          </button>

          {/* Match Mode Settings Button */}
          <button
            type="button"
            onClick={onOpenMatchConfig}
            title="Configure Match Mode (Points / Time)"
            className="p-1 sm:p-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-amber-300 border border-amber-800/50 hover:border-amber-500 shadow-sm transition-colors cursor-pointer"
          >
            <Settings size={13} />
          </button>

          {/* Scoreboard Button */}
          <button
            type="button"
            onClick={onOpenScoreboard}
            title="View Scores & Standings"
            className="p-1 sm:px-2 sm:py-1 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-amber-300 border border-amber-800/50 hover:border-amber-500 shadow-sm transition-colors flex items-center gap-1 text-[11px] font-cinzel cursor-pointer"
          >
            <Trophy size={13} />
            <span className="hidden md:inline">Score</span>
          </button>

          {/* Rules / Playbook Button */}
          <button
            type="button"
            onClick={onOpenRules}
            title="Read Official Playbook"
            className="p-1 sm:px-2 sm:py-1 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-amber-300 border border-amber-800/50 hover:border-amber-500 shadow-sm transition-colors flex items-center gap-1 text-[11px] font-cinzel cursor-pointer"
          >
            <BookOpen size={13} />
            <span className="hidden md:inline">Rules</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={settings.soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            className="p-1 sm:p-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-amber-300 border border-amber-800/50 hover:border-amber-500 shadow-sm transition-colors cursor-pointer"
          >
            {settings.soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>

          {/* Reset / Redeal Hand */}
          <button
            type="button"
            onClick={onRestartHand}
            title="Redeal Current Hand"
            className="p-1 sm:p-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-amber-300 border border-amber-800/50 hover:border-amber-500 shadow-sm transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* ================= COMPACT MOBILE TOP BAR (< 640px) ================= */}
      <div className="sm:hidden flex flex-col gap-1 w-full">
        {/* Mobile Row 1: Logo, Title, Live Scores, and Action Buttons */}
        <div className="flex items-center justify-between gap-1 w-full">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base flex-shrink-0">🃏</span>
            <div className="truncate">
              <span className="font-cinzel text-xs font-black text-amber-200 tracking-wide block truncate">
                The Universal Joker
              </span>
              <span className="text-[9px] text-amber-400/80 font-mono block">
                H{handNumber} · {dealerName} (D)
              </span>
            </div>
          </div>

          {/* Mobile Right Quick Action Icons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Scoreboard */}
            <button
              type="button"
              onClick={onOpenScoreboard}
              aria-label="Scoreboard"
              className="p-1.5 min-w-[34px] min-h-[34px] rounded-lg bg-neutral-900/90 text-amber-300 border border-amber-700/50 flex items-center justify-center cursor-pointer touch-manipulation"
            >
              <Trophy size={14} />
            </button>

            {/* Rules */}
            <button
              type="button"
              onClick={onOpenRules}
              aria-label="Playbook Rules"
              className="p-1.5 min-w-[34px] min-h-[34px] rounded-lg bg-neutral-900/90 text-amber-300 border border-amber-700/50 flex items-center justify-center cursor-pointer touch-manipulation"
            >
              <BookOpen size={14} />
            </button>

            {/* Sound */}
            <button
              type="button"
              onClick={onToggleSound}
              aria-label="Sound Toggle"
              className="p-1.5 min-w-[34px] min-h-[34px] rounded-lg bg-neutral-900/90 text-amber-300 border border-amber-700/50 flex items-center justify-center cursor-pointer touch-manipulation"
            >
              {settings.soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>

            {/* More Menu Dropdown Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="More Options"
              className="p-1.5 min-w-[34px] min-h-[34px] rounded-lg bg-neutral-900/90 text-amber-300 border border-amber-700/50 flex items-center justify-center cursor-pointer touch-manipulation"
            >
              <MoreVertical size={14} />
            </button>
          </div>
        </div>

        {/* Mobile Row 2: Trump Status, Team Scores, Trick Counter */}
        <div className="flex items-center justify-between gap-1 w-full text-[10px]">
          {/* Trump Decider Badge (Clickable) */}
          {isJokerRevealHand ? (
            <div className="px-2 py-0.5 rounded-lg bg-red-950 border border-amber-500/60 font-cinzel text-amber-200 font-bold flex items-center gap-1">
              <span>★ No Trump</span>
            </div>
          ) : trumpSuit ? (
            <button
              type="button"
              onClick={onInspectTrump}
              className="px-2 py-0.5 rounded-lg bg-neutral-900/95 border border-amber-600/70 font-cinzel text-amber-200 flex items-center gap-1 cursor-pointer"
            >
              <SuitIcon suit={trumpSuit} size={13} showGoldBorder />
              <span className="font-bold">{SUIT_NAMES[trumpSuit]}</span>
              {trumpCard && (
                <span className="font-mono text-[9px] text-amber-400 bg-amber-950 px-1 rounded">
                  {trumpCard.shortName}
                </span>
              )}
            </button>
          ) : (
            <div className="px-2 py-0.5 rounded-lg bg-neutral-900 font-cinzel text-amber-300">
              Dealing...
            </div>
          )}

          {/* Scores */}
          <div className="px-2 py-0.5 rounded-lg bg-neutral-900/90 border border-amber-800/50 font-outfit text-amber-200 font-mono flex items-center gap-1">
            <span className="text-amber-400/80 font-cinzel text-[9px]">T1:</span>
            <strong>{partnerships.team1.matchScore}</strong>
            <span className="text-amber-600">·</span>
            <span className="text-amber-400/80 font-cinzel text-[9px]">T2:</span>
            <strong>{partnerships.team2.matchScore}</strong>
          </div>

          {/* Trick Number */}
          <div className="px-2 py-0.5 rounded-lg bg-neutral-900/90 border border-amber-800/50 font-cinzel text-amber-200 font-bold">
            Trick {trickNumber}/13
          </div>
        </div>

        {/* Mobile More Menu Drawer (When Open) */}
        {isMobileMenuOpen && (
          <div className="w-full p-2 bg-[#261208] border border-amber-600/70 rounded-xl shadow-xl flex flex-wrap items-center justify-around gap-2 text-xs font-cinzel animate-fade-in">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenTestRunner();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-600/50 flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <CheckCheck size={13} />
              <span>Engine Tests (42)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenMatchConfig();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-900 text-amber-300 border border-amber-700/50 flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <Settings size={13} />
              <span>Match Mode</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onRestartHand();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-900 text-amber-300 border border-amber-700/50 flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Redeal Hand</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 rounded-full text-amber-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Status Notice Ribbon */}
      <div className="w-full py-0.5 sm:py-1 px-2.5 sm:px-3 rounded-lg bg-gradient-to-r from-neutral-950/90 via-amber-950/70 to-neutral-950/90 border border-amber-600/30 text-center shadow-inner truncate">
        <span className="text-[11px] sm:text-xs font-outfit text-amber-200 font-medium tracking-wide">
          {statusMessage}
        </span>
      </div>
    </header>
  );
};
