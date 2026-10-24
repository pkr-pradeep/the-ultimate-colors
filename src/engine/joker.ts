import { Card, Suit } from '../types/game';

/**
 * Checks if the Joker can legally be played for the given trick and position.
 */
export function isJokerPlayLegal(
  isLead: boolean,
  trickNumber: number,
  isVoidInLedSuit: boolean
): { isLegal: boolean; reason?: string } {
  // Rule B: First-trick restriction
  if (trickNumber === 1) {
    return {
      isLegal: false,
      reason: 'Rule B: The Dadaji Joker cannot be played during the first trick of the hand.',
    };
  }

  // Rule C: No leading with the Joker
  if (isLead) {
    return {
      isLegal: false,
      reason: 'Rule C: A player cannot lead a trick with the Dadaji Joker.',
    };
  }

  // Following suit rule: If player is NOT void in led suit, they must follow suit!
  // Joker can only be played when void in the led suit.
  if (!isVoidInLedSuit) {
    return {
      isLegal: false,
      reason: 'You must follow the led suit if you hold cards of that suit before playing off-suit or the Joker.',
    };
  }

  return { isLegal: true };
}

/**
 * Rule D & Illegal penalty: Evaluates the effective card power of the Joker for a trick.
 * - In Trick 13: Devalued strictly to the 2 of Spades!
 * - If illegally led (penalty path): Devalued strictly to the 2 of Spades!
 * - In normal tricks (2..12) played legally when void: Supreme card (value 16).
 */
export function getEffectiveJokerCard(
  trickNumber: number,
  isIllegalLeadPenalty: boolean = false
): { isDevalued: boolean; effectiveSuit: Suit | 'joker'; effectiveRank: string; effectiveValue: number } {
  // Rule D: Final trick (trick 13) devaluation or illegal lead penalty
  if (trickNumber === 13 || isIllegalLeadPenalty) {
    return {
      isDevalued: true,
      effectiveSuit: 'spades',
      effectiveRank: '2',
      effectiveValue: 2, // Low 2 of Spades
    };
  }

  // Rule A: Universal supreme trump
  return {
    isDevalued: false,
    effectiveSuit: 'joker',
    effectiveRank: 'JOKER',
    effectiveValue: 16,
  };
}

/**
 * Penalty resolution for an illegal Joker lead (Rule C).
 * This function isolates the penalty calculation without weakening the move validator.
 */
export function applyIllegalJokerLeadPenalty(): Card {
  return {
    id: 'dadaji_joker_penalized',
    suit: 'spades',
    rank: '2',
    value: 2,
    cardType: 'standard',
    isDadajiJoker: true,
    name: 'Dadaji Joker (Penalized as 2 of Spades)',
    shortName: '2♠ (Penalized)',
  };
}
