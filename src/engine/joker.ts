import { Card, Suit } from '../types/game';

/**
 * Checks if the Joker can legally be played for the given trick and position.
 * - Denied only at the 1st round (trick 1) of the game.
 * - From round 2 to round 13, the Joker is enabled.
 * - Players are able to hit the Joker even if they hold cards of the led suit.
 * - If a player starts/leads with the Joker, they are not denied (counts as 2 of Spades).
 */
export function isJokerPlayLegal(
  isLead: boolean,
  trickNumber: number,
  _isVoidInLedSuit?: boolean
): { isLegal: boolean; reason?: string } {
  // First-round restriction: denied only at 1st round of game
  if (trickNumber === 1) {
    return {
      isLegal: false,
      reason: 'The Dadaji Joker cannot be played during the first round of the game.',
    };
  }

  // From round 2 to 13: Joker is enabled!
  // Allowed to lead (counts as 2 of Spades) and allowed to hit even with same color/suit cards.
  return { isLegal: true };
}

/**
 * Evaluates the effective card power of the Joker for a trick.
 * - In Trick 13: Devalued strictly to the 2 of Spades.
 * - If led to start a trick (isLead === true): Counted strictly as the 2 of Spades (lead suit is Spades).
 * - In tricks 2..12 played in response: Supreme card (Universal Joker beats everything, value 16).
 */
export function getEffectiveJokerCard(
  trickNumber: number,
  isLead: boolean = false
): { isDevalued: boolean; effectiveSuit: Suit | 'joker'; effectiveRank: string; effectiveValue: number } {
  // Final trick (trick 13) devaluation OR if Joker starts/leads the trick:
  if (trickNumber === 13 || isLead) {
    return {
      isDevalued: true,
      effectiveSuit: 'spades',
      effectiveRank: '2',
      effectiveValue: 2, // Low 2 of Spades
    };
  }

  // Universal supreme trump (rounds 2..12 when responding)
  return {
    isDevalued: false,
    effectiveSuit: 'joker',
    effectiveRank: 'JOKER',
    effectiveValue: 16,
  };
}

/**
 * Penalty / fallback resolution for a Joker lead.
 * In this official rule variant, leading the Joker is counted as the 2 of Spades.
 */
export function applyIllegalJokerLeadPenalty(): Card {
  return {
    id: 'dadaji_joker_as_spades_2',
    suit: 'spades',
    rank: '2',
    value: 2,
    cardType: 'standard',
    isDadajiJoker: true,
    name: 'Dadaji Joker (Counted as 2 of Spades)',
    shortName: '2♠ (Joker)',
  };
}
