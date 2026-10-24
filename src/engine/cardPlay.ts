import { Card, PlayerId, Suit, TrickCard } from '../types/game';
import { isJokerPlayLegal } from './joker';

export interface CardPlayValidation {
  isValid: boolean;
  error?: string;
}

/**
 * Returns all legally playable cards from a player's hand according to the playbook.
 */
export function getLegalCards(
  hand: Card[],
  currentTrick: TrickCard[],
  trickNumber: number,
  trumpSuit: Suit | null
): Card[] {
  if (hand.length === 0) return [];

  // Case 1: Leading the trick (trick is empty)
  if (currentTrick.length === 0) {
    // Rule C: A player cannot lead a trick with the Joker!
    const nonJokerCards = hand.filter(c => !c.isDadajiJoker);

    // If a player only has the Joker left (extreme edge case at trick 13),
    // they have no choice but to lead it.
    if (nonJokerCards.length === 0) {
      return [...hand];
    }

    return nonJokerCards;
  }

  // Case 2: Responding to a trick
  const leadCard = currentTrick[0].card;
  const leadSuit = leadCard.suit;

  // Check if player holds any cards of the led suit
  const cardsOfLedSuit = hand.filter(c => c.suit === leadSuit && !c.isDadajiJoker);

  if (cardsOfLedSuit.length > 0) {
    // MUST follow suit! Cannot play off-suit and cannot play Joker!
    return cardsOfLedSuit;
  }

  // Player has NO cards of the led suit (void):
  // May play any off-suit card, trump card, or Joker (if Joker rule permits)
  const legalCards: Card[] = [];

  for (const card of hand) {
    if (card.isDadajiJoker) {
      // Check Rule B (trick 1 ban)
      const jokerCheck = isJokerPlayLegal(false, trickNumber, true);
      if (jokerCheck.isLegal) {
        legalCards.push(card);
      }
    } else {
      legalCards.push(card);
    }
  }

  // Fallback: If only Joker in hand during trick 1 (impossible in standard 13-card deal, but safe guard)
  if (legalCards.length === 0 && hand.length > 0) {
    return [...hand];
  }

  return legalCards;
}

/**
 * Validates a proposed card play against all game rules.
 */
export function validateCardPlay(
  card: Card,
  playerId: PlayerId,
  turn: PlayerId,
  hand: Card[],
  currentTrick: TrickCard[],
  trickNumber: number,
  trumpSuit: Suit | null
): CardPlayValidation {
  // 1. Turn check
  if (playerId !== turn) {
    return { isValid: false, error: `It is not player ${playerId}'s turn.` };
  }

  // 2. Hand ownership check
  const holdsCard = hand.some(c => c.id === card.id);
  if (!holdsCard) {
    return { isValid: false, error: `Player does not hold the card ${card.name}.` };
  }

  // 3. Rule C: Cannot lead with the Joker
  if (currentTrick.length === 0 && card.isDadajiJoker) {
    // Only exception is if player literally holds nothing else
    const hasOtherCards = hand.some(c => !c.isDadajiJoker);
    if (hasOtherCards) {
      return {
        isValid: false,
        error: 'Rule C: A player cannot lead a trick with the Dadaji Joker.',
      };
    }
  }

  // 4. Rule B: Cannot play Joker during trick 1
  if (trickNumber === 1 && card.isDadajiJoker) {
    return {
      isValid: false,
      error: 'Rule B: The Dadaji Joker cannot be played during the first trick of the hand.',
    };
  }

  // 5. Following suit check
  if (currentTrick.length > 0) {
    const leadSuit = currentTrick[0].card.suit;
    const holdsLedSuit = hand.some(c => c.suit === leadSuit && !c.isDadajiJoker);

    if (holdsLedSuit && card.suit !== leadSuit) {
      return {
        isValid: false,
        error: `Must follow suit! You hold ${leadSuit} in your hand.`,
      };
    }
  }

  return { isValid: true };
}
