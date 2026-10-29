import {
  Card,
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

/**
 * Initializes a new match state
 */
export function initializeMatch(
  config: MatchConfig = { mode: 'default_points', targetPoints: 100, durationSeconds: 1800 }
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
    players: { ...INITIAL_PLAYERS },
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
    lastTrickWinner: null,
    matchWinner: null,
    settings: {
      soundEnabled: true,
      gameSpeed: 'normal',
      autoSortHand: true,
    },
  };
}

/**
 * Deals a new hand
 */
export function startHand(state: GameState, customDeck?: Card[]): GameState {
  if (state.matchWinner) {
    throw new Error('Cannot start new hand: match is already completed.');
  }

  const deal = dealHand(state.dealer, customDeck);

  // Playability Rule: If any player has no face cards (A, K, Q, J), no trumps, and no Joker,
  // the game cannot be played. Reshuffle and redeal!
  const playability = validateDealPlayability(deal.hands, deal.trumpSuit);
  if (!playability.isPlayable) {
    const unplayableName = state.players[playability.unplayablePlayerId!].name;
    return startHand({
      ...state,
      statusMessage: `${unplayableName} was dealt no face cards (A,K,Q,J), no trumps, and no Joker. Hand cannot be played — reshuffled & redealt!`,
    });
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

  const statusMsg = deal.isJokerRevealHand
    ? 'Joker revealed on final card! No permanent trump suit. The suit led in each trick becomes highest suit.'
    : `Trump is ${deal.trumpSuit?.toUpperCase()} (revealed by final card: ${deal.finalCard.shortName}). Bidding phase active.`;

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
    lastTrickWinner: null,
  };
}

/**
 * Submits an individual bid during the bidding phase
 */
export function submitPlayerBid(state: GameState, playerId: PlayerId, bid: number): GameState {
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

  if (!allBidded) {
    // Advance to next bidder in counter-clockwise sequence
    const nextIdx = state.biddingCurrentIndex + 1;
    const nextBidder = state.biddingOrder[nextIdx];
    return {
      ...state,
      players: updatedPlayers,
      biddingCurrentIndex: nextIdx,
      statusMessage: `${state.players[playerId].name} bid ${bid}. Waiting for ${state.players[nextBidder].name}'s bid.`,
    };
  }

  // All 4 players have submitted bids: validate both partnerships!
  // Per Section 4.1: If both players of same team bid zero, default 2 is given as default bid.
  const roundValidation = validateAllBids(bidsRecord, 'disabled', true);

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
      return startHand({
        ...state,
        dealer: nextDealer,
        statusMessage: `${roundValidation.reshuffleReason} Dealer rotates to ${state.players[nextDealer].name}.`,
      });
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
  if (card.isDadajiJoker) {
    if (updatedTrick.length === 1) {
      playNotice = `${state.players[playerId].name} led with Dadaji Joker (counted as 2 of Spades; lead suit is Spades).`;
    } else if (state.trickNumber === 13) {
      playNotice = `${state.players[playerId].name} played Dadaji Joker (devalued to 2 of Spades in final trick).`;
    } else {
      playNotice = `${state.players[playerId].name} played Dadaji Joker (Supreme Trump)!`;
    }
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
 * Resolves a completed trick
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

  // If 13 tricks are completed, resolve hand scores!
  if (state.trickNumber >= 13) {
    const scores = calculateHandScores(
      updatedPartnerships.team1.totalBid,
      updatedPartnerships.team1.tricksWon,
      updatedPartnerships.team2.totalBid,
      updatedPartnerships.team2.tricksWon
    );

    const team1NewScore = updatedPartnerships.team1.matchScore + scores.team1.scoreDelta;
    const team2NewScore = updatedPartnerships.team2.matchScore + scores.team2.scoreDelta;

    const finalPartnerships = {
      team1: {
        ...updatedPartnerships.team1,
        matchScore: team1NewScore,
        roundScoreHistory: [...updatedPartnerships.team1.roundScoreHistory, scores.team1.scoreDelta],
      },
      team2: {
        ...updatedPartnerships.team2,
        matchScore: team2NewScore,
        roundScoreHistory: [...updatedPartnerships.team2.roundScoreHistory, scores.team2.scoreDelta],
      },
    };

    // Evaluate match status
    const matchStatus = evaluateMatchStatus(
      state.matchConfig,
      team1NewScore,
      team2NewScore,
      false, // Hand is finished
      state.isTimeExpired
    );

    return {
      ...state,
      players: updatedPlayers,
      partnerships: finalPartnerships,
      currentTrick: [],
      trickHistory: updatedHistory,
      phase: matchStatus.isMatchOver ? 'match_completed' : 'round_summary',
      matchWinner: matchStatus.winner,
      statusMessage: matchStatus.isMatchOver
        ? `Match finished! ${matchStatus.reason}`
        : `Hand ${state.handNumber} complete! Team 1: ${scores.team1.scoreDelta > 0 ? '+' : ''}${scores.team1.scoreDelta} pts, Team 2: ${scores.team2.scoreDelta > 0 ? '+' : ''}${scores.team2.scoreDelta} pts.`,
    };
  }

  // Advance to next trick
  return {
    ...state,
    players: updatedPlayers,
    partnerships: updatedPartnerships,
    currentTrick: [],
    trickHistory: updatedHistory,
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
