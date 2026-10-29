import { Card, PlayerId, Suit } from '../types/game';
import { createUniversalJokerDeck, shuffleDeck, sortHand } from './deck';

// Seating order around the table in counter-clockwise direction:
// South (bottom, 6 o'clock) -> East (right, 3 o'clock) -> North (top, 12 o'clock) -> West (left, 9 o'clock)
export const COUNTER_CLOCKWISE_SEATS: PlayerId[] = ['south', 'east', 'north', 'west'];

export const OPPOSITE_PARTNERS: Record<PlayerId, PlayerId> = {
  south: 'north',
  north: 'south',
  west: 'east',
  east: 'west',
};

/**
 * Returns next player in counter-clockwise order
 */
export function getNextPlayerCounterClockwise(current: PlayerId): PlayerId {
  const idx = COUNTER_CLOCKWISE_SEATS.indexOf(current);
  return COUNTER_CLOCKWISE_SEATS[(idx + 1) % COUNTER_CLOCKWISE_SEATS.length];
}

/**
 * Selects a random dealer from the 4 players
 */
export function getRandomInitialDealer(): PlayerId {
  const randIdx = Math.floor(Math.random() * 4);
  return COUNTER_CLOCKWISE_SEATS[randIdx];
}

export interface DealResult {
  deck: Card[];
  hands: Record<PlayerId, Card[]>;
  dealingOrderSteps: { card: Card; playerId: PlayerId }[];
  finalCard: Card;
  trumpSuit: Suit | null;
  isJokerRevealHand: boolean;
  firstLeader: PlayerId;
}

/**
 * Checks whether an individual player's hand has at least one qualifying card:
 * - A Face Card: Ace ('A'), King ('K'), Queen ('Q'), or Jack ('J')
 * - A Trump card: card matching the active trump suit
 * - The Joker: isDadajiJoker
 *
 * Rule: If a player has NO face card AND NO trump cards AND NO joker,
 * that game cannot be played. All four players must have at least one of these cards.
 */
export function isHandPlayable(hand: Card[], trumpSuit: Suit | null): boolean {
  return hand.some(card => {
    // 1. Dadaji Universal Joker qualifies
    if (card.isDadajiJoker) return true;

    // 2. Face card (A, K, Q, J) qualifies
    if (card.rank === 'A' || card.rank === 'K' || card.rank === 'Q' || card.rank === 'J') {
      return true;
    }

    // 3. Trump card qualifies (if permanent trump is active)
    if (trumpSuit && card.suit === trumpSuit) {
      return true;
    }

    return false;
  });
}

export interface DealPlayabilityResult {
  isPlayable: boolean;
  unplayablePlayerId?: PlayerId;
  reason?: string;
}

/**
 * Validates that all four players have at least one qualifying card:
 * at least one face card (A, K, Q, J), trump card, or the Joker.
 * If any of the four players lacks all of these, the game cannot be played.
 */
export function validateDealPlayability(
  hands: Record<PlayerId, Card[]>,
  trumpSuit: Suit | null
): DealPlayabilityResult {
  for (const pid of COUNTER_CLOCKWISE_SEATS) {
    if (!isHandPlayable(hands[pid], trumpSuit)) {
      return {
        isPlayable: false,
        unplayablePlayerId: pid,
        reason: `Player ${pid} has no face cards (A, K, Q, J), no trump cards, and no Joker. The game cannot be played.`,
      };
    }
  }

  return { isPlayable: true };
}

/**
 * Executes full dealing according to the playbook:
 * 1. Deals 1 card at a time counter-clockwise starting from the player to dealer's right.
 * 2. Dealer receives the 52nd final card.
 * 3. Final card determines trump: standard suit or Joker reveal (no permanent trump).
 * 4. Ensures all four players have at least one qualifying card (Face card A/K/Q/J, Trump, or Joker).
 *    If an unplayable hand is detected during random dealing, automatically reshuffles and redeals.
 */
