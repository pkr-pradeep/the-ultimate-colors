import { PlayerId, TeamId } from '../types/game';
import { getNextPlayerCounterClockwise } from './dealing';

export interface PartnershipBidValidation {
  teamId: TeamId;
  totalBid: number;
  effectiveBid: number;
  wasDefaultedToTwo: boolean;
  isValid: boolean;
  message: string;
}

export interface BiddingRoundValidation {
  isValid: boolean;
  team1Validation: PartnershipBidValidation;
  team2Validation: PartnershipBidValidation;
  invalidTeamId: TeamId | null;
  requiresReshuffle: boolean;
  reshuffleReason?: string;
  message: string;
}

/**
 * Validates an individual bid.
 * Individual bid must be an integer between 0 and 13 inclusive.
 * Bids of 0 and 1 are fully permitted individually.
 */
export function validateIndividualBid(bid: number): { isValid: boolean; error?: string } {
  if (!Number.isInteger(bid)) {
    return { isValid: false, error: 'Bid must be a whole integer.' };
  }
  if (bid < 0 || bid > 13) {
    return { isValid: false, error: 'Individual bid must be between 0 and 13 tricks.' };
  }
  return { isValid: true };
}

/**
 * Calculates effective team bid according to Section 4.1:
 * "if both the player of same team bid zero then by default 2 would be given to the team as default bid."
 */
export function calculateEffectiveTeamBid(
  bid1: number,
  bid2: number,
  applyDefaultTwo: boolean = true
): {
  effectiveBid: number;
  wasDefaultedToTwo: boolean;
} {
  if (applyDefaultTwo && bid1 === 0 && bid2 === 0) {
    return { effectiveBid: 2, wasDefaultedToTwo: true };
  }
  return { effectiveBid: bid1 + bid2, wasDefaultedToTwo: false };
}

/**
 * Validates a partnership combined bid according to Section 4.1:
 * - A team is strictly prohibited from bidding 0 (Nil) or 1 trick.
 * - But a player can bid zero.
 * - If both players of the same team bid zero, then by default 2 is given as default bid (when applyDefaultTwo = true).
 * - Minimum team contract is 2 tricks.
 */
export function validatePartnershipBid(
  teamId: TeamId,
  bidPlayer1: number,
  bidPlayer2: number,
  applyDefaultTwo: boolean = false
): PartnershipBidValidation {
  const { effectiveBid, wasDefaultedToTwo } = calculateEffectiveTeamBid(bidPlayer1, bidPlayer2, applyDefaultTwo);
  const isValid = effectiveBid >= 2;

  let message = '';
  if (wasDefaultedToTwo) {
    message = `Team ${teamId === 'team1' ? '1 (South & North)' : '2 (West & East)'} both bid 0; awarded default contract of 2 tricks.`;
  } else if (isValid) {
    message = `Team ${teamId === 'team1' ? '1 (South & North)' : '2 (West & East)'} bid ${effectiveBid} tricks (Valid, min 2).`;
  } else {
    message = `Team ${teamId === 'team1' ? '1 (South & North)' : '2 (West & East)'} combined bid is ${effectiveBid} (< 2). A team is strictly prohibited from bidding 0 or 1 trick!`;
  }

  return {
    teamId,
    totalBid: bidPlayer1 + bidPlayer2,
    effectiveBid,
    wasDefaultedToTwo,
    isValid,
    message,
  };
}

/**
 * Evaluates the Section 4.1 Reshuffle Condition:
 * "if summation of both team bids is above 5, then the cards will be reshuffled by next right."
 *
 * NOTE ON AMBIGUITY (Isolated Decision per Section 1 instructions):
 * If applied strictly as `summation > 5`, then no High Contracts (bids 10–13, Section 5.1) or Boston Sweeps (13, Section 5.3)
 * could ever be played because any contract >= 10 has a summation > 5.
 * In card games, such reshuffle clauses typically intend either:
 * - 'strict_playbook_above_5': Exactly as written (sum > 5 triggers reshuffle by next right).
 * - 'low_bid_below_5': The common rule where if table total bids is < 5 (e.g. 2 + 2 = 4), cards are reshuffled.
 * - 'disabled': Allows full high-contract play (10–13) without unintended redeals.
 */
