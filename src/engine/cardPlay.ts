import { Card, PlayerId, Suit, TrickCard } from '../types/game';

export interface CardPlayValidation {
  isValid: boolean;
  error?: string;
}

/**
 * Returns all legally playable cards from a player's hand.
 *
 * Rules:
 * 1. The Joker is denied ONLY at round 1 (trick 1) of the game.
 * 2. From round 2 to round 13, the Joker is enabled.
 * 3. Players can hit the Joker even if they hold cards of the led suit ("same color cards").
 * 4. The Joker can start a round/trick in rounds 2–13 without the user being denied;
 *    if started/led, it is counted as the 2 of Spades (lead suit is Spades).
 */
export function getLegalCards(
  hand: Card[],
  currentTrick: TrickCard[],
  trickNumber: number,
  _trumpSuit: Suit | null
): Card[] {
  if (hand.length === 0) return [];

  const jokerCard = hand.find(c => c.isDadajiJoker);

  // Case 1: Leading the trick (currentTrick is empty)
  if (currentTrick.length === 0) {
    // In Trick 1 (Round 1): Joker cannot start or be played
    if (trickNumber === 1) {
      const nonJokerCards = hand.filter(c => !c.isDadajiJoker);
      if (nonJokerCards.length > 0) {
        return nonJokerCards;
      }
      return [...hand];
    }

    // In Tricks 2 to 13:
    // User is NOT denied from leading the Joker; if led, it will count as 2 of Spades.
    return [...hand];
  }

  // Case 2: Responding to a trick
  const leadCard = currentTrick[0].card;
  // If the lead card was the Joker, it is counted as the 2 of Spades, so lead suit is Spades
  const leadSuit: Suit = leadCard.isDadajiJoker ? 'spades' : (leadCard.suit as Suit);

  // Cards in hand matching the led suit (excluding Joker)
  const cardsOfLedSuit = hand.filter(c => c.suit === leadSuit && !c.isDadajiJoker);

  // Trick 1 (Round 1): Joker is denied!
  if (trickNumber === 1) {
    if (cardsOfLedSuit.length > 0) {
      return cardsOfLedSuit;
    }
    // Void in led suit: can play any card except Joker
    const nonJokerCards = hand.filter(c => !c.isDadajiJoker);
    if (nonJokerCards.length > 0) {
      return nonJokerCards;
    }
    return [...hand];
  }

  // Tricks 2 to 13: Joker is enabled!
  // Players are able to hit the Joker even if they have cards of the led suit ("same color cards").
  if (cardsOfLedSuit.length > 0) {
    // Must follow suit OR can hit the Joker!
    return jokerCard ? [...cardsOfLedSuit, jokerCard] : cardsOfLedSuit;
  }

  // Player has NO cards of the led suit (void):
  // May play any card in hand (including off-suit, trump, or Joker)
  return [...hand];
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
  _trumpSuit: Suit | null
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

  // 3. Joker rules
  if (card.isDadajiJoker) {
    // Denied ONLY at round 1 (trick 1)
    if (trickNumber === 1) {
      return {
        isValid: false,
        error: 'The Dadaji Joker cannot be played during the first round of the game.',
      };
    }
    // Enabled from round 2 to 13:
    // - User is not denied if leading (counts as 2 of Spades)
    // - Player can hit Joker even if holding cards of the led suit
    return { isValid: true };
  }

  // 4. Non-Joker card following suit check
  if (currentTrick.length > 0) {
    const leadCard = currentTrick[0].card;
    const leadSuit: Suit = leadCard.isDadajiJoker ? 'spades' : (leadCard.suit as Suit);
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
