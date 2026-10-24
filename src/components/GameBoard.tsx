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

export const GameBoard: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const initial = initializeMatch({
      mode: 'default_points',
      targetPoints: 100,
      durationSeconds: 1800,
    });
    return startHand(initial);
  });

  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isScoreboardOpen, setIsScoreboardOpen] = useState(false);
  const [isTrumpInspectOpen, setIsTrumpInspectOpen] = useState(false);
  const [isMatchConfigOpen, setIsMatchConfigOpen] = useState(false);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);
  const [winningHighlightId, setWinningHighlightId] = useState<PlayerId | null>(null);

  const aiTimerRef = useRef<NodeJS.Timeout | null>(null);

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
   * Automatically open Scoreboard when a hand finishes
   */
  useEffect(() => {
    if (gameState.phase === 'round_summary' || gameState.phase === 'match_completed') {
      setIsScoreboardOpen(true);
    }
  }, [gameState.phase]);

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
      const aiBid = calculateAIBid(
        currentBidder.hand,
        gameState.trumpSuit,
        gameState.isJokerRevealHand,
        partnerBid
      );

      setGameState(prev => submitPlayerBid(prev, currentBidderId, aiBid));
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
          gameState.isJokerRevealHand
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
  const handleHumanSelectBid = (bid: number) => {
    sounds.playClick();
    setGameState(prev => submitPlayerBid(prev, 'south', bid));
  };

  /**
   * Human Player plays card
   */
  const handleHumanPlayCard = (card: Card) => {
    if (gameState.phase !== 'playing' || gameState.turn !== 'south') return;

    if (card.isDadajiJoker) {
      sounds.playDadajiFanfare();
    } else {
      sounds.playCardSnap();
    }

    setGameState(prev => executeCardPlay(prev, 'south', card));
  };

  /**
   * Advance to next hand
   */
  const handleNextHand = () => {
    setIsScoreboardOpen(false);
    sounds.playShuffleSound();
    setGameState(prev => advanceToNextHand(prev));
  };

  /**
   * Restart entire match
   */
  const handleRestartMatch = () => {
    setIsScoreboardOpen(false);
    sounds.playShuffleSound();
    const fresh = initializeMatch(gameState.matchConfig);
    setGameState(startHand(fresh));
  };

  /**
   * Redeal current hand
   */
  const handleRedealHand = () => {
    sounds.playShuffleSound();
    setGameState(prev => {
      const reset = { ...prev, matchWinner: null, phase: 'idle' as const };
      return startHand(reset);
    });
  };

  /**
   * Apply new Match Configuration (Point target or Time Mode)
   */
  const handleApplyMatchConfig = (config: MatchConfig) => {
    sounds.playShuffleSound();
    const fresh = initializeMatch(config);
    setGameState(startHand(fresh));
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
                  gameState.players.north.bid
                )}
                partnerName="Hriday"
                partnerBid={gameState.players.north.bid}
                players={gameState.players}
                onSelectBid={handleHumanSelectBid}
              />
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
      <footer className="w-full relative z-20 pb-0.5 sm:pb-1 flex flex-col items-center flex-shrink-0">
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
      />

      {/* Playbook Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* Trump Card Inspection Modal */}
      <TrumpInspectModal
        isOpen={isTrumpInspectOpen}
        onClose={() => setIsTrumpInspectOpen(false)}
        trumpSuit={gameState.trumpSuit}
        trumpCard={gameState.trumpCard}
      />

      {/* Match Configuration Modal */}
      <MatchConfigModal
        isOpen={isMatchConfigOpen}
        onClose={() => setIsMatchConfigOpen(false)}
        currentConfig={gameState.matchConfig}
        onApplyConfig={handleApplyMatchConfig}
      />

      {/* Automated Playbook Test Runner Modal */}
      <TestRunnerModal
        isOpen={isTestRunnerOpen}
        onClose={() => setIsTestRunnerOpen(false)}
      />
    </div>
  );
};
