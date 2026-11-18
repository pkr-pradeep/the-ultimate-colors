import {
  Card,
  EarlyTerminationCase,
  EarlyTerminationNotification,
  GamePhase,
  GameState,
  MatchConfig,
  Player,
  PlayerId,
  TeamId,
  TrickCard,
} from '../types/game';
import {
  dealHand,
  getNextPlayerCounterClockwise,
  getRandomInitialDealer,
  validateDealPlayability,
} from './dealing';
import { getBiddingSequence, validateAllBids, validateIndividualBid, validatePartnershipBid } from './bidding';
import { getLegalCards, validateCardPlay } from './cardPlay';
import { determineTrickWinner } from './trickWinner';
import { calculateHandScores } from './scoring';
import { evaluateMatchStatus } from './match';
import { evaluateShowHand, ShowHandAnalysis, verifyUserSelectedCards } from './showHand';

export const INITIAL_PLAYERS: Record<PlayerId, Player> = {
  south: {
    id: 'south',
    name: 'Aadesh',
    title: 'You',
    avatarSeed: 'south',
    teamId: 'team1',
    isHuman: true,
    hand: [],
    bid: null,
    tricksWon: 0,
  },
  east: {
    id: 'east',
    name: 'Mainaa',
    title: 'Opponent',
    avatarSeed: 'east',
    teamId: 'team2',
    isHuman: false,
    hand: [],
    bid: null,
    tricksWon: 0,
  },
  north: {
    id: 'north',
    name: 'Hriday',
    title: 'Partner',
    avatarSeed: 'north',
    teamId: 'team1',
    isHuman: false,
    hand: [],
    bid: null,
    tricksWon: 0,
  },
  west: {
    id: 'west',
    name: 'Shilaa',
    title: 'Opponent',
    avatarSeed: 'west',
    teamId: 'team2',
    isHuman: false,
    hand: [],
    bid: null,
    tricksWon: 0,
  },
};

export const EARLY_TERMINATION_NOTIFICATION_DURATION_MS = 2000;

export type ContractOutcomeStatus = 'succeeded' | 'failed' | 'achievable';

export interface ContractOutcomeEvaluation {
  tricksPlayed: number;
  remainingTricks: number;
  team1Failed: boolean;
  team2Failed: boolean;
  team1Successful: boolean;
  team2Successful: boolean;
  team1Status: ContractOutcomeStatus;
  team2Status: ContractOutcomeStatus;
  bothOutcomesDetermined: boolean;
  bothSucceeded: boolean;
  shouldTerminateOnFailure: boolean;
}

/**
 * Evaluates whether each partnership's contract is mathematically succeeded, failed, or still achievable
 * after a trick has been completed and recorded.
 */
export function evaluateContractOutcomes(
  team1Bid: number,
  team1TricksWon: number,
  team2Bid: number,
  team2TricksWon: number,
  tricksPlayed: number
): ContractOutcomeEvaluation {
  const clampedPlayed = Math.max(0, Math.min(13, tricksPlayed));
  const remainingTricks = 13 - clampedPlayed;

  const team1Failed = team1TricksWon + remainingTricks < team1Bid;
  const team2Failed = team2TricksWon + remainingTricks < team2Bid;
  const team1Successful = team1TricksWon >= team1Bid;
  const team2Successful = team2TricksWon >= team2Bid;

  const team1Status: ContractOutcomeStatus = team1Successful
    ? 'succeeded'
    : team1Failed
    ? 'failed'
    : 'achievable';

  const team2Status: ContractOutcomeStatus = team2Successful
    ? 'succeeded'
    : team2Failed
    ? 'failed'
    : 'achievable';

  const bothOutcomesDetermined = team1Status !== 'achievable' && team2Status !== 'achievable';
  const bothSucceeded = team1Status === 'succeeded' && team2Status === 'succeeded';
  const shouldTerminateOnFailure =
    bothOutcomesDetermined && (team1Status === 'failed' || team2Status === 'failed');

  return {
    tricksPlayed: clampedPlayed,
    remainingTricks,
    team1Failed,
    team2Failed,
    team1Successful,
    team2Successful,
    team1Status,
    team2Status,
    bothOutcomesDetermined,
    bothSucceeded,
    shouldTerminateOnFailure,
  };
}

