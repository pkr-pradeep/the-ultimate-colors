import { Card, Player, PlayerId, Suit, TrickCard } from '../types/game';
import { getLegalCards } from './cardPlay';
import { determineTrickWinner } from './trickWinner';
import { OPPOSITE_PARTNERS } from './dealing';

/**
 * Calculates a rules-compliant, intelligent AI bid.
 * - Allows individual bids of 0 or 1.
 * - Considers partner's bid if known to ensure combined partnership total is >= 2.
 * - Evaluates high cards (A, K, Q), trump strength, and the Dadaji Joker.
 */
export function calculateAIBid(
  hand: Card[],
  trumpSuit: Suit | null,
  isJokerRevealHand: boolean,
  partnerBid: number | null
): number {
  let estimatedTricks = 0;

  for (const card of hand) {
    if (card.isDadajiJoker) {
      // Dadaji Joker is an almost certain trick (unless saved for trick 13 where devalued)
      estimatedTricks += 1.0;
      continue;
    }

    const isTrump = trumpSuit && !isJokerRevealHand && card.suit === trumpSuit;

    if (card.rank === 'A') {
      estimatedTricks += isTrump ? 1.0 : 0.8;
    } else if (card.rank === 'K') {
      estimatedTricks += isTrump ? 0.7 : 0.45;
    } else if (card.rank === 'Q' && isTrump) {
      estimatedTricks += 0.4;
    } else if (card.rank === 'J' && isTrump) {
      estimatedTricks += 0.25;
    }
  }

  // Trump length bonus
  if (trumpSuit && !isJokerRevealHand) {
    const trumpLength = hand.filter(c => c.suit === trumpSuit).length;
    if (trumpLength >= 5) estimatedTricks += 1.0;
    else if (trumpLength >= 4) estimatedTricks += 0.5;
  }

  // Raw estimated bid (can be 0 or 1)
  let rawBid = Math.max(0, Math.min(13, Math.round(estimatedTricks)));

  // Partnership minimum check:
  // If partner has already bid, the AI must ensure the combined bid is >= 2!
  if (partnerBid !== null && partnerBid !== undefined) {
    const combined = rawBid + partnerBid;
    if (combined < 2) {
      // Need at least 2 - partnerBid
      rawBid = Math.max(rawBid, 2 - partnerBid);
    }
  }

  return rawBid;
}

/**
 * Selects an intelligent card to play from the legal cards available.
 */
export function chooseAICard(
  player: Player,
  legalCards: Card[],
  currentTrick: TrickCard[],
  trickNumber: number,
  trumpSuit: Suit | null,
  isJokerRevealHand: boolean
): Card {
  if (legalCards.length === 1) {
    return legalCards[0];
  }

  const partnerId = OPPOSITE_PARTNERS[player.id];

  // Case 1: AI is leading the trick (currentTrick is empty)
  if (currentTrick.length === 0) {
    // 1. Lead non-trump Aces if available (never Joker as Rule C prohibits leading Joker)
    const nonTrumpAces = legalCards.filter(
      c => !c.isDadajiJoker && c.rank === 'A' && (isJokerRevealHand || c.suit !== trumpSuit)
    );
    if (nonTrumpAces.length > 0) {
      return nonTrumpAces[0];
    }

    // 2. Otherwise lead low cards in long suits, preserving high cards and trumps
    const nonJokerCards = legalCards.filter(c => !c.isDadajiJoker);
    if (nonJokerCards.length > 0) {
      const sortedLow = [...nonJokerCards].sort((a, b) => a.value - b.value);
      // Prefer leading off-suit low card
      const nonTrumpLow = sortedLow.find(c => isJokerRevealHand || c.suit !== trumpSuit);
      if (nonTrumpLow) return nonTrumpLow;
      return sortedLow[0];
    }

    return legalCards[0];
  }

  // Case 2: AI is following an existing trick
  const currentLeader = determineTrickWinner(
    currentTrick,
    trickNumber,
    trumpSuit,
    isJokerRevealHand
  );
  const isPartnerCurrentlyWinning = currentLeader.winnerId === partnerId;

  // Separate winning vs losing plays among legal cards
  const winningPlays: Card[] = [];
  const losingPlays: Card[] = [];

  for (const card of legalCards) {
    const simulatedTrick: TrickCard[] = [
      ...currentTrick,
      { playerId: player.id, card, timestamp: Date.now() },
    ];
    const outcome = determineTrickWinner(
      simulatedTrick,
      trickNumber,
      trumpSuit,
      isJokerRevealHand
    );
    if (outcome.winnerId === player.id) {
      winningPlays.push(card);
    } else {
      losingPlays.push(card);
    }
  }

  // If partner is already winning:
  if (isPartnerCurrentlyWinning) {
    // Don't overtake partner if partner played an Ace or high trump
    // Play lowest discard to save strength
    if (losingPlays.length > 0) {
      const nonJokerLosing = losingPlays.filter(c => !c.isDadajiJoker);
      if (nonJokerLosing.length > 0) {
        nonJokerLosing.sort((a, b) => a.value - b.value);
        return nonJokerLosing[0];
      }
    }
  }

  // If we can win the trick:
  if (winningPlays.length > 0) {
    // Check non-joker winning plays first
    const nonJokerWins = winningPlays.filter(c => !c.isDadajiJoker);
    if (nonJokerWins.length > 0) {
      // Pick lowest winning card to conserve high cards
      nonJokerWins.sort((a, b) => a.value - b.value);
      return nonJokerWins[0];
    }

    // Only Joker can win:
    // Only use Joker if the trick has high-value cards or if trick 13 is approaching
    const hasHighStake = currentTrick.some(
      t => t.card.rank === 'A' || t.card.rank === 'K' || (!isJokerRevealHand && t.card.suit === trumpSuit)
    );
    if (hasHighStake || losingPlays.length === 0 || trickNumber === 12) {
      return winningPlays[0];
    }

    // Save Joker and discard low losing card
    if (losingPlays.length > 0) {
      const nonJokerLosing = losingPlays.filter(c => !c.isDadajiJoker);
      if (nonJokerLosing.length > 0) {
        nonJokerLosing.sort((a, b) => a.value - b.value);
        return nonJokerLosing[0];
      }
    }
    return winningPlays[0];
  }

  // Cannot win: play lowest losing card
  const nonJokerDiscards = losingPlays.filter(c => !c.isDadajiJoker);
  if (nonJokerDiscards.length > 0) {
    // Discard lowest non-trump card
    const nonTrumpDiscards = nonJokerDiscards.filter(c => isJokerRevealHand || c.suit !== trumpSuit);
    if (nonTrumpDiscards.length > 0) {
      nonTrumpDiscards.sort((a, b) => a.value - b.value);
      return nonTrumpDiscards[0];
    }
    nonJokerDiscards.sort((a, b) => a.value - b.value);
    return nonJokerDiscards[0];
  }

  return legalCards[0];
}
