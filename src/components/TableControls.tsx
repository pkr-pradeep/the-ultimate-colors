import React, { useState, useEffect, useRef } from 'react';
import { Card, GameSettings, MatchConfig, Partnership, PlayerId, Suit, TeamId } from '../types/game';
import { SuitIcon } from './art/SuitIcon';
import { SUIT_NAMES, MULTILINGUAL_SUIT_NAMES } from '../engine/deck';
import { Volume2, VolumeX, BookOpen, Trophy, RotateCcw, Clock, Settings, CheckCheck, MoreVertical, X, HelpCircle, ChevronDown } from 'lucide-react';

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
  onOpenTactics?: () => void;
  onOpenWalkthrough?: () => void;
}

export const TableControls = React.memo<TableControlsProps>(({
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
  onOpenTactics,
  onOpenWalkthrough,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);

  // Close desktop options menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!isDesktopMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(e.target as Node)) {
        setIsDesktopMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDesktopMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDesktopMenuOpen]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <header className="w-full max-w-6xl mx-auto px-2 sm:px-4 pt-1.5 sm:pt-2.5 pb-1 flex flex-col gap-1.5 sm:gap-2 z-30 select-none flex-shrink-0">
      {/* ================= DESKTOP & TABLET TOP BAR (>= 640px) ================= */}
      <div className="hidden sm:flex items-center justify-between gap-2 md:gap-3 flex-nowrap w-full">
        {/* LEFT: Royal Brand Crest, Hand Counter, Dealer Meta */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 border border-amber-300/80 flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-sm">🃏</span>
          </div>
          <div className="leading-tight">
            <h1 className="font-cinzel text-xs sm:text-sm lg:text-base font-black text-amber-100 tracking-wider">
              The Universal Joker
            </h1>
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-amber-400/80 font-outfit">
              <span className="font-semibold text-amber-300">Hand {handNumber}</span>
              <span className="text-amber-600">·</span>
              <span className="flex items-center gap-1">
                Dealer: <strong className="text-amber-200">{dealerName}</strong>
                <span className="text-amber-400 text-xs" title="Rotates Counter-Clockwise">↺</span>
              </span>
            </div>
          </div>
        </div>

        {/* CENTER: Unified Royal Table HUD Console (Scores, Trump, Target, Trick) */}
        <div className="flex items-center gap-2 md:gap-3 px-3 py-1.5 rounded-2xl bg-neutral-950/85 border border-amber-600/50 shadow-xl backdrop-blur-md flex-shrink-0 min-w-0">
          {/* Live Match Scoreboard Trigger */}
          <button
            type="button"
            onClick={onOpenScoreboard}
            title="Click to view detailed Scoreboard & Match History"
            className="flex items-center gap-1.5 text-xs font-outfit text-amber-200 hover:text-white transition-colors cursor-pointer group flex-shrink-0"
          >
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-amber-400/90 font-cinzel font-semibold group-hover:text-amber-300">T1:</span>
              <strong className="font-mono text-amber-100 font-black">{partnerships.team1.matchScore}</strong>
            </div>
            <span className="text-amber-600 text-[10px] font-bold">vs</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-amber-400/90 font-cinzel font-semibold group-hover:text-amber-300">T2:</span>
              <strong className="font-mono text-amber-100 font-black">{partnerships.team2.matchScore}</strong>
            </div>
          </button>

          {/* Vertical Divider */}
          <div className="h-4 w-[1px] bg-amber-700/50 flex-shrink-0" />

          {/* Trump Card & Suit Indicator (Clickable to inspect 13th card) */}
          {isJokerRevealHand ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-950/90 border border-amber-500/60 text-[11px] font-cinzel text-amber-200 font-bold flex-shrink-0">
              <span>★ No Trump</span>
            </div>
          ) : trumpSuit ? (
            <button
              type="button"
              onClick={onInspectTrump}
              title="Click to inspect 13th final dealt trump card"
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 border border-amber-600/50 hover:border-amber-400 shadow-sm transition-all cursor-pointer flex-shrink-0"
            >
              <span className="text-[10px] font-cinzel text-amber-300 uppercase tracking-wider hidden lg:inline">
                Trump:
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-100 font-cinzel">
                <SuitIcon suit={trumpSuit} size={14} showGoldBorder />
                <span>{SUIT_NAMES[trumpSuit]}</span>
              </div>
              {trumpCard && (
                <span className="text-[9px] font-mono text-amber-300 bg-amber-950/90 px-1 py-0.2 rounded border border-amber-600/50 font-bold">
                  {trumpCard.shortName}
                </span>
              )}
            </button>
          ) : (
            <div className="text-[10px] font-cinzel text-amber-400/70 italic flex-shrink-0">
              Dealing...
            </div>
          )}

          {/* Vertical Divider */}
          <div className="h-4 w-[1px] bg-amber-700/50 flex-shrink-0" />

          {/* Match Target or Live Timer */}
          {matchConfig.mode === 'time' && timeRemainingSeconds !== null ? (
            <div
              className={`flex items-center gap-1 text-xs font-mono font-bold flex-shrink-0 ${
                isTimeExpired ? 'text-rose-400 animate-pulse' : 'text-amber-300'
              }`}
              title={isTimeExpired ? 'Finishing current hand before declaring match winner' : 'Match time remaining'}
            >
              <Clock size={12} />
              <span>{isTimeExpired ? 'Finishing' : formatTime(timeRemainingSeconds)}</span>
            </div>
          ) : (
            <div className="text-[11px] font-cinzel text-amber-300/90 flex-shrink-0 whitespace-nowrap">
              Target: <strong className="text-amber-100 font-mono font-bold">{matchConfig.mode === 'default_points' ? 100 : matchConfig.targetPoints}</strong>
            </div>
          )}

          {/* Vertical Divider */}
          <div className="h-4 w-[1px] bg-amber-700/50 flex-shrink-0" />

          {/* Live Trick Number */}
          <div className="flex items-center gap-1 text-xs font-cinzel font-bold text-amber-200 flex-shrink-0 whitespace-nowrap">
            <span className="text-[10px] text-amber-400/80 font-normal hidden md:inline">Trick:</span>
            <span className="font-mono text-amber-100 font-black">{trickNumber}/13</span>
          </div>
        </div>

        {/* RIGHT: Streamlined Action Bar & Royal Options Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* AI Difficulty Pill (Visible on wide screens) */}
          {onOpenTactics && (
            <button
              type="button"
              onClick={onOpenTactics}
              title={`Current AI Mode: ${settings.intelligenceMode || 'legend'} (Click to view Tactics Guide)`}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-amber-200 border border-amber-700/50 hover:border-amber-400 shadow-sm transition-all text-xs font-cinzel cursor-pointer"
            >
              <span>{settings.intelligenceMode === 'novice' ? '🌱' : settings.intelligenceMode === 'master' ? '⚔️' : '👑'}</span>
              <span className="capitalize font-bold">{settings.intelligenceMode || 'legend'}</span>
            </button>
          )}

          {/* Scoreboard Button */}
          <button
            type="button"
            onClick={onOpenScoreboard}
            title="View Scores & Standings"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-amber-200 border border-amber-700/50 hover:border-amber-400 shadow-sm transition-all text-xs font-cinzel cursor-pointer"
          >
            <Trophy size={14} className="text-amber-400" />
            <span className="hidden md:inline font-bold">Scores</span>
          </button>

          {/* Rules / Playbook Button */}
          <button
            type="button"
            onClick={onOpenRules}
            title="Read Official Playbook (English, Hindi, Odia)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-amber-200 border border-amber-700/50 hover:border-amber-400 shadow-sm transition-all text-xs font-cinzel cursor-pointer"
          >
            <BookOpen size={14} className="text-amber-400" />
            <span className="hidden md:inline font-bold">Rules</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={settings.soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            className="p-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-amber-300 border border-amber-700/50 hover:border-amber-400 shadow-sm transition-all cursor-pointer"
          >
            {settings.soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          {/* Royal Options Dropdown (Consolidating secondary controls) */}
          <div className="relative" ref={desktopMenuRef}>
            <button
              type="button"
              onClick={() => setIsDesktopMenuOpen(prev => !prev)}
              title="Match Settings, AI Tactics, Tour & Tools"
              aria-expanded={isDesktopMenuOpen}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border shadow-sm transition-all text-xs font-cinzel font-bold cursor-pointer ${
                isDesktopMenuOpen
                  ? 'bg-amber-600/30 text-amber-100 border-amber-400 ring-1 ring-amber-400/50'
                  : 'bg-neutral-900/80 hover:bg-neutral-800 text-amber-200 border border-amber-700/50 hover:border-amber-400'
              }`}
            >
              <Settings size={14} className={`text-amber-400 transition-transform duration-300 ${isDesktopMenuOpen ? 'rotate-90' : ''}`} />
              <span className="hidden md:inline">Options</span>
              <ChevronDown size={12} className={`text-amber-400 transition-transform duration-200 ${isDesktopMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Desktop Floating Options Panel */}
            {isDesktopMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#1f0e08]/95 border-2 border-amber-500/60 rounded-2xl p-2 shadow-2xl backdrop-blur-md z-50 text-amber-100 flex flex-col gap-1 animate-fade-in font-outfit">
                {/* AI Intelligence Mode item */}
                {onOpenTactics && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDesktopMenuOpen(false);
                      onOpenTactics();
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-amber-900/40 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {settings.intelligenceMode === 'novice' ? '🌱' : settings.intelligenceMode === 'master' ? '⚔️' : '👑'}
                      </span>
                      <div>
                        <span className="text-xs font-cinzel font-bold text-amber-200 block group-hover:text-amber-100">
                          AI Difficulty
                        </span>
                        <span className="text-[10px] text-amber-400/70 block">
                          Tactics & risk guide
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-950 border border-amber-600/50 text-amber-300 font-bold">
                      {settings.intelligenceMode || 'legend'}
                    </span>
                  </button>
                )}

                {/* Match Mode Settings */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDesktopMenuOpen(false);
                    onOpenMatchConfig();
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-amber-900/40 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Settings size={15} className="text-amber-400" />
                    <div>
                      <span className="text-xs font-cinzel font-bold text-amber-200 block group-hover:text-amber-100">
                        Match Mode
                      </span>
                      <span className="text-[10px] text-amber-400/70 block">
                        Target points or timer
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-amber-300/90 font-bold px-2 py-0.5 rounded-full bg-neutral-900 border border-amber-700/50">
                    {matchConfig.mode === 'time' ? 'Time Mode' : `${matchConfig.targetPoints} pts`}
                  </span>
                </button>

                {/* Interactive Walkthrough Demo Tour */}
                {onOpenWalkthrough && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDesktopMenuOpen(false);
                      onOpenWalkthrough();
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-amber-900/40 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <HelpCircle size={15} className="text-amber-400" />
                      <div>
                        <span className="text-xs font-cinzel font-bold text-amber-200 block group-hover:text-amber-100">
                          Demo Walkthrough
                        </span>
                        <span className="text-[10px] text-amber-400/70 block">
                          Interactive rules tour
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-cinzel text-amber-400/80 px-2 py-0.5 rounded-full bg-neutral-900 border border-amber-700/50">
                      Tour
                    </span>
                  </button>
                )}

                {/* Engine Tests Verification Modal */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDesktopMenuOpen(false);
                    onOpenTestRunner();
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-emerald-950/40 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <CheckCheck size={15} className="text-emerald-400" />
                    <div>
                      <span className="text-xs font-cinzel font-bold text-emerald-300 block group-hover:text-emerald-200">
                        Engine Tests
                      </span>
                      <span className="text-[10px] text-emerald-400/70 block">
                        Automated rulebook tests
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/50 font-bold">
                    61 / 61
                  </span>
                </button>

                {/* Divider */}
                <div className="h-[1px] bg-amber-800/40 my-1" />

                {/* Redeal Current Hand */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDesktopMenuOpen(false);
                    onRestartHand();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-950/50 text-amber-300 hover:text-rose-200 text-left transition-colors text-xs font-cinzel cursor-pointer"
                >
                  <RotateCcw size={14} className="text-amber-400" />
                  <span className="font-bold">Redeal Current Hand</span>
                </button>
              </div>
            )}
          </div>
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
                onOpenTactics?.();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-900 text-amber-200 border border-amber-500/60 flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <span>
                {settings.intelligenceMode === 'novice' ? '🌱' : settings.intelligenceMode === 'master' ? '⚔️' : '👑'}
              </span>
              <span className="capitalize">{settings.intelligenceMode || 'legend'} Mode</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenTestRunner();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-600/50 flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <CheckCheck size={13} />
              <span>Tests (61)</span>
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

            {onOpenWalkthrough && (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenWalkthrough();
                }}
                className="px-2.5 py-1.5 rounded-lg bg-neutral-900 text-amber-300 border border-amber-700/50 flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <HelpCircle size={13} />
                <span>Demo Tour</span>
              </button>
            )}

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
      <div className="w-full max-w-3xl mx-auto py-0.5 sm:py-1 px-3 sm:px-4 rounded-full bg-gradient-to-r from-neutral-950/40 via-amber-950/80 to-neutral-950/40 border border-amber-600/35 text-center shadow-inner truncate">
        <span className="text-[11px] sm:text-xs font-outfit text-amber-200 font-medium tracking-wide">
          {statusMessage}
        </span>
      </div>
    </header>
  );
});

TableControls.displayName = 'TableControls';