/**
 * Builds the dynamic 2-second early termination notification when a hand ends early
 * due to failed contracts (never when both succeed or while either remains achievable).
 */
export function buildEarlyTerminationNotification(
  team1Bid: number,
  team1TricksWon: number,
  team2Bid: number,
  team2TricksWon: number,
  tricksPlayed: number,
  prevTeam1TricksWon: number = team1TricksWon,
  prevTeam2TricksWon: number = team2TricksWon
): EarlyTerminationNotification | null {
  const currentEval = evaluateContractOutcomes(
    team1Bid,
    team1TricksWon,
    team2Bid,
    team2TricksWon,
    tricksPlayed
  );

  if (tricksPlayed >= 13 || !currentEval.shouldTerminateOnFailure) {
    return null;
  }

  const prevTricksPlayed = Math.max(0, tricksPlayed - 1);
  const prevEval = evaluateContractOutcomes(
    team1Bid,
    prevTeam1TricksWon,
    team2Bid,
    prevTeam2TricksWon,
    prevTricksPlayed
  );

  const team1TricksNeeded = Math.max(0, team1Bid - team1TricksWon);
  const team2TricksNeeded = Math.max(0, team2Bid - team2TricksWon);

  let caseType: EarlyTerminationCase;
  let title: string;
  let message: string;

  if (currentEval.team1Failed && currentEval.team2Failed) {
    caseType = 'both_failed';
    title = 'Both teams have failed their bids!';
    message = 'Neither team can fulfil its contract with the remaining tricks.';
  } else if (currentEval.team1Successful && currentEval.team2Failed) {
    if (prevEval.team1Successful && !prevEval.team2Failed) {
      caseType = 'team_b_failed';
      title = 'Team B cannot fulfil its bid!';
      message = "Team A has secured enough tricks to make Team B's contract impossible.";
    } else {
      caseType = 'one_succeeded_one_failed';
      title = 'Contract outcome decided!';
      message = 'Team A has fulfilled its bid. Team B cannot fulfil its contract.';
    }
  } else {
    if (prevEval.team2Successful && !prevEval.team1Failed) {
      caseType = 'team_a_failed';
      title = 'Team A cannot fulfil its bid!';
      message = "Team B has secured enough tricks to make Team A's contract impossible.";
    } else {
      caseType = 'one_succeeded_one_failed';
      title = 'Contract outcome decided!';
      message = 'Team B has fulfilled its bid. Team A cannot fulfil its contract.';
    }
  }

  return {
    caseType,
    title,
    message,
    team1Bid,
    team1TricksWon,
    team1Status: currentEval.team1Failed ? 'failed' : 'succeeded',
    team1TricksNeeded,
    team2Bid,
    team2TricksWon,
    team2Status: currentEval.team2Failed ? 'failed' : 'succeeded',
    team2TricksNeeded,
    remainingTricks: currentEval.remainingTricks,
    tricksPlayed: currentEval.tricksPlayed,
    durationMs: EARLY_TERMINATION_NOTIFICATION_DURATION_MS,
  };
}

function createFreshPlayers(): Record<PlayerId, Player> {
  return {
    south: { ...INITIAL_PLAYERS.south, hand: [] },
    east: { ...INITIAL_PLAYERS.east, hand: [] },
    north: { ...INITIAL_PLAYERS.north, hand: [] },
    west: { ...INITIAL_PLAYERS.west, hand: [] },
  };
}

/**
 * Initializes a new match state
 */
