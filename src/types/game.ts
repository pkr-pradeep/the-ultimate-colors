export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export type Rank =
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'
  | 'A'
  | 'JOKER';

export type CardType = 'standard' | 'joker';

export interface Card {
  id: string;
  suit: Suit | 'joker';
  rank: Rank;
  value: number; // 2..14 for standard cards, 16 for standard Dadaji Joker
  cardType: CardType;
  isDadajiJoker: boolean;
  name: string;
  shortName: string;
}

export type PlayerId = 'south' | 'east' | 'north' | 'west';

export type TeamId = 'team1' | 'team2';

export interface Partnership {
  id: TeamId;
  name: string;
  playerIds: [PlayerId, PlayerId];
  totalBid: number;
  tricksWon: number;
  matchScore: number;
  roundScoreHistory: number[];
}

export interface Player {
  id: PlayerId;
  name: string;
  title: string;
  avatarSeed: string;
  teamId: TeamId;
  isHuman: boolean;
  hand: Card[];
  bid: number | null;
  bidTacticalReason?: string;
  tricksWon: number;
}

export interface TrickCard {
  playerId: PlayerId;
  card: Card;
  timestamp: number;
}

export interface TrickResult {
  trickNumber: number;
  leadPlayer: PlayerId;
  winnerId: PlayerId;
  winningCard: Card;
  cards: TrickCard[];
}

export type GamePhase =
  | 'idle'
  | 'dealing'
  | 'trump_revealed'
  | 'bidding'
  | 'bidding_revision' // when a team bid < 2
  | 'playing'
  | 'trick_completed'
  | 'round_summary'
  | 'match_completed';

export type MatchMode = 'default_points' | 'custom_points' | 'time';

export interface MatchConfig {
  mode: MatchMode;
  targetPoints: number; // e.g. 100 for default, custom for custom
  durationSeconds: number; // e.g. 1800 for 30 minutes in Time mode
}

export type AIIntelligenceLevel = 'novice' | 'master' | 'legend';

export interface GameSettings {
  soundEnabled: boolean;
  gameSpeed: 'normal' | 'fast';
  autoSortHand: boolean;
  intelligenceMode: AIIntelligenceLevel;
}

export interface GameState {
  matchConfig: MatchConfig;
  handNumber: number;
  timeRemainingSeconds: number | null;
  isTimerRunning: boolean;
  isTimeExpired: boolean;
  dealer: PlayerId;
  leadPlayer: PlayerId;
  turn: PlayerId;
  trumpSuit: Suit | null;
  trumpCard: Card | null;
  isJokerRevealHand: boolean; // When the 52nd card is Joker: no permanent trump
  currentTrick: TrickCard[];
  trickNumber: number; // 1 to 13
  trickHistory: TrickResult[];
  players: Record<PlayerId, Player>;
  partnerships: Record<TeamId, Partnership>;
  biddingOrder: PlayerId[];
  biddingCurrentIndex: number;
  invalidPartnershipId: TeamId | null; // If combined bid < 2
  phase: GamePhase;
  statusMessage: string;
  lastTrickWinner: PlayerId | null;
  matchWinner: TeamId | 'tie' | null;
  settings: GameSettings;
}
