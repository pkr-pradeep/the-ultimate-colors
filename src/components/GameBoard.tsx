import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Card,
  GameState,
  MatchConfig,
  PlayerId,
} from '../types/game';
import {
  initializeMatch,
  startHand,
  submitPlayerBid,
  executeCardPlay,
  resolveCompletedTrick,
  advanceToNextHand,
  skipRemainingTricks,
  claimShowHand,
} from '../engine/gameEngine';
import { getLegalCards } from '../engine/cardPlay';
import { calculateAIBid, chooseAICard } from '../engine/ai';
import { sounds } from '../utils/audio';
import { TableControls } from './TableControls';
import { PlayerSeat } from './PlayerSeat';
import { CenterTrick } from './CenterTrick';
import { PlayerHandFan } from './PlayerHandFan';
import { TableBiddingCenter } from './TableBiddingCenter';
import { ScoreboardModal } from './ScoreboardModal';
import { RulesModal } from './RulesModal';
import { TrumpInspectModal } from './TrumpInspectModal';
import { MatchConfigModal } from './MatchConfigModal';
import { TestRunnerModal } from './TestRunnerModal';
import { TacticsModal } from './TacticsModal';
import { ShowHandModal } from './ShowHandModal';
import { WalkthroughModal } from './WalkthroughModal';
import { checkIsFirstTimeUser, RulebookLanguage, getSavedRulebookLanguage, saveRulebookLanguage } from '../utils/firstTimeUser';
import { AIIntelligenceLevel } from '../types/game';