export function initializeMatch(
  config: MatchConfig = { mode: 'default_points', targetPoints: 100, durationSeconds: 1800 },
  preservedSettings?: GameState['settings']
): GameState {
  const initialDealer = getRandomInitialDealer();

  return {
    matchConfig: config,
    handNumber: 1,
    timeRemainingSeconds: config.mode === 'time' ? config.durationSeconds : null,
    isTimerRunning: config.mode === 'time',
    isTimeExpired: false,
    dealer: initialDealer,
    leadPlayer: getNextPlayerCounterClockwise(initialDealer),
    turn: getNextPlayerCounterClockwise(initialDealer),
    trumpSuit: null,
    trumpCard: null,
    isJokerRevealHand: false,
    currentTrick: [],
    trickNumber: 1,
    trickHistory: [],
    players: createFreshPlayers(),
    partnerships: {
      team1: {
        id: 'team1',
        name: 'Team 1 (Aadesh & Hriday)',
        playerIds: ['south', 'north'],
        totalBid: 0,
        tricksWon: 0,
        matchScore: 0,
        roundScoreHistory: [],
      },
      team2: {
        id: 'team2',
        name: 'Team 2 (Shilaa & Mainaa)',
        playerIds: ['west', 'east'],
        totalBid: 0,
        tricksWon: 0,
        matchScore: 0,
        roundScoreHistory: [],
      },
    },
    biddingOrder: [],
    biddingCurrentIndex: 0,
    invalidPartnershipId: null,
    phase: 'idle',
    statusMessage: 'Ready to deal cards.',
    reshuffleReason: null,
    earlyTerminationReason: null,
    earlyTerminationNotification: null,
    lastTrickWinner: null,
    matchWinner: null,
    settings: preservedSettings
      ? { ...preservedSettings }
      : {
          soundEnabled: true,
          gameSpeed: 'normal',
          autoSortHand: true,
          intelligenceMode: 'legend',
        },
  };
}

/**
 * Deals a new hand
 */
export function startHand(state: GameState, customDeck?: Card[], reshuffleReason?: string | null): GameState {
  if (state.matchWinner) {
    throw new Error('Cannot start new hand: match is already completed.');
  }

  const deal = dealHand(state.dealer, customDeck);

  // Playability Rule: If any player has no face cards (A, K, Q, J), no trumps, and no Joker,
  // the game cannot be played. Reshuffle and redeal!
  const playability = validateDealPlayability(deal.hands, deal.trumpSuit);
  if (!playability.isPlayable) {
    const unplayableName = state.players[playability.unplayablePlayerId!].name;
    const reason = `${unplayableName} had no face cards (A,K,Q,J), no trumps, and no Joker (Unplayable Hand). Cards reshuffled & redealt!`;
    return startHand(state, customDeck, reason);
  }

  const biddingSequence = getBiddingSequence(state.dealer);

  // Reset player bids and tricks for this hand
  const updatedPlayers = { ...state.players };
  for (const pid of ['south', 'east', 'north', 'west'] as PlayerId[]) {
    updatedPlayers[pid] = {
      ...updatedPlayers[pid],
      hand: deal.hands[pid],
      bid: null,
      tricksWon: 0,
    };
  }

  // Reset partnership bids and tricks
  const updatedPartnerships = { ...state.partnerships };
  updatedPartnerships.team1 = {
    ...updatedPartnerships.team1,
    totalBid: 0,
    tricksWon: 0,
  };
  updatedPartnerships.team2 = {
    ...updatedPartnerships.team2,
    totalBid: 0,
    tricksWon: 0,
  };

  const finalReshuffleReason = reshuffleReason !== undefined ? reshuffleReason : (state.reshuffleReason || null);

  const baseStatusMsg = deal.isJokerRevealHand
    ? 'Joker revealed on final card! No permanent trump suit. The suit led in each trick becomes highest suit.'
    : `Trump is ${deal.trumpSuit?.toUpperCase()} (revealed by final card: ${deal.finalCard.shortName}). Bidding phase active.`;

  const statusMsg = finalReshuffleReason
    ? `🔀 Reshuffled: ${finalReshuffleReason} — ${baseStatusMsg}`
    : baseStatusMsg;

  return {
    ...state,
    trumpSuit: deal.trumpSuit,
    trumpCard: deal.finalCard,
    isJokerRevealHand: deal.isJokerRevealHand,
    currentTrick: [],
    trickNumber: 1,
    trickHistory: [],
    players: updatedPlayers,
    partnerships: updatedPartnerships,
    leadPlayer: deal.firstLeader,
    turn: deal.firstLeader,
    biddingOrder: biddingSequence,
    biddingCurrentIndex: 0,
    invalidPartnershipId: null,
    phase: 'bidding',
    statusMessage: statusMsg,
    reshuffleReason: finalReshuffleReason,
    earlyTerminationReason: null,
    earlyTerminationNotification: null,
    lastTrickWinner: null,
  };
}