export function dealHand(dealer: PlayerId, customDeck?: Card[]): DealResult {
  let attempts = 0;
  const maxAttempts = 50;

  while (true) {
    attempts++;
    const deck = customDeck ? [...customDeck] : shuffleDeck(createUniversalJokerDeck());

    const hands: Record<PlayerId, Card[]> = {
      south: [],
      east: [],
      north: [],
      west: [],
    };

    const dealingOrderSteps: { card: Card; playerId: PlayerId }[] = [];

    // Deal order: player immediately to dealer's right (counter-clockwise)
    const playerSequence: PlayerId[] = [];
    let p = getNextPlayerCounterClockwise(dealer);
    for (let i = 0; i < 4; i++) {
      playerSequence.push(p);
      p = getNextPlayerCounterClockwise(p);
    }
    // Note: playerSequence[3] is the dealer, who receives the 4th, 8th, ... 52nd card!

    // Deal 13 rounds of 1 card each
    let cardIndex = 0;
    for (let round = 0; round < 13; round++) {
      for (const player of playerSequence) {
        const card = deck[cardIndex++];
        hands[player].push(card);
        dealingOrderSteps.push({ card, playerId: player });
      }
    }

    // The 52nd card went to the dealer
    const finalCard = deck[51];

    // Invariant verification
    validateDealtHands(hands);

    let trumpSuit: Suit | null = null;
    let isJokerRevealHand = false;

    if (finalCard.isDadajiJoker || finalCard.cardType === 'joker') {
      // Section 5 Joker reveal rule:
      // Do not cancel or redeal. Do not assign permanent trump suit.
      trumpSuit = null;
      isJokerRevealHand = true;
    } else {
      // Standard trump suit
      trumpSuit = finalCard.suit as Suit;
      isJokerRevealHand = false;
    }

    // First leader of the hand is the player to dealer's right
    const firstLeader = getNextPlayerCounterClockwise(dealer);

    // If a customDeck is explicitly supplied, return the exact constructed deal
    // (allows unit tests to test deal validation, playability verification, etc.)
    if (customDeck) {
      return {
        deck,
        hands: {
          south: sortHand(hands.south),
          east: sortHand(hands.east),
          north: sortHand(hands.north),
          west: sortHand(hands.west),
        },
        dealingOrderSteps,
        finalCard,
        trumpSuit,
        isJokerRevealHand,
        firstLeader,
      };
    }

    // Standard random deal:
    // Verify that every single player has at least one face card (A, K, Q, J), trump card, or Joker.
    // If any player has none, reshuffle and redeal automatically!
    const playability = validateDealPlayability(hands, trumpSuit);
    if (playability.isPlayable || attempts >= maxAttempts) {
      return {
        deck,
        hands: {
          south: sortHand(hands.south),
          east: sortHand(hands.east),
          north: sortHand(hands.north),
          west: sortHand(hands.west),
        },
        dealingOrderSteps,
        finalCard,
        trumpSuit,
        isJokerRevealHand,
        firstLeader,
      };
    }
  }
}

/**
 * Validates that all hands comply with game rules:
 * - Exactly 13 cards per player
 * - Total 52 cards
 * - No duplicate card IDs
 * - No 2 of Spades
 * - Exactly 1 Joker
 */
export function validateDealtHands(hands: Record<PlayerId, Card[]>): boolean {
  const seenIds = new Set<string>();
  let jokerFound = false;

  for (const pid of COUNTER_CLOCKWISE_SEATS) {
    const hand = hands[pid];
    if (hand.length !== 13) {
      throw new Error(`Player ${pid} has ${hand.length} cards, expected exactly 13!`);
    }

    for (const card of hand) {
      if (seenIds.has(card.id)) {
        throw new Error(`Duplicate card ${card.id} found in hands!`);
      }
      seenIds.add(card.id);

      if (card.suit === 'spades' && card.rank === '2') {
        throw new Error('Fatal rule breach: 2 of Spades found in dealt hands!');
      }

      if (card.isDadajiJoker) {
        jokerFound = true;
      }
    }
  }

  if (seenIds.size !== 52) {
    throw new Error(`Expected 52 unique dealt cards, found ${seenIds.size}`);
  }

  if (!jokerFound) {
    throw new Error('Joker was not found in dealt hands!');
  }

  return true;
}
