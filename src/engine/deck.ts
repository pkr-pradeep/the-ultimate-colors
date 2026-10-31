import { Card, Rank, Suit } from '../types/game';

export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];

export const STANDARD_RANKS: { rank: Rank; value: number }[] = [
  { rank: '2', value: 2 },
  { rank: '3', value: 3 },
  { rank: '4', value: 4 },
  { rank: '5', value: 5 },
  { rank: '6', value: 6 },
  { rank: '7', value: 7 },
  { rank: '8', value: 8 },
  { rank: '9', value: 9 },
  { rank: '10', value: 10 },
  { rank: 'J', value: 11 },
  { rank: 'Q', value: 12 },
  { rank: 'K', value: 13 },
  { rank: 'A', value: 14 },
];

export const SUIT_NAMES: Record<Suit, string> = {
  spades: 'Spades',
  hearts: 'Hearts',
  diamonds: 'Diamond',
  clubs: 'Clubs',
};

export const SUIT_NAMES_ODIA: Record<Suit, string> = {
  spades: 'କଳା ପାନ୍',
  hearts: 'ଲାଲ୍ ପାନ୍',
  diamonds: 'ଠିକିରି',
  clubs: 'ଚିଡ଼ିଆ',
};

export const SUIT_NAMES_HINDI: Record<Suit, string> = {
  spades: 'हुकुम',
  hearts: 'पान',
  diamonds: 'ईट',
  clubs: 'चिडि',
};

export const JOKER_NAMES = {
  en: 'Joker',
  hi: 'जोकर',
  or: 'ଜୋକର୍',
  combined: 'Joker (ଜୋକର୍ / जोकर)',
};

export const MULTILINGUAL_SUIT_NAMES: Record<
  Suit,
  { en: string; or: string; hi: string; combined: string }
> = {
  clubs: {
    en: 'Clubs',
    or: 'ଚିଡ଼ିଆ',
    hi: 'चिडि',
    combined: 'Clubs (ଚିଡ଼ିଆ / चिडि)',
  },
  hearts: {
    en: 'Hearts',
    or: 'ଲାଲ୍ ପାନ୍',
    hi: 'पान',
    combined: 'Hearts (ଲାଲ୍ ପାନ୍ / पान)',
  },
  spades: {
    en: 'Spades',
    or: 'କଳା ପାନ୍',
    hi: 'हुकुम',
    combined: 'Spades (କଳା ପାନ୍ / हुकुम)',
  },
  diamonds: {
    en: 'Diamond',
    or: 'ଠିକିରି',
    hi: 'ईट',
    combined: 'Diamond (ଠିକିରି / ईट)',
  },
};

export function getSuitDisplayName(suit: Suit, lang?: 'en' | 'hi' | 'or'): string {
  if (lang === 'hi') return SUIT_NAMES_HINDI[suit];
  if (lang === 'or') return SUIT_NAMES_ODIA[suit];
  return SUIT_NAMES[suit];
}

export function getJokerDisplayName(lang?: 'en' | 'hi' | 'or'): string {
  if (lang === 'hi') return JOKER_NAMES.hi;
  if (lang === 'or') return JOKER_NAMES.or;
  return JOKER_NAMES.en;
}

export const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

export const DADAJI_JOKER_CARD: Card = {
  id: 'dadaji_joker',
  suit: 'joker',
  rank: 'JOKER',
  value: 16, // Outranks any standard Ace under normal conditions
  cardType: 'joker',
  isDadajiJoker: true,
  name: 'Dadaji Universal Joker (ଜୋକର୍ / जोकर)',
  shortName: 'JOKER',
};

/**
 * Creates the official 53-card deck with 2 of Spades permanently removed,
 * leaving exactly 51 standard cards and 1 Joker (52 cards total).
 */
export function createUniversalJokerDeck(): Card[] {
  const deck: Card[] = [];

  for (const suit of SUITS) {
    for (const item of STANDARD_RANKS) {
      // RULE: The 2 of Spades is PERMANENTLY REMOVED from the deck!
      if (suit === 'spades' && item.rank === '2') {
        continue;
      }

      let courtName = '';
      if (item.rank === 'K') courtName = ' (Maharaja)';
      else if (item.rank === 'Q') courtName = ' (Maharani)';
      else if (item.rank === 'J') courtName = ' (Wazir)';
      else if (item.rank === 'A') courtName = ' (Ekka)';

      deck.push({
        id: `${suit}_${item.rank}`,
        suit,
        rank: item.rank,
        value: item.value,
        cardType: 'standard',
        isDadajiJoker: false,
        name: `${item.rank}${courtName} of ${SUIT_NAMES[suit]}`,
        shortName: `${item.rank}${SUIT_SYMBOLS[suit]}`,
      });
    }
  }

  // Add the DADAJI Joker (exactly 1)
  deck.push({ ...DADAJI_JOKER_CARD });

  validateDeckStructure(deck);
  return deck;
}

/**
 * Validates deck structure invariants
 */
export function validateDeckStructure(deck: Card[]): boolean {
  if (deck.length !== 52) {
    throw new Error(`Deck must have exactly 52 cards, found ${deck.length}`);
  }

  // Verify unique card IDs
  const idSet = new Set<string>();
  let jokerCount = 0;

  for (const card of deck) {
    if (idSet.has(card.id)) {
      throw new Error(`Duplicate card ID detected: ${card.id}`);
    }
    idSet.add(card.id);

    // Verify 2 of Spades never exists
    if (card.suit === 'spades' && card.rank === '2') {
      throw new Error('Fatal rule breach: 2 of Spades must not exist in deck!');
    }

    if (card.isDadajiJoker || card.cardType === 'joker') {
      jokerCount++;
    }
  }

  if (jokerCount !== 1) {
    throw new Error(`Joker must appear exactly once, found ${jokerCount}`);
  }

  return true;
}

/**
 * Shuffles deck using Fisher-Yates algorithm
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Sorts cards in player hand by suit and rank for display
 */
export function sortHand(hand: Card[]): Card[] {
  const suitOrder: Record<string, number> = {
    spades: 1,
    hearts: 2,
    clubs: 3,
    diamonds: 4,
    joker: 0,
  };

  return [...hand].sort((a, b) => {
    if (a.isDadajiJoker) return -1;
    if (b.isDadajiJoker) return 1;

    const suitDiff = (suitOrder[a.suit] || 99) - (suitOrder[b.suit] || 99);
    if (suitDiff !== 0) return suitDiff;

    return b.value - a.value;
  });
}