/**
 * Submits an individual bid during the bidding phase
 */
export function submitPlayerBid(
  state: GameState,
  playerId: PlayerId,
  bid: number,
  bidReason?: string
): GameState {
  if (state.phase !== 'bidding' && state.phase !== 'bidding_revision') {
    throw new Error('Cannot submit bid: game is not in bidding phase.');
  }

  const validation = validateIndividualBid(bid);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid individual bid.');
  }

  const updatedPlayers = {
    ...state.players,
    [playerId]: {
      ...state.players[playerId],
      bid,
      bidTacticalReason: bidReason,
    },
  };

  // Check if all players have submitted bids
  const bidsRecord: Record<PlayerId, number | null> = {
    south: updatedPlayers.south.bid,
    east: updatedPlayers.east.bid,
    north: updatedPlayers.north.bid,
    west: updatedPlayers.west.bid,
  };

  const allBidded = Object.values(bidsRecord).every(b => b !== null);

  const reasonTag = bidReason ? ` [${bidReason}]` : '';

  if (!allBidded) {
    // Advance to next bidder in counter-clockwise sequence
    const nextIdx = state.biddingCurrentIndex + 1;
    const nextBidder = state.biddingOrder[nextIdx];
    return {
      ...state,
      players: updatedPlayers,
      biddingCurrentIndex: nextIdx,
      statusMessage: `${state.players[playerId].name} bid ${bid}${reasonTag}. Waiting for ${state.players[nextBidder].name}'s bid.`,
    };
  }

  // All 4 players have submitted bids: validate both partnerships!
  // Reshuffle rule: Reshuffle will happen when summation of two team bids is not greater than or equal to six (sum < 6).
  // Meaning if Team A bids 4, then for play to happen Team B must bid at least 2 (4 + 2 = 6).
  const roundValidation = validateAllBids(bidsRecord, 'sum_below_6', true);

  const team1Effective = roundValidation.team1Validation.effectiveBid;
  const team2Effective = roundValidation.team2Validation.effectiveBid;

  const updatedPartnerships = {
    ...state.partnerships,
    team1: { ...state.partnerships.team1, totalBid: team1Effective },
    team2: { ...state.partnerships.team2, totalBid: team2Effective },
  };

  if (!roundValidation.isValid) {
    if (roundValidation.requiresReshuffle) {
      // Section 4.1 reshuffle condition triggered: reshuffle by next right
      const nextDealer = getNextPlayerCounterClockwise(state.dealer);
      const reason = `${roundValidation.reshuffleReason} Dealer rotates counter-clockwise to ${state.players[nextDealer].name}.`;
      return startHand({
        ...state,
        dealer: nextDealer,
      }, undefined, reason);
    }

    // Partnership bid minimum rule (< 2 tricks): Hand CANNOT start!
    const invalidTeam = roundValidation.invalidTeamId;
    return {
      ...state,
      players: updatedPlayers,
      partnerships: updatedPartnerships,
      phase: 'bidding_revision',
      invalidPartnershipId: invalidTeam,
      statusMessage: `Partnership restriction: ${roundValidation.message} Please revise bids to meet the 2-trick minimum.`,
    };
  }

  // Both partnerships meet the 2-trick minimum: Start Hand!
  const defaultNotice =
    roundValidation.team1Validation.wasDefaultedToTwo || roundValidation.team2Validation.wasDefaultedToTwo
      ? ' (Team with 0+0 bids assigned default 2 tricks)'
      : '';

  return {
    ...state,
    players: updatedPlayers,
    partnerships: updatedPartnerships,
    phase: 'playing',
    invalidPartnershipId: null,
    turn: state.leadPlayer,
    statusMessage: `All bids confirmed (Team 1: ${team1Effective}, Team 2: ${team2Effective})${defaultNotice}. Trick 1 begins! ${state.players[state.leadPlayer].name} leads.`,
  };
}

