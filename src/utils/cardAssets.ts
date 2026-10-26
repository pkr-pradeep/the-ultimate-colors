import { Card } from '../types/game';

/**
 * Mapping of standard card identifiers to exact asset filenames in Indian_Playing_Cards
 */
const CARD_FILE_MAP: Record<string, string> = {
  // Spades (01 - 13)
  'spades_A': '01_A_of_spades',
  'spades_2': '02_2_of_spades',
  'spades_3': '03_3_of_spades',
  'spades_4': '04_4_of_spades',
  'spades_5': '05_5_of_spades',
  'spades_6': '06_6_of_spades',
  'spades_7': '07_7_of_spades',
  'spades_8': '08_8_of_spades',
  'spades_9': '09_9_of_spades',
  'spades_10': '10_10_of_spades',
  'spades_J': '11_J_of_spades',
  'spades_Q': '12_Q_of_spades',
  'spades_K': '13_K_of_spades',

  // Hearts (14 - 26)
  'hearts_A': '14_A_of_hearts',
  'hearts_2': '15_2_of_hearts',
  'hearts_3': '16_3_of_hearts',
  'hearts_4': '17_4_of_hearts',
  'hearts_5': '18_5_of_hearts',
  'hearts_6': '19_6_of_hearts',
  'hearts_7': '20_7_of_hearts',
  'hearts_8': '21_8_of_hearts',
  'hearts_9': '22_9_of_hearts',
  'hearts_10': '23_10_of_hearts',
  'hearts_J': '24_J_of_hearts',
  'hearts_Q': '25_Q_of_hearts',
  'hearts_K': '26_K_of_hearts',

  // Clubs (27 - 39)
  'clubs_A': '27_A_of_clubs',
  'clubs_2': '28_2_of_clubs',
  'clubs_3': '29_3_of_clubs',
  'clubs_4': '30_4_of_clubs',
  'clubs_5': '31_5_of_clubs',
  'clubs_6': '32_6_of_clubs',
  'clubs_7': '33_7_of_clubs',
  'clubs_8': '34_8_of_clubs',
  'clubs_9': '35_9_of_clubs',
  'clubs_10': '36_10_of_clubs',
  'clubs_J': '37_J_of_clubs',
  'clubs_Q': '38_Q_of_clubs',
  'clubs_K': '39_K_of_clubs',

  // Diamonds (40 - 52)
  'diamonds_A': '40_A_of_diamonds',
  'diamonds_2': '41_2_of_diamonds',
  'diamonds_3': '42_3_of_diamonds',
  'diamonds_4': '43_4_of_diamonds',
  'diamonds_5': '44_5_of_diamonds',
  'diamonds_6': '45_6_of_diamonds',
  'diamonds_7': '46_7_of_diamonds',
  'diamonds_8': '47_8_of_diamonds',
  'diamonds_9': '48_9_of_diamonds',
  'diamonds_10': '49_10_of_diamonds',
  'diamonds_J': '50_J_of_diamonds',
  'diamonds_Q': '51_Q_of_diamonds',
  'diamonds_K': '52_K_of_diamonds',

  // Joker (53)
  'dadaji_joker': '53_Joker',
  'dadaji_joker_penalized': '02_2_of_spades',
};

/**
 * Returns the exact asset URL for a given card.
 * Uses hardware-accelerated PNG textures by default for 60-120fps stutter-free performance.
 */
export function getCardAssetUrl(card: Card, format: 'png' | 'svg' = 'png'): string {
  if (!card) {
    return `/assets/Indian_Playing_Cards/${format}/Card_Back.${format}`;
  }

  if (card.isDadajiJoker || card.cardType === 'joker' || card.rank === 'JOKER') {
    if (card.id === 'dadaji_joker_penalized') {
      return `/assets/Indian_Playing_Cards/${format}/02_2_of_spades.${format}`;
    }
    return `/assets/Indian_Playing_Cards/${format}/53_Joker.${format}`;
  }

  const key = `${card.suit}_${card.rank}`;
  const filename = CARD_FILE_MAP[key] || CARD_FILE_MAP[card.id] || '53_Joker';
  return `/assets/Indian_Playing_Cards/${format}/${filename}.${format}`;
}

/**
 * Returns the exact card back asset URL.
 */
export function getCardBackAssetUrl(format: 'png' | 'svg' = 'png'): string {
  return `/assets/Indian_Playing_Cards/${format}/Card_Back.${format}`;
}