export const GameBoard: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const initial = initializeMatch({
      mode: 'default_points',
      targetPoints: 100,
      durationSeconds: 1800,
    });
    return startHand(initial);
  });

  const [appLanguage, setAppLanguage] = useState<RulebookLanguage>(() => getSavedRulebookLanguage());
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [isScoreboardOpen, setIsScoreboardOpen] = useState(false);
  const [isTrumpInspectOpen, setIsTrumpInspectOpen] = useState(false);
  const [isMatchConfigOpen, setIsMatchConfigOpen] = useState(false);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);
  const [isTacticsOpen, setIsTacticsOpen] = useState(false);
  const [isShowHandOpen, setIsShowHandOpen] = useState(false);
  const [winningHighlightId, setWinningHighlightId] = useState<PlayerId | null>(null);
  const [autoDealCountdown, setAutoDealCountdown] = useState<number | null>(null);
  const [isAutoDealPaused, setIsAutoDealPaused] = useState(false);

  const handleAppLanguageChange = useCallback((lang: RulebookLanguage) => {
    saveRulebookLanguage(lang);
    setAppLanguage(lang);
  }, []);

  // First-time user detection on phone / browser
  // Automatically pops up walkthrough on very first visit, and NEVER again once seen
  useEffect(() => {
    let isMounted = true;
    checkIsFirstTimeUser().then(isFirstTime => {
      if (isMounted && isFirstTime) {
        setIsWalkthroughOpen(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const aiTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoDealPausedRef = useRef(false);
  isAutoDealPausedRef.current = isAutoDealPaused;

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, []);

  /**
   * Time Mode countdown timer tick
   */
  useEffect(() => {
    if (gameState.matchConfig.mode !== 'time' || !gameState.isTimerRunning) return;

    const timerInterval = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemainingSeconds === null || prev.timeRemainingSeconds <= 0) {
          return {
            ...prev,
            isTimerRunning: false,
            isTimeExpired: true,
            statusMessage: 'Time expired! Finishing current hand before declaring match winner...',
          };
        }
        return {
          ...prev,
          timeRemainingSeconds: prev.timeRemainingSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [gameState.matchConfig.mode, gameState.isTimerRunning]);

  /**
   * Sound effect on trick completion
   */
  useEffect(() => {
    if (gameState.phase !== 'trick_completed') return;

    sounds.playTrickWin();
    setWinningHighlightId(gameState.lastTrickWinner);

    const timer = setTimeout(() => {
      setWinningHighlightId(null);
      setGameState(prev => resolveCompletedTrick(prev));
    }, 1300);

    return () => clearTimeout(timer);
  }, [gameState.phase, gameState.lastTrickWinner]);

  /**
   * Automatically open Scoreboard and countdown to deal next hand when a hand finishes
   */
  useEffect(() => {
    if (gameState.phase !== 'round_summary' && gameState.phase !== 'match_completed') {
      setAutoDealCountdown(null);
      setIsAutoDealPaused(false);
      return;
    }

    setIsScoreboardOpen(true);

    // Only automatically deal if the match is still active (not completed)
    if (gameState.phase === 'round_summary' && !gameState.matchWinner) {
      setAutoDealCountdown(4);

      const interval = setInterval(() => {
        setAutoDealCountdown(prev => {
          if (isAutoDealPausedRef.current) return prev;
          if (prev === null) return 4;
          if (prev <= 1) {
            clearInterval(interval);
            setIsScoreboardOpen(false);
            sounds.playShuffleSound();
            setGameState(state => advanceToNextHand(state));
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameState.phase, gameState.matchWinner, gameState.handNumber]);

  /**
   * Handle Bidding progression (AI turns during bidding and revision)
   */
  useEffect(() => {
    if (gameState.phase !== 'bidding' && gameState.phase !== 'bidding_revision') return;

    if (gameState.phase === 'bidding_revision') {
      if (gameState.invalidPartnershipId === 'team2') {
        // AI Team 2 (West/East) needs to revise combined bid
        aiTimerRef.current = setTimeout(() => {
          setGameState(prev => submitPlayerBid(prev, 'west', 2));
        }, 600);
      }
      return;
    }

    const currentBidderId = gameState.biddingOrder[gameState.biddingCurrentIndex];
    if (!currentBidderId) return;

    const currentBidder = gameState.players[currentBidderId];
    if (currentBidder.isHuman) {
      // Human turn: wait for human interaction via TableBiddingCenter
      return;
    }

    // AI Bidder turn
    const partnerId = currentBidderId === 'east' ? 'west' : currentBidderId === 'west' ? 'east' : 'south';
    const partnerBid = gameState.players[partnerId]?.bid;

    aiTimerRef.current = setTimeout(() => {
      const aiDecision = calculateAIBid(
        currentBidder.hand,
        gameState.trumpSuit,
        gameState.isJokerRevealHand,
        partnerBid,
        gameState.settings.intelligenceMode || 'legend',
        gameState.partnerships,
        currentBidder.teamId
      );

      setGameState(prev => submitPlayerBid(prev, currentBidderId, aiDecision.bid, aiDecision.tacticalReason));
    }, 550);

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [
    gameState.phase,
    gameState.biddingOrder,
    gameState.biddingCurrentIndex,
    gameState.invalidPartnershipId,
    gameState.players,
    gameState.trumpSuit,
    gameState.isJokerRevealHand,
  ]);

  /**
   * Handle Card Play progression (AI turns during playing phase)
   */
  useEffect(() => {
    if (gameState.phase !== 'playing') return;

    const currentPlayer = gameState.players[gameState.turn];
    if (currentPlayer.isHuman) {
      // Human turn: wait for player card selection
      return;
    }

    // AI Player turn
    const delay = gameState.settings.gameSpeed === 'fast' ? 400 : 750;

    aiTimerRef.current = setTimeout(() => {
      const legalCards = getLegalCards(
        currentPlayer.hand,
        gameState.currentTrick,
        gameState.trickNumber,
        gameState.trumpSuit
      );

      if (legalCards.length > 0) {
        const chosenCard = chooseAICard(
          currentPlayer,
          legalCards,
          gameState.currentTrick,
          gameState.trickNumber,
          gameState.trumpSuit,
          gameState.isJokerRevealHand,
          gameState.settings.intelligenceMode || 'legend',
          gameState.trickHistory,
          gameState.partnerships
        );

        if (chosenCard.isDadajiJoker) {
          sounds.playDadajiFanfare();
        } else {
          sounds.playCardSnap();
        }

        setGameState(prev => executeCardPlay(prev, currentPlayer.id, chosenCard));
      }
    }, delay);

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [
    gameState.phase,
    gameState.turn,
    gameState.currentTrick,
    gameState.trickNumber,
    gameState.trumpSuit,
    gameState.isJokerRevealHand,
    gameState.players,
    gameState.settings.gameSpeed,
  ]);

  /**
   * Human Player submits bid
   */
  const handleHumanSelectBid = useCallback((bid: number) => {
    sounds.playClick();
    setGameState(prev => submitPlayerBid(prev, 'south', bid));
  }, []);

  /**
   * Human Player plays card
   */
  const handleHumanPlayCard = useCallback((card: Card) => {
    setGameState(prev => {
      if (prev.phase !== 'playing' || prev.turn !== 'south') return prev;

      if (card.isDadajiJoker) {
        sounds.playDadajiFanfare();
      } else {
        sounds.playCardSnap();
      }

      return executeCardPlay(prev, 'south', card);
    });
  }, []);

  /**
   * Advance to next hand
   */
  const handleNextHand = useCallback(() => {
    setIsScoreboardOpen(false);
    setAutoDealCountdown(null);
    setIsAutoDealPaused(false);
    sounds.playShuffleSound();
    setGameState(prev => advanceToNextHand(prev));
  }, []);

  /**
   * Restart entire match
   */
  const handleRestartMatch = useCallback(() => {
    setIsScoreboardOpen(false);
    sounds.playShuffleSound();
    setGameState(prev => {
      const fresh = initializeMatch(prev.matchConfig);
      return startHand(fresh);
    });
  }, []);

  /**
   * Redeal current hand
   */
  const handleRedealHand = useCallback(() => {
    sounds.playShuffleSound();
    setGameState(prev => {
      const reset = { ...prev, matchWinner: null, phase: 'idle' as const };
      return startHand(reset);
    });
  }, []);

  /**
   * Skip Remaining Rounds once both teams have achieved their bids
   */
  const handleSkipRemainingTricks = useCallback(() => {
    sounds.playDadajiFanfare();
    setGameState(prev => skipRemainingTricks(prev));
  }, []);

  /**
   * Claim Remaining Tricks via "Show Hand"
   */
  const handleConfirmClaimShowHand = useCallback((selectedCardIds?: string[]) => {
    setGameState(prev => {
      const next = claimShowHand(prev, selectedCardIds);
      const lastScoreChange = next.partnerships.team1.roundScoreHistory[next.partnerships.team1.roundScoreHistory.length - 1];
      if (lastScoreChange && lastScoreChange > 0) {
        sounds.playTrickWin();
      } else {
        sounds.playCardSnap();
      }
      return next;
    });
  }, []);

  /**
   * Apply new Match Configuration (Point target or Time Mode)
   */
  const handleApplyMatchConfig = (config: MatchConfig) => {
    sounds.playShuffleSound();
    const fresh = initializeMatch(config);
    setGameState(startHand(fresh));
  };

  /**
   * Intelligence Mode (Novice / Master / Legend)
   */
  const handleSetIntelligenceMode = (mode: AIIntelligenceLevel) => {
    sounds.playClick();
    setGameState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        intelligenceMode: mode,
      },
      statusMessage: `AI Intelligence Mode set to ${mode.toUpperCase()}. ${
        mode === 'novice'
          ? 'Basic trick-taking active.'
          : mode === 'master'
          ? 'Partner protection & honor preservation active.'
          : 'Full tactical arsenal: King-Rescue, Trump-Ace Decapitation & Void Memory active!'
      }`,
    }));
  };

  /**
   * Sound toggle
   */
  const handleToggleSound = () => {
    const nextMuted = !gameState.settings.soundEnabled;
    sounds.setMuted(nextMuted);
    setGameState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        soundEnabled: !nextMuted,
      },
    }));
  };

  // Determine legal cards for human player (South)
  const humanPlayer = gameState.players.south;
  const humanLegalCards = getLegalCards(
    humanPlayer.hand,
    gameState.currentTrick,
    gameState.trickNumber,
    gameState.trumpSuit
  );
  const isHumanTurn = gameState.phase === 'playing' && gameState.turn === 'south';

  // Check if it's currently bidding phase (bids are not yet done)
  const isBiddingPhase =
    gameState.phase === 'bidding' || gameState.phase === 'bidding_revision';
  const currentBidderId = gameState.biddingOrder[gameState.biddingCurrentIndex];
  const isHumanBiddingTurn =
  isBiddingPhase &&
  (currentBidderId === 'south' ||
    (gameState.phase === 'bidding_revision' && gameState.invalidPartnershipId === 'team1'));

  const team1 = gameState.partnerships.team1;
  const team2 = gameState.partnerships.team2;
  const isPlayingPhase = gameState.phase === 'playing' || gameState.phase === 'trick_completed';
  const bothContractsMet =
    isPlayingPhase &&
    team1.totalBid > 0 &&
    team2.totalBid > 0 &&
    team1.tricksWon >= team1.totalBid &&
    team2.tricksWon >= team2.totalBid &&
    gameState.trickNumber <= 13;
  const canShowHand =
    isPlayingPhase &&
    team1.totalBid > 0 &&
    team2.totalBid > 0 &&
    team2.tricksWon >= team2.totalBid &&
    team1.tricksWon < team1.totalBid;
  const tricksNeeded = Math.max(0, team1.totalBid - team1.tricksWon);

  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] bg-[#1c0d06] text-neutral-100 flex flex-col justify-between overflow-hidden select-none font-outfit">
      {/* ================= TABLETOP BACKGROUND (MATCHING REFERENCE IMAGE) ================= */}
      {/* Base Rustic Wood Tone with Radial Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_45%,#542813_0%,#361709_45%,#200B04_80%,#110502_100%)] opacity-95" />

      {/* Realistic Vertical Wood Planks with Soft Joint Lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-35"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 110px, rgba(15, 6, 2, 0.45) 110px, rgba(15, 6, 2, 0.45) 112px, rgba(254, 215, 170, 0.04) 112px, transparent 113px)`,
        }}
      />

      {/* Warm Ambient Table Glow Illuminating Played Center Trick and Cards */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl h-[75vh] max-h-[560px] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(217,119,6,0.12)_0%,rgba(180,83,9,0.06)_45%,transparent_75%)] pointer-events-none blur-xl" />

      {/* Outer Table Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_55%,rgba(8,3,1,0.65)_100%)]" />

      {/* ================= TOP CONTROLS & HUD ================= */}
      <TableControls
        handNumber={gameState.handNumber}
        trickNumber={gameState.trickNumber}
        trumpSuit={gameState.trumpSuit}
        trumpCard={gameState.trumpCard}
        isJokerRevealHand={gameState.isJokerRevealHand}
        dealer={gameState.dealer}
        dealerName={gameState.players[gameState.dealer].name}
        statusMessage={gameState.statusMessage}
        partnerships={gameState.partnerships}
        matchConfig={gameState.matchConfig}
        timeRemainingSeconds={gameState.timeRemainingSeconds}
        isTimeExpired={gameState.isTimeExpired}
        settings={gameState.settings}
        onToggleSound={handleToggleSound}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenScoreboard={() => setIsScoreboardOpen(true)}
        onOpenMatchConfig={() => setIsMatchConfigOpen(true)}
        onOpenTestRunner={() => setIsTestRunnerOpen(true)}
        onOpenTactics={() => setIsTacticsOpen(true)}
        onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
        onRestartHand={handleRedealHand}
        onInspectTrump={() => setIsTrumpInspectOpen(true)}
      />

      {/* ================= MAIN TABLE ARENA ================= */}
      <main className="relative flex-1 w-full max-w-6xl mx-auto px-1 sm:px-4 flex flex-col justify-between items-center z-10 min-h-0 overflow-hidden py-0.5">
        {/* TOP SEAT: Hriday (Partner of Aadesh, sitting directly across) */}
        <div className="w-full flex justify-center pt-0.5 flex-shrink-0">
          <PlayerSeat
            player={gameState.players.north}
            position="top"
            isCurrentTurn={gameState.turn === 'north'}
            isDealer={gameState.dealer === 'north'}
            teamScore={gameState.partnerships.team1.matchScore}
          />
        </div>

        {/* MIDDLE ROW: Left Seat (Shilaa), Center Arena, Right Seat (Mainaa) */}
        <div className="w-full flex items-center justify-between px-1 sm:px-6 my-auto gap-1 sm:gap-4 relative flex-1 min-h-0">
          {/* LEFT SEAT: Shilaa */}
          <div className="flex-shrink-0 z-10">
            <PlayerSeat
              player={gameState.players.west}
              position="left"
              isCurrentTurn={gameState.turn === 'west'}
              isDealer={gameState.dealer === 'west'}
              teamScore={gameState.partnerships.team2.matchScore}
            />
          </div>

          {/* CENTER ARENA: 13th Card Tabletop Bidding (until bids are done) or Center Trick (during play) */}
          <div className="relative flex-1 flex items-center justify-center min-w-0 w-full z-30">
            {isBiddingPhase ? (
              <TableBiddingCenter
                trumpSuit={gameState.trumpSuit}
                trumpCard={gameState.trumpCard}
                isJokerRevealHand={gameState.isJokerRevealHand}
                dealerName={gameState.players[gameState.dealer].name}
                isHumanBiddingTurn={isHumanBiddingTurn}
                isRevisionMode={gameState.phase === 'bidding_revision'}
                currentBidderId={currentBidderId}
                currentBidderName={currentBidderId ? gameState.players[currentBidderId]?.name : undefined}
                hand={humanPlayer.hand}
                suggestedBid={calculateAIBid(
                  humanPlayer.hand,
                  gameState.trumpSuit,
                  gameState.isJokerRevealHand,
                  gameState.players.north.bid,
                  gameState.settings.intelligenceMode || 'legend',
                  gameState.partnerships,
                  'team1'
                ).bid}
                partnerName="Hriday"
                partnerBid={gameState.players.north.bid}
                players={gameState.players}
                onSelectBid={handleHumanSelectBid}
              />
            ) : gameState.phase === 'round_summary' && !gameState.matchWinner ? (
              <div className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl bg-neutral-950/90 border-2 border-amber-600/60 shadow-2xl text-center max-w-sm animate-fade-in z-30">
                <div className="text-amber-400 font-cinzel text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
                  Hand {gameState.handNumber} Completed
                </div>
                <div className="font-script text-lg sm:text-2xl text-amber-100 font-bold mb-2">
                  Distributing New Hand {autoDealCountdown !== null && !isAutoDealPaused ? `in ${autoDealCountdown}s...` : ''}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={handleNextHand}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-cinzel text-xs font-bold uppercase rounded-xl border border-emerald-300 shadow-md cursor-pointer transition-all"
                  >
                    Deal Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsScoreboardOpen(true)}
                    className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-amber-200 font-cinzel text-xs rounded-xl border border-amber-700/50 cursor-pointer"
                  >
                    Scoreboard
                  </button>
                </div>
              </div>
            ) : (
              <CenterTrick
                currentTrick={gameState.currentTrick}
                players={gameState.players}
                winningPlayerId={winningHighlightId}
                trumpCard={gameState.trumpCard}
              />
            )}
          </div>

          {/* RIGHT SEAT: Mainaa */}
          <div className="flex-shrink-0 z-10">
            <PlayerSeat
              player={gameState.players.east}
              position="right"
              isCurrentTurn={gameState.turn === 'east'}
              isDealer={gameState.dealer === 'east'}
              teamScore={gameState.partnerships.team2.matchScore}
            />
          </div>
        </div>
      </main>

      {/* ================= BOTTOM FAN HAND & AADESH SEAT (HUMAN PLAYER) ================= */}
      {/* Wide horizontal natural fan with Aadesh calligraphic nameplate centered directly beneath */}
      <footer className="w-full max-w-full relative z-20 pb-0.5 sm:pb-1 flex flex-col items-center flex-shrink-0 overflow-x-clip">
        {/* User Interactive Hand Action Prompts: Skip Remaining Rounds or Show Hand */}
        {bothContractsMet && (
          <div className="mb-1.5 z-30 animate-pulse">
            <button
              type="button"
              onClick={handleSkipRemainingTricks}
              className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-neutral-950 font-cinzel text-xs sm:text-sm font-black uppercase tracking-wider shadow-2xl border-2 border-amber-200 cursor-pointer flex items-center gap-2 transition-transform transform hover:scale-105 active:scale-95"
            >
              <span>⚡</span>
              <span>Skip Remaining Rounds (Both Contracts Met)</span>
              <span className="text-[10px] bg-neutral-900/85 text-amber-200 px-2 py-0.5 rounded-full font-mono font-bold">
                T1: {team1.tricksWon}/{team1.totalBid} · T2: {team2.tricksWon}/{team2.totalBid}
              </span>
            </button>
          </div>
        )}

        {canShowHand && (
          <div className="mb-1.5 z-30">
            <button
              type="button"
              onClick={() => setIsShowHandOpen(true)}
              className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider shadow-2xl border-2 border-emerald-300 cursor-pointer flex items-center gap-2 transition-transform transform hover:scale-105 active:scale-95"
            >
              <span>🖐️</span>
              <span>Show Hand (Claim Remaining Tricks)</span>
              <span className="text-[10px] bg-black/60 text-emerald-200 px-2 py-0.5 rounded-full font-mono font-bold">
                Need {tricksNeeded} more trick{tricksNeeded !== 1 ? 's' : ''}
              </span>
            </button>
          </div>
        )}

        <PlayerHandFan
          cards={humanPlayer.hand}
          legalCards={
            gameState.phase === 'bidding' || gameState.phase === 'bidding_revision'
              ? humanPlayer.hand
              : humanLegalCards
          }
          isMyTurn={isHumanTurn}
          isBidding={gameState.phase === 'bidding' || gameState.phase === 'bidding_revision'}
          trumpSuit={gameState.trumpSuit}
          onPlayCard={handleHumanPlayCard}
        />

        {/* Aadesh Calligraphic Ivory Nameplate Centered Directly Beneath Fan */}
        <div className="mt-0">
          <PlayerSeat
            player={gameState.players.south}
            position="bottom"
            isCurrentTurn={isHumanTurn}
            isDealer={gameState.dealer === 'south'}
            teamScore={gameState.partnerships.team1.matchScore}
          />
        </div>
      </footer>

      {/* ================= MODALS & OVERLAYS ================= */}
      {/* Scoreboard Modal */}
      <ScoreboardModal
        isOpen={isScoreboardOpen}
        onClose={() => setIsScoreboardOpen(false)}
        players={gameState.players}
        partnerships={gameState.partnerships}
        handNumber={gameState.handNumber}
        matchConfig={gameState.matchConfig}
        isMatchOver={gameState.phase === 'match_completed'}
        matchWinner={gameState.matchWinner}
        onNextHand={handleNextHand}
        onRestartMatch={handleRestartMatch}
        autoDealCountdown={autoDealCountdown}
        isAutoDealPaused={isAutoDealPaused}
        onTogglePauseAutoDeal={() => setIsAutoDealPaused(p => !p)}
        language={appLanguage}
        onLanguageChange={handleAppLanguageChange}
      />

      {/* Interactive Windows Update-style Demo Walkthrough Modal */}
      <WalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
        onOpenRulebook={(lang) => {
          if (lang) handleAppLanguageChange(lang);
          setIsRulesOpen(true);
        }}
        language={appLanguage}
        onLanguageChange={handleAppLanguageChange}
      />

      {/* Playbook Rules Modal (Odia, Hindi, English) */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        initialLanguage={appLanguage}
        onLanguageChange={handleAppLanguageChange}
      />

      {/* Trump Card Inspection Modal */}
      <TrumpInspectModal
        isOpen={isTrumpInspectOpen}
        onClose={() => setIsTrumpInspectOpen(false)}
        trumpSuit={gameState.trumpSuit}
        trumpCard={gameState.trumpCard}
        language={appLanguage}
        onLanguageChange={handleAppLanguageChange}
      />

      {/* Match Configuration Modal */}
      <MatchConfigModal
        isOpen={isMatchConfigOpen}
        onClose={() => setIsMatchConfigOpen(false)}
        currentConfig={gameState.matchConfig}
        onApplyConfig={handleApplyMatchConfig}
        language={appLanguage}
        onLanguageChange={handleAppLanguageChange}
      />

      {/* Automated Playbook Test Runner Modal */}
      <TestRunnerModal
        isOpen={isTestRunnerOpen}
        onClose={() => setIsTestRunnerOpen(false)}
        language={appLanguage}
        onLanguageChange={handleAppLanguageChange}
      />

      {/* AI Tactics & Intelligence Modes Modal */}
      <TacticsModal
        isOpen={isTacticsOpen}
        onClose={() => setIsTacticsOpen(false)}
        currentMode={gameState.settings.intelligenceMode || 'legend'}
        onSelectMode={handleSetIntelligenceMode}
        language={appLanguage}
        onLanguageChange={handleAppLanguageChange}
      />

      {/* Show Hand / Claim Contract Modal */}
      <ShowHandModal
        isOpen={isShowHandOpen}
        onClose={() => setIsShowHandOpen(false)}
        gameState={gameState}
        onConfirmClaim={handleConfirmClaimShowHand}
        language={appLanguage}
        onLanguageChange={handleAppLanguageChange}
      />
    </div>
  );
};