/**
 * Executes a card play from the active player
 */
export function executeCardPlay(state: GameState, playerId: PlayerId, card: Card): GameState {
  if (state.phase !== 'playing') {
    throw new Error('Cannot play card: hand is not in playing phase.');
  }

  // Validate move with authoritative validator
  const validation = validateCardPlay(
    card,
    playerId,
    state.turn,
    state.players[playerId].hand,
    state.currentTrick,
    state.trickNumber,
    state.trumpSuit
  );

  if (!validation.isValid) {
    throw new Error(validation.error || 'Illegal card play.');
  }

  const updatedHand = state.players[playerId].hand.filter(c => c.id !== card.id);
  const updatedTrick: TrickCard[] = [
    ...state.currentTrick,
    { playerId, card, timestamp: Date.now() },
  ];

  const updatedPlayers = {
    ...state.players,
    [playerId]: {
      ...state.players[playerId],
      hand: updatedHand,
    },
  };

  // Check if trick completed (4 cards played)
  if (updatedTrick.length === 4) {
    const outcome = determineTrickWinner(
      updatedTrick,
      state.trickNumber,
      state.trumpSuit,
      state.isJokerRevealHand
    );

    return {
      ...state,
      players: updatedPlayers,
      currentTrick: updatedTrick,
      phase: 'trick_completed',
      lastTrickWinner: outcome.winnerId,
      statusMessage: `${state.players[outcome.winnerId].name} takes the trick with ${outcome.winningCard.shortName}! (${outcome.winningReason})`,
    };
  }

  // Advance turn counter-clockwise
  const nextPlayer = getNextPlayerCounterClockwise(playerId);

  let playNotice = `${state.players[playerId].name} played ${card.shortName}.`;
  const tactic = (card as any).tacticalTactic;

  if (card.isDadajiJoker) {
    if (updatedTrick.length === 1) {
      playNotice = `${state.players[playerId].name} led with Dadaji Joker (counted as 2 of Spades; lead suit is Spades).`;
    } else if (state.trickNumber === 13) {
      playNotice = `${state.players[playerId].name} played Dadaji Joker (devalued to 2 of Spades in final trick).`;
    } else if (tactic) {
      playNotice = `${state.players[playerId].name} played Dadaji Joker! [${tactic}]`;
    } else {
      playNotice = `${state.players[playerId].name} played Dadaji Joker (Supreme Trump)!`;
    }
  } else if (tactic) {
    playNotice = `${state.players[playerId].name} played ${card.shortName}. [${tactic}]`;
  }

  return {
    ...state,
    players: updatedPlayers,
    currentTrick: updatedTrick,
    turn: nextPlayer,
    statusMessage: `${playNotice} ${state.players[nextPlayer].name}'s turn.`,
  };
}

/**
 * Shared internal helper that computes hand scores once, updates cumulative match scores,
 * evaluates overall match winner, and transitions cleanly out of active play.
 */
