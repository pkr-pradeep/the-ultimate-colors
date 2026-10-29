import { Card, PlayerId, Suit, TrickCard } from '../types/game';
import { getEffectiveJokerCard } from './joker';

export interface TrickWinnerResult {
  winnerId: PlayerId;
  winningCard: Card;
  winningReason: string;
}

/**
 * Calculates the winner of a completed trick according to the playbook.
 * - If Joker is played in response (not led) in tricks 2–12: Supreme Trump (beats everything).
 * - If Joker is led: Counted as 2 of Spades (lead suit is Spades; does NOT automatically win).
 * - If Joker is played in trick 13: Devalued to 2 of Spades.
 */
export function determineTrickWinner(
  trick: TrickCard[],
  trickNumber: number,
  trumpSuit: Suit | null,
  isJokerRevealHand: boolean = false
): TrickWinnerResult {
  if (trick.length === 0) {
    throw new Error('Cannot evaluate empty trick.');
  }

  const leadPlay = trick[0];
  // If lead card is Joker, it is counted as 2 of Spades, so lead suit is Spades!
  const leadSuit: Suit = leadPlay.card.isDadajiJoker ? 'spades' : (leadPlay.card.suit as Suit);

  // Helper to get effective suit and value for a card in this trick
  function getCardEffectiveAttributes(t: TrickCard): { suit: Suit | 'joker'; value: number } {
    if (t.card.isDadajiJoker) {
      const isLead = trick.indexOf(t) === 0;
      const jokerEff = getEffectiveJokerCard(trickNumber, isLead);
      return {
        suit: jokerEff.effectiveSuit,
        value: jokerEff.effectiveValue,
      };
    }
    return {
      suit: t.card.suit as Suit,
      value: t.card.value,
    };
  }

  // 1. Evaluate the Joker if present in the trick
  const jokerPlayIndex = trick.findIndex(t => t.card.isDadajiJoker);

  if (jokerPlayIndex !== -1) {
    const isJokerLead = jokerPlayIndex === 0;
    const jokerPlay = trick[jokerPlayIndex];
    const jokerEffective = getEffectiveJokerCard(trickNumber, isJokerLead);

    if (!jokerEffective.isDevalued) {
      // Normal supreme Joker (Rule A): Beats everything, including trump Ace!
      return {
        winnerId: jokerPlay.playerId,
        winningCard: jokerPlay.card,
        winningReason: 'Dadaji Universal Joker (Supreme Trump)',
      };
    }
    // If devalued (Trick 13 or Joker was led): Joker is treated strictly as the 2 of Spades!
  }

  // 2. Standard Trump Hand: check if any trump cards were played
  if (trumpSuit && !isJokerRevealHand) {
    const trumpPlays: { play: TrickCard; value: number }[] = [];

    for (const t of trick) {
      const attr = getCardEffectiveAttributes(t);
      if (attr.suit === trumpSuit) {
        trumpPlays.push({ play: t, value: attr.value });
      }
    }

    if (trumpPlays.length > 0) {
      // Highest trump wins
      let highest = trumpPlays[0];
      for (let i = 1; i < trumpPlays.length; i++) {
        if (trumpPlays[i].value > highest.value) {
          highest = trumpPlays[i];
        }
      }
      return {
        winnerId: highest.play.playerId,
        winningCard: highest.play.card,
        winningReason: highest.play.card.isDadajiJoker
          ? `Trump (Joker counted as 2 of Spades)`
          : `Highest Trump (${trumpSuit.toUpperCase()} ${highest.play.card.rank})`,
      };
    }
  }

  // 3. Joker-Reveal Hand or No Trumps played:
  // Under Rule E (Joker reveal), the led suit is the highest suit for the trick.
  // Under standard hand with no trumps played, highest card of the led suit wins.
  const ledSuitPlays: { play: TrickCard; value: number }[] = [];

  for (const t of trick) {
    const attr = getCardEffectiveAttributes(t);
    if (attr.suit === leadSuit) {
      ledSuitPlays.push({ play: t, value: attr.value });
    }
  }

  if (ledSuitPlays.length > 0) {
    let highest = ledSuitPlays[0];
    for (let i = 1; i < ledSuitPlays.length; i++) {
      if (ledSuitPlays[i].value > highest.value) {
        highest = ledSuitPlays[i];
      }
    }
    return {
      winnerId: highest.play.playerId,
      winningCard: highest.play.card,
      winningReason: highest.play.card.isDadajiJoker
        ? `Led Joker (counted as 2 of Spades)`
        : `Highest Lead Suit (${leadSuit.toUpperCase()} ${highest.play.card.rank})`,
    };
  }

  // Fallback (lead card wins)
  return {
    winnerId: leadPlay.playerId,
    winningCard: leadPlay.card,
    winningReason: 'Lead card',
  };
}
