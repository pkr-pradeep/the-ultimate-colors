import { Card, PlayerId, Suit, TrickCard, TrickResult } from '../types/game';

// Order around table in counter-clockwise direction:
// South (bottom) -> East (right) -> North (top) -> West (left) -> South
export const COUNTER_CLOCKWISE_ORDER: PlayerId[] = ['south', 'east', 'north', 'west'];

/**
 * Returns the next player in counter-clockwise order
 */
export function getNextPlayer(current: PlayerId): PlayerId {
  const idx = COUNTER_CLOCKWISE_ORDER.indexOf(current);
  return COUNTER_CLOCKWISE_ORDER[(idx + 1) % COUNTER_CLOCKWISE_ORDER.length];
}

/**
 * Returns the player who leads after the dealer
 */
export function getFirstLeaderAfterDealer(dealer: PlayerId): PlayerId {
  return getNextPlayer(dealer);
}

/**
 * Determines which cards in a player's hand are legal to play for the current trick.
 * Follows classic trick-taking rules:
 * 1. If leading (trick is empty): Any card in hand is legal.
 * 2. If following:
 *    - If player has cards of the led suit, they MUST play that suit.
 *    - Dadaji Universal Joker is the supreme wildcard and can be played at any time!
 *    - If player has NO cards of the led suit, any card (trumps or discards) is legal.
 */
export function getLegalCards(
  hand: Card[],
  currentTrick: TrickCard[],
  trumpSuit: Suit | null
): Card[] {
  if (hand.length === 0) return [];
  if (currentTrick.length === 0) return [...hand];

  const leadCard = currentTrick[0].card;

  // If Dadaji was led, it acts as the supreme trump
  if (leadCard.isDadajiJoker) {
    if (trumpSuit) {
      const hasTrump = hand.some(c => c.suit === trumpSuit);
      if (hasTrump) {
        return hand.filter(c => c.suit === trumpSuit);
      }
    }
    // If no trump or void in trump, any card can be played
    return [...hand];
  }

  const leadSuit = leadCard.suit;
  const cardsOfLeadSuit = hand.filter(c => c.suit === leadSuit);

  // If the player holds cards of the lead suit:
  // Must play lead suit, OR may play Dadaji Universal Joker (as the ultimate power play!)
  if (cardsOfLeadSuit.length > 0) {
    const dadajiCard = hand.find(c => c.isDadajiJoker);
    if (dadajiCard) {
      return [...cardsOfLeadSuit, dadajiCard];
    }
    return cardsOfLeadSuit;
  }

  // Player has no cards of the led suit: can play any card (trump or off-suit discard)
  return [...hand];
}

/**
 * Determines the winning card and winning player of a completed trick (4 cards).
 */
export function determineTrickWinner(
  trick: TrickCard[],
  trumpSuit: Suit | null
): { winnerId: PlayerId; winningCard: Card } {
  if (trick.length === 0) {
    throw new Error('Cannot evaluate empty trick');
  }

  // 1. SUPREME RULE: Dadaji Universal Joker beats everything!
  const dadajiPlay = trick.find(t => t.card.isDadajiJoker);
  if (dadajiPlay) {
    return {
      winnerId: dadajiPlay.playerId,
      winningCard: dadajiPlay.card,
    };
  }

  const leadCard = trick[0].card;
  const leadSuit = leadCard.suit;

  // 2. Check for Trump suit cards
  if (trumpSuit) {
    const trumpPlays = trick.filter(t => t.card.suit === trumpSuit);
    if (trumpPlays.length > 0) {
      // Find highest value trump
      let highestTrump = trumpPlays[0];
      for (let i = 1; i < trumpPlays.length; i++) {
        if (trumpPlays[i].card.value > highestTrump.card.value) {
          highestTrump = trumpPlays[i];
        }
      }
      return {
        winnerId: highestTrump.playerId,
        winningCard: highestTrump.card,
      };
    }
  }

  // 3. No trumps (or no trump played): highest card of the led suit wins
  const leadSuitPlays = trick.filter(t => t.card.suit === leadSuit);
  let highestLead = leadSuitPlays[0];
  for (let i = 1; i < leadSuitPlays.length; i++) {
    if (leadSuitPlays[i].card.value > highestLead.card.value) {
      highestLead = leadSuitPlays[i];
    }
  }

  return {
    winnerId: highestLead.playerId,
    winningCard: highestLead.card,
  };
}

/**
 * Calculates score delta for a player based on tricks won vs bid.
 * Standard Call-break / trick calculation:
 * - If tricksWon >= bid: score = bid + (tricksWon - bid) * 0.1
 * - If tricksWon < bid: score = -bid
 */
export function calculatePlayerScore(bid: number, tricksWon: number): number {
  if (tricksWon >= bid) {
    const extraTricks = tricksWon - bid;
    return Math.round((bid + extraTricks * 0.1) * 10) / 10;
  } else {
    return -bid;
  }
}