function finalizeHandWithScoring(
  state: GameState,
  players: GameState['players'],
  partnerships: GameState['partnerships'],
  trickHistory: GameState['trickHistory'],
  buildStatusMessage: (params: {
    team1Delta: number;
    team2Delta: number;
    matchStatus: ReturnType<typeof evaluateMatchStatus>;
  }) => string,
  earlyTerminationReason: string | null = null,
  earlyTerminationNotification: EarlyTerminationNotification | null = null
): GameState {
  const scores = calculateHandScores(
    partnerships.team1.totalBid,
    partnerships.team1.tricksWon,
    partnerships.team2.totalBid,
    partnerships.team2.tricksWon
  );

  const team1NewScore = partnerships.team1.matchScore + scores.team1.scoreDelta;
  const team2NewScore = partnerships.team2.matchScore + scores.team2.scoreDelta;

  const finalPartnerships: GameState['partnerships'] = {
    team1: {
      ...partnerships.team1,
      matchScore: team1NewScore,
      roundScoreHistory: [...partnerships.team1.roundScoreHistory, scores.team1.scoreDelta],
    },
    team2: {
      ...partnerships.team2,
      matchScore: team2NewScore,
      roundScoreHistory: [...partnerships.team2.roundScoreHistory, scores.team2.scoreDelta],
    },
  };

  const matchStatus = evaluateMatchStatus(
    state.matchConfig,
    team1NewScore,
    team2NewScore,
    false, // Hand is finished
    state.isTimeExpired
  );

  return {
    ...state,
    players,
    partnerships: finalPartnerships,
    currentTrick: [],
    trickHistory,
    lastTrickWinner: null,
    isTimerRunning: matchStatus.isMatchOver ? false : state.isTimerRunning,
    phase: matchStatus.isMatchOver ? 'match_completed' : 'round_summary',
    matchWinner: matchStatus.winner,
    earlyTerminationReason,
    earlyTerminationNotification,
    statusMessage: buildStatusMessage({
      team1Delta: scores.team1.scoreDelta,
      team2Delta: scores.team2.scoreDelta,
      matchStatus,
    }),
  };
}

/**
 * Resolves a completed trick and checks hand/contract termination conditions
 */
export function resolveCompletedTrick(state: GameState): GameState {
  if (state.phase !== 'trick_completed' || !state.lastTrickWinner) {
    return state;
  }

  const winnerId = state.lastTrickWinner;
  const winner = state.players[winnerId];
  const winnerTeamId = winner.teamId;

  // Add trick to winner and partnership
  const updatedWinner = {
    ...winner,
    tricksWon: winner.tricksWon + 1,
  };

  const updatedPlayers = {
    ...state.players,
    [winnerId]: updatedWinner,
  };

  const updatedPartnerships = {
    ...state.partnerships,
    [winnerTeamId]: {
      ...state.partnerships[winnerTeamId],
      tricksWon: state.partnerships[winnerTeamId].tricksWon + 1,
    },
  };

  const outcome = determineTrickWinner(
    state.currentTrick,
    state.trickNumber,
    state.trumpSuit,
    state.isJokerRevealHand
  );

  const trickRecord = {
    trickNumber: state.trickNumber,
    leadPlayer: state.leadPlayer,
    winnerId,
    winningCard: outcome.winningCard,
    cards: [...state.currentTrick],
  };

  const updatedHistory = [...state.trickHistory, trickRecord];

  // Check contract outcomes after trick winner has been recorded
  const contractEval = evaluateContractOutcomes(
    updatedPartnerships.team1.totalBid,
    updatedPartnerships.team1.tricksWon,
    updatedPartnerships.team2.totalBid,
    updatedPartnerships.team2.tricksWon,
    state.trickNumber
  );

  const isFinalTrick = state.trickNumber >= 13;
  const isEarlyFailureTermination = !isFinalTrick && contractEval.shouldTerminateOnFailure;

  // Terminate when all 13 tricks are played OR when both contracts are determined with at least one failure
  if (isFinalTrick || isEarlyFailureTermination) {
    const earlyNotification = isEarlyFailureTermination
      ? buildEarlyTerminationNotification(
          updatedPartnerships.team1.totalBid,
          updatedPartnerships.team1.tricksWon,
          updatedPartnerships.team2.totalBid,
          updatedPartnerships.team2.tricksWon,
          state.trickNumber,
          state.partnerships.team1.tricksWon,
          state.partnerships.team2.tricksWon
        )
      : null;

    const earlyReason = isEarlyFailureTermination
      ? `Hand concluded early after Trick ${state.trickNumber} of 13: ${
          contractEval.team1Failed && contractEval.team2Failed
            ? 'both teams can no longer meet their contracts.'
            : contractEval.team1Failed
            ? `Team A failed its contract while Team B met its bid.`
            : `Team B failed its contract while Team A met its bid.`
        }`
      : null;

    return finalizeHandWithScoring(
      state,
      updatedPlayers,
      updatedPartnerships,
      updatedHistory,
      ({ team1Delta, team2Delta, matchStatus }) => {
        if (matchStatus.isMatchOver) {
          return `Match finished! ${matchStatus.reason}`;
        }
        if (isEarlyFailureTermination) {
          return `${earlyReason} Team A: ${team1Delta > 0 ? '+' : ''}${team1Delta} pts, Team B: ${team2Delta > 0 ? '+' : ''}${team2Delta} pts.`;
        }
        return `Hand ${state.handNumber} complete! Team A: ${team1Delta > 0 ? '+' : ''}${team1Delta} pts, Team B: ${team2Delta > 0 ? '+' : ''}${team2Delta} pts.`;
      },
      earlyReason,
      earlyNotification
    );
  }

  // Advance to next trick
  return {
    ...state,
    players: updatedPlayers,
    partnerships: updatedPartnerships,
    currentTrick: [],
    trickHistory: updatedHistory,
    lastTrickWinner: null,
    trickNumber: state.trickNumber + 1,
    leadPlayer: winnerId,
    turn: winnerId,
    phase: 'playing',
    statusMessage: `Trick ${state.trickNumber + 1} of 13. ${winner.name} leads.`,
  };
}