export function checkReshuffleCondition(
  team1EffectiveBid: number,
  team2EffectiveBid: number,
  mode: 'strict_playbook_above_5' | 'low_bid_below_5' | 'disabled' = 'disabled'
): { requiresReshuffle: boolean; reason?: string } {
  const sum = team1EffectiveBid + team2EffectiveBid;

  if (mode === 'strict_playbook_above_5') {
    if (sum > 5) {
      return {
        requiresReshuffle: true,
        reason: `Summation of both team bids (${sum}) is above 5. Reshuffling by next right per Section 4.1 strict clause.`,
      };
    }
  } else if (mode === 'low_bid_below_5') {
    if (sum < 5) {
      return {
        requiresReshuffle: true,
        reason: `Summation of both team bids (${sum}) is below 5. Reshuffling by next right.`,
      };
    }
  }

  return { requiresReshuffle: false };
}

/**
 * Validates all bids in the game and checks partnership validity and reshuffle conditions.
 */
export function validateAllBids(
  bids: Record<PlayerId, number | null>,
  reshuffleMode: 'strict_playbook_above_5' | 'low_bid_below_5' | 'disabled' = 'disabled',
  applyDefaultTwoForDoubleZero: boolean = false
): BiddingRoundValidation {
  // Check if any player hasn't bid
  const pids: PlayerId[] = ['south', 'east', 'north', 'west'];
  for (const pid of pids) {
    const b = bids[pid];
    if (b === null || b === undefined) {
      return {
        isValid: false,
        team1Validation: { teamId: 'team1', totalBid: 0, effectiveBid: 0, wasDefaultedToTwo: false, isValid: false, message: 'Incomplete bids' },
        team2Validation: { teamId: 'team2', totalBid: 0, effectiveBid: 0, wasDefaultedToTwo: false, isValid: false, message: 'Incomplete bids' },
        invalidTeamId: null,
        requiresReshuffle: false,
        message: `Player ${pid} has not submitted a bid.`,
      };
    }
    const indiv = validateIndividualBid(b);
    if (!indiv.isValid) {
      return {
        isValid: false,
        team1Validation: { teamId: 'team1', totalBid: 0, effectiveBid: 0, wasDefaultedToTwo: false, isValid: false, message: indiv.error || 'Invalid bid' },
        team2Validation: { teamId: 'team2', totalBid: 0, effectiveBid: 0, wasDefaultedToTwo: false, isValid: false, message: indiv.error || 'Invalid bid' },
        invalidTeamId: null,
        requiresReshuffle: false,
        message: `Player ${pid}: ${indiv.error}`,
      };
    }
  }

  const team1Val = validatePartnershipBid('team1', bids.south!, bids.north!, applyDefaultTwoForDoubleZero);
  const team2Val = validatePartnershipBid('team2', bids.west!, bids.east!, applyDefaultTwoForDoubleZero);

  if (!team1Val.isValid) {
    return {
      isValid: false,
      team1Validation: team1Val,
      team2Validation: team2Val,
      invalidTeamId: 'team1',
      requiresReshuffle: false,
      message: team1Val.message,
    };
  }

  if (!team2Val.isValid) {
    return {
      isValid: false,
      team1Validation: team1Val,
      team2Validation: team2Val,
      invalidTeamId: 'team2',
      requiresReshuffle: false,
      message: team2Val.message,
    };
  }

  // Check reshuffle condition
  const reshuffleCheck = checkReshuffleCondition(team1Val.effectiveBid, team2Val.effectiveBid, reshuffleMode);
  if (reshuffleCheck.requiresReshuffle) {
    return {
      isValid: false,
      team1Validation: team1Val,
      team2Validation: team2Val,
      invalidTeamId: null,
      requiresReshuffle: true,
      reshuffleReason: reshuffleCheck.reason,
      message: reshuffleCheck.reason || 'Cards must be reshuffled by next right.',
    };
  }

  return {
    isValid: true,
    team1Validation: team1Val,
    team2Validation: team2Val,
    invalidTeamId: null,
    requiresReshuffle: false,
    message: 'All partnership bids are valid and meet the 2-trick minimum.',
  };
}

/**
 * Returns the counter-clockwise bidding sequence starting from the player to dealer's right.
 */
export function getBiddingSequence(dealer: PlayerId): PlayerId[] {
  const sequence: PlayerId[] = [];
  let current = getNextPlayerCounterClockwise(dealer);
  for (let i = 0; i < 4; i++) {
    sequence.push(current);
    current = getNextPlayerCounterClockwise(current);
  }
  return sequence;
}