/**
 * Advances to the next hand after round summary
 */
export function advanceToNextHand(state: GameState): GameState {
  if (state.matchWinner) {
    throw new Error('Match is already finished.');
  }

  // Rotate dealer counter-clockwise
  const nextDealer = getNextPlayerCounterClockwise(state.dealer);

  const nextState: GameState = {
    ...state,
    handNumber: state.handNumber + 1,
    dealer: nextDealer,
    phase: 'idle',
  };

  return startHand(nextState);
}

/**
 * Confirms starting a completely new match after a completed match ("Play Again").
 * Idempotent guard: if called repeatedly before React unmounts the modal, only the first call
 * when match is completed will initialize a new match; subsequent calls return state unchanged.
 */
export function confirmPlayAgain(state: GameState): GameState {
  if (state.phase !== 'match_completed' && !state.matchWinner) {
    return state;
  }

  const freshMatch = initializeMatch(state.matchConfig, state.settings);
  return startHand(freshMatch);
}

/**
 * Clears/releases completed match state when exiting to main menu ("Exit Game")
 * without starting a new match or retaining old cumulative scores.
 */
export function exitCompletedMatch(state: GameState): GameState {
  return initializeMatch(state.matchConfig, state.settings);
}

/**
 * Allows the actual user (South) to skip remaining rounds once both teams have achieved their bids
 * (e.g. Team 1 bid 5 has >= 5 tricks, Team 2 bid 6 has >= 6 tricks).
 * Hand concludes immediately and awards scores according to contracts achieved.
 */
export function skipRemainingTricks(state: GameState): GameState {
  if (state.phase !== 'playing' && state.phase !== 'trick_completed') {
    throw new Error('Can only skip remaining tricks during active play.');
  }

  const team1 = state.partnerships.team1;
  const team2 = state.partnerships.team2;

  if (team1.tricksWon < team1.totalBid || team2.tricksWon < team2.totalBid) {
    throw new Error('Both teams must achieve their bids before skipping remaining rounds.');
  }

  return finalizeHandWithScoring(
    state,
    state.players,
    state.partnerships,
    state.trickHistory,
    ({ team1Delta, team2Delta }) =>
      `Both contracts achieved! Hand concluded early by user. Team 1: ${team1.tricksWon}/${team1.totalBid} tricks (${team1Delta >= 0 ? '+' : ''}${team1Delta} pts), Team 2: ${team2.tricksWon}/${team2.totalBid} tricks (${team2Delta >= 0 ? '+' : ''}${team2Delta} pts).`,
    `Both teams achieved their contracts by Trick ${state.trickNumber} of 13.`
  );
}

/**
 * Evaluates and executes the "Show Hand" (claim remaining tricks) rule:
 * "Similarly lets say opponent has already got their bids, your team yet to complete the bids,
 * if you are so sure that you have those cards which can give you remaining numbers there would be show option and done.
 * But if fail, then as part of penalty, total score-current bid."
 */
export function claimShowHand(
  state: GameState,
  selectedCardIdsOrForceSuccess?: string[] | boolean
): GameState {
  if (state.phase !== 'playing' && state.phase !== 'trick_completed') {
    throw new Error('Can only claim show hand during active play.');
  }

  const team1 = state.partnerships.team1;
  const neededTricks = Math.max(0, team1.totalBid - team1.tricksWon);

  let isSuccess: boolean;
  let successMsg: string;
  let failMsg: string;

  if (Array.isArray(selectedCardIdsOrForceSuccess)) {
    const verification = verifyUserSelectedCards(state, selectedCardIdsOrForceSuccess);
    isSuccess = verification.isValid;
    successMsg = `Show Hand Verified! Selected cards guaranteed ${verification.verifiedWinnersCount} winning trick(s) for the needed ${verification.neededTricks} trick(s). Contract fulfilled!`;
    failMsg = `Show Hand Verification Failed! ${verification.summary} Penalty applied: Total score reduced by bid (${team1.matchScore} - ${team1.totalBid} = ${team1.matchScore - team1.totalBid})!`;
  } else if (typeof selectedCardIdsOrForceSuccess === 'boolean') {
    isSuccess = selectedCardIdsOrForceSuccess;
    const analysis = evaluateShowHand(state);
    successMsg = `Show Hand Successful! Team 1 proved ${analysis.guaranteedWinners} winning card(s) for ${analysis.neededTricks} needed trick(s). Contract fulfilled!`;
    failMsg = `Show Hand Failed! Lacked guaranteed winners (${analysis.guaranteedWinners}/${analysis.neededTricks}). Penalty applied: Total score reduced by bid (${team1.matchScore} - ${team1.totalBid} = ${team1.matchScore - team1.totalBid})!`;
  } else {
    const analysis = evaluateShowHand(state);
    isSuccess = analysis.isGuaranteedSuccess;
    successMsg = `Show Hand Successful! Team 1 proved ${analysis.guaranteedWinners} winning card(s) for ${analysis.neededTricks} needed trick(s). Contract fulfilled!`;
    failMsg = `Show Hand Failed! Lacked guaranteed winners (${analysis.guaranteedWinners}/${analysis.neededTricks}). Penalty applied: Total score reduced by bid (${team1.matchScore} - ${team1.totalBid} = ${team1.matchScore - team1.totalBid})!`;
  }

  if (isSuccess) {
    const finalTeam1Tricks = Math.max(team1.tricksWon + neededTricks, team1.totalBid);
    const updatedPartnerships = {
      ...state.partnerships,
      team1: {
        ...team1,
        tricksWon: finalTeam1Tricks,
      },
    };

    return finalizeHandWithScoring(
      state,
      state.players,
      updatedPartnerships,
      state.trickHistory,
      ({ team1Delta }) => `${successMsg} (${team1Delta >= 0 ? '+' : ''}${team1Delta} pts)`
    );
  } else {
    return finalizeHandWithScoring(
      state,
      state.players,
      state.partnerships,
      state.trickHistory,
      () => failMsg
    );
  }
}


