import {
  createUniversalJokerDeck,
  validateDeckStructure,
  DADAJI_JOKER_CARD,
  SUIT_NAMES,
  SUIT_NAMES_ODIA,
  SUIT_NAMES_HINDI,
  JOKER_NAMES,
  MULTILINGUAL_SUIT_NAMES,
} from '../engine/deck';
import {
  dealHand,
  getNextPlayerCounterClockwise,
  validateDealtHands,
  isHandPlayable,
  validateDealPlayability,
} from '../engine/dealing';
import {
  validateIndividualBid,
  validatePartnershipBid,
  validateAllBids,
  checkReshuffleCondition,
} from '../engine/bidding';
import { getLegalCards, validateCardPlay } from '../engine/cardPlay';
import {
  applyIllegalJokerLeadPenalty,
  getEffectiveJokerCard,
  isJokerPlayLegal,
} from '../engine/joker';
import { determineTrickWinner } from '../engine/trickWinner';
import { calculateHandScores, calculatePartnershipScore } from '../engine/scoring';
import { evaluateMatchStatus } from '../engine/match';
import { calculateAIBid, chooseAICard } from '../engine/ai';
import {
  initializeMatch,
  startHand,
  submitPlayerBid,
  executeCardPlay,
  resolveCompletedTrick,
  skipRemainingTricks,
  claimShowHand,
} from '../engine/gameEngine';
import { evaluateShowHand, verifyUserSelectedCards } from '../engine/showHand';
import { RULEBOOK_TRANSLATIONS } from '../data/rulebookTranslations';
import { MODAL_TRANSLATIONS } from '../data/modalTranslations';
import { Card, PlayerId, Suit, TrickCard, TrickResult } from '../types/game';

interface TestResult {
  id: number;
  description: string;
  passed: boolean;
  error?: string;
}

export function runAllTests(): { passedCount: number; totalCount: number; results: TestResult[] } {
  const results: TestResult[] = [];

  function test(id: number, description: string, fn: () => void) {
    try {
      fn();
      results.push({ id, description, passed: true });
    } catch (err: any) {
      results.push({ id, description, passed: false, error: err?.message || String(err) });
    }
  }

  function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error(msg);
  }

  // ================= DECK & DEALING TESTS (1-6) =================
  test(1, 'The deck contains exactly 52 playable cards', () => {
    const deck = createUniversalJokerDeck();
    assert(deck.length === 52, `Expected 52 cards, got ${deck.length}`);
  });

  test(2, 'The 2 of Spades is permanently excluded', () => {
    const deck = createUniversalJokerDeck();
    const has2Spades = deck.some(c => c.suit === 'spades' && c.rank === '2');
    assert(!has2Spades, 'Fatal: 2 of Spades found in deck!');
  });

  test(3, 'The Joker appears exactly once', () => {
    const deck = createUniversalJokerDeck();
    const jokers = deck.filter(c => c.isDadajiJoker);
    assert(jokers.length === 1, `Expected exactly 1 Joker, found ${jokers.length}`);
  });

  test(4, 'Every player receives exactly 13 cards', () => {
    const deal = dealHand('south');
    for (const pid of ['south', 'east', 'north', 'west'] as PlayerId[]) {
      assert(deal.hands[pid].length === 13, `Player ${pid} received ${deal.hands[pid].length} cards, expected 13`);
    }
  });

  test(5, 'No card is duplicated across hands', () => {
    const deal = dealHand('south');
    validateDealtHands(deal.hands);
  });

  test(6, 'Dealer rotation and dealing order are correct', () => {
    const deal1 = dealHand('south');
    // First card goes to player immediately to dealer's right (east)
    assert(deal1.dealingOrderSteps[0].playerId === 'east', 'First card should go to east when dealer is south');
    // Dealer receives the final 52nd card
    assert(deal1.dealingOrderSteps[51].playerId === 'south', 'Dealer south should receive the 52nd card');
    // Counter-clockwise dealer rotation: South -> East -> North -> West -> South
    assert(getNextPlayerCounterClockwise('south') === 'east', 'Next dealer after south must be east');
    assert(getNextPlayerCounterClockwise('east') === 'north', 'Next dealer after east must be north');
    assert(getNextPlayerCounterClockwise('north') === 'west', 'Next dealer after north must be west');
    assert(getNextPlayerCounterClockwise('west') === 'south', 'Next dealer after west must be south');
  });

  // ================= BIDDING TESTS (7-16) =================
  test(7, 'An individual bid of 0 is accepted', () => {
    const val = validateIndividualBid(0);
    assert(val.isValid, 'Individual bid of 0 should be accepted');
  });

  test(8, 'An individual bid of 1 is accepted', () => {
    const val = validateIndividualBid(1);
    assert(val.isValid, 'Individual bid of 1 should be accepted');
  });

  test(9, 'An individual bid of 13 is accepted', () => {
    const val = validateIndividualBid(13);
    assert(val.isValid, 'Individual bid of 13 should be accepted');
  });

  test(10, 'A partnership total of 0 is rejected', () => {
    const val = validatePartnershipBid('team1', 0, 0);
    assert(!val.isValid, 'Partnership total of 0 must be rejected');
  });

  test(11, 'A partnership total of 1 is rejected', () => {
    const val = validatePartnershipBid('team1', 1, 0);
    assert(!val.isValid, 'Partnership total of 1 (1 + 0) must be rejected');
    const val2 = validatePartnershipBid('team1', 0, 1);
    assert(!val2.isValid, 'Partnership total of 1 (0 + 1) must be rejected');
  });

  test(12, 'A partnership total of 2 is accepted', () => {
    const val = validatePartnershipBid('team1', 1, 1);
    assert(val.isValid, 'Partnership total of 2 must be accepted');
  });

  test(13, 'A bid of 0 combined with a partner bid of 2 is accepted', () => {
    const val = validatePartnershipBid('team1', 0, 2);
    assert(val.isValid, 'Bid of 0 + 2 = 2 must be accepted');
  });

  test(14, 'A bid of 1 combined with a partner bid of 1 is accepted', () => {
    const val = validatePartnershipBid('team1', 1, 1);
    assert(val.isValid, 'Bid of 1 + 1 = 2 must be accepted');
  });

  test(15, 'A partnership with an invalid combined bid cannot start the hand', () => {
    let state = initializeMatch();
    state = startHand(state);
    // Bidding order: player to dealer's right ...
    const p1 = state.biddingOrder[0];
    const p2 = state.biddingOrder[1];
    const p3 = state.biddingOrder[2];
    const p4 = state.biddingOrder[3];

    // Submit invalid bids where Team 1 bids 1 + 0 = 1 (< 2 minimum)
    for (const pid of state.biddingOrder) {
      if (pid === 'south') {
        state = submitPlayerBid(state, pid, 1);
      } else if (pid === 'north') {
        state = submitPlayerBid(state, pid, 0); // 1 + 0 = 1 (invalid team bid!)
      } else {
        state = submitPlayerBid(state, pid, 2); // Valid team 2 bid
      }
    }

    assert(state.phase === 'bidding_revision', 'Hand must transition to bidding_revision, not playing');
    assert(state.invalidPartnershipId === 'team1', 'Team 1 must be flagged as invalid');
  });

  test(16, 'Computer-controlled players cannot create an invalid partnership total', () => {
    // If partner already bid 0, AI must bid at least 2
    const aiBidPartner0 = calculateAIBid([], 'hearts', false, 0).bid;
    assert(aiBidPartner0 >= 2, `AI should bid at least 2 when partner bid 0, got ${aiBidPartner0}`);
    // If partner already bid 1, AI must bid at least 1
    const aiBidPartner1 = calculateAIBid([], 'hearts', false, 1).bid;
    assert(aiBidPartner1 >= 1, `AI should bid at least 1 when partner bid 1, got ${aiBidPartner1}`);
  });

  // ================= TRUMP & CARD PLAY TESTS (17-22) =================
  test(17, 'Every standard suit can become trump', () => {
    const dummyCard = (suit: any): Card => ({
      id: `${suit}_5`,
      suit,
      rank: '5',
      value: 5,
      cardType: 'standard',
      isDadajiJoker: false,
      name: `5 of ${suit}`,
      shortName: `5${suit}`,
    });

    for (const suit of ['spades', 'hearts', 'diamonds', 'clubs'] as const) {
      // Place dummyCard as 52nd card
      const deck = createUniversalJokerDeck();
      // Swap card with 51st index
      const card = deck.find(c => c.suit === suit)!;
      const idx = deck.indexOf(card);
      [deck[idx], deck[51]] = [deck[51], deck[idx]];

      const deal = dealHand('south', deck);
      assert(deal.trumpSuit === suit, `Expected trump ${suit}, got ${deal.trumpSuit}`);
      assert(!deal.isJokerRevealHand, 'Should not be Joker reveal');
    }
  });

  test(18, 'A final dealt Joker activates the no-permanent-trump condition', () => {
    const deck = createUniversalJokerDeck();
    const jokerIndex = deck.findIndex(c => c.isDadajiJoker);
    [deck[jokerIndex], deck[51]] = [deck[51], deck[jokerIndex]];

    const deal = dealHand('south', deck);
    assert(deal.trumpSuit === null, 'Trump suit must be null when Joker is final dealt card');
    assert(deal.isJokerRevealHand === true, 'isJokerRevealHand must be true');
  });

  test(19, 'A player must follow suit when possible', () => {
    const cardSpadeA: Card = { id: 'spades_A', suit: 'spades', rank: 'A', value: 14, cardType: 'standard', isDadajiJoker: false, name: 'Ace of Spades', shortName: 'A♠' };
    const cardHeartK: Card = { id: 'hearts_K', suit: 'hearts', rank: 'K', value: 13, cardType: 'standard', isDadajiJoker: false, name: 'King of Hearts', shortName: 'K♥' };
    const hand = [cardSpadeA, cardHeartK];

    // Trick led with Spades
    const currentTrick: TrickCard[] = [
      { playerId: 'east', card: { id: 'spades_10', suit: 'spades', rank: '10', value: 10, cardType: 'standard', isDadajiJoker: false, name: '10 of Spades', shortName: '10♠' }, timestamp: 1 },
    ];

    const legal = getLegalCards(hand, currentTrick, 2, 'diamonds');
    assert(legal.length === 1 && legal[0].id === 'spades_A', 'Player must follow Spades when holding Spades');

    // Validating an off-suit move must fail
    const val = validateCardPlay(cardHeartK, 'south', 'south', hand, currentTrick, 2, 'diamonds');
    assert(!val.isValid, 'Playing off-suit while holding led suit must be rejected');
  });

  test(20, 'A player who is void in the led suit may play an eligible alternative', () => {
    const cardHeartK: Card = { id: 'hearts_K', suit: 'hearts', rank: 'K', value: 13, cardType: 'standard', isDadajiJoker: false, name: 'King of Hearts', shortName: 'K♥' };
    const cardDiamond10: Card = { id: 'diamonds_10', suit: 'diamonds', rank: '10', value: 10, cardType: 'standard', isDadajiJoker: false, name: '10 of Diamonds', shortName: '10♦' };
    const hand = [cardHeartK, cardDiamond10];

    // Trick led with Spades (player is void in Spades)
    const currentTrick: TrickCard[] = [
      { playerId: 'east', card: { id: 'spades_10', suit: 'spades', rank: '10', value: 10, cardType: 'standard', isDadajiJoker: false, name: '10 of Spades', shortName: '10♠' }, timestamp: 1 },
    ];

    const legal = getLegalCards(hand, currentTrick, 2, 'diamonds');
    assert(legal.length === 2, 'Void player should be allowed to play any holding card');
  });

  test(21, 'Cards cannot be played out of turn', () => {
    const card: Card = { id: 'hearts_K', suit: 'hearts', rank: 'K', value: 13, cardType: 'standard', isDadajiJoker: false, name: 'King of Hearts', shortName: 'K♥' };
    const val = validateCardPlay(card, 'south', 'east', [card], [], 1, 'hearts');
    assert(!val.isValid, 'Out of turn play must be rejected');
  });

  test(22, 'A player cannot play a card they do not hold', () => {
    const heldCard: Card = { id: 'hearts_K', suit: 'hearts', rank: 'K', value: 13, cardType: 'standard', isDadajiJoker: false, name: 'King of Hearts', shortName: 'K♥' };
    const foreignCard: Card = { id: 'spades_A', suit: 'spades', rank: 'A', value: 14, cardType: 'standard', isDadajiJoker: false, name: 'Ace of Spades', shortName: 'A♠' };
    const val = validateCardPlay(foreignCard, 'south', 'south', [heldCard], [], 1, 'hearts');
    assert(!val.isValid, 'Playing card not held in hand must be rejected');
  });

  // ================= JOKER TESTS (23-30) =================
  test(23, 'The Joker cannot be played or led during the first round (Trick 1)', () => {
    const joker = { ...DADAJI_JOKER_CARD };
    const cardHeartK: Card = { id: 'hearts_K', suit: 'hearts', rank: 'K', value: 13, cardType: 'standard', isDadajiJoker: false, name: 'King of Hearts', shortName: 'K♥' };
    const hand = [joker, cardHeartK];

    // Responding in Trick 1
    const currentTrick: TrickCard[] = [
      { playerId: 'east', card: { id: 'spades_10', suit: 'spades', rank: '10', value: 10, cardType: 'standard', isDadajiJoker: false, name: '10 of Spades', shortName: '10♠' }, timestamp: 1 },
    ];
    const legalInTrick1 = getLegalCards(hand, currentTrick, 1, 'diamonds');
    assert(!legalInTrick1.some(c => c.isDadajiJoker), 'Joker must not be legal in Trick 1');
    const valResp = validateCardPlay(joker, 'south', 'south', hand, currentTrick, 1, 'diamonds');
    assert(!valResp.isValid, 'Joker play in Trick 1 must be rejected');

    // Leading in Trick 1
    const legalLead1 = getLegalCards(hand, [], 1, 'diamonds');
    assert(!legalLead1.some(c => c.isDadajiJoker), 'Joker must not be legal to lead in Trick 1');
    const valLead1 = validateCardPlay(joker, 'south', 'south', hand, [], 1, 'diamonds');
    assert(!valLead1.isValid, 'Leading Joker in Trick 1 must be rejected');
  });

  test(24, 'Players can hit Joker even if they hold cards of the led suit (Tricks 2–13)', () => {
    const joker = { ...DADAJI_JOKER_CARD };
    const cardHeartA: Card = { id: 'hearts_A', suit: 'hearts', rank: 'A', value: 14, cardType: 'standard', isDadajiJoker: false, name: 'Ace of Hearts', shortName: 'A♥' };
    const cardHeartK: Card = { id: 'hearts_K', suit: 'hearts', rank: 'K', value: 13, cardType: 'standard', isDadajiJoker: false, name: 'King of Hearts', shortName: 'K♥' };
    const hand = [cardHeartA, cardHeartK, joker];

    // Trick led with Hearts (player holds two Hearts)
    const currentTrick: TrickCard[] = [
      { playerId: 'east', card: { id: 'hearts_10', suit: 'hearts', rank: '10', value: 10, cardType: 'standard', isDadajiJoker: false, name: '10 of Hearts', shortName: '10♥' }, timestamp: 1 },
    ];

    const legal = getLegalCards(hand, currentTrick, 3, 'diamonds');
    assert(legal.some(c => c.isDadajiJoker), 'Joker must be legal even when player holds cards of the led suit');
    assert(legal.some(c => c.id === 'hearts_A'), 'Holding led suit cards must also be legal');

    const val = validateCardPlay(joker, 'south', 'south', hand, currentTrick, 3, 'diamonds');
    assert(val.isValid, 'Hitting Joker when holding same suit cards must be valid');
  });

  test(25, 'Leading the Joker in Tricks 2–13 is not denied and counts as the 2 of Spades', () => {
    const joker = { ...DADAJI_JOKER_CARD };
    const cardHeartK: Card = { id: 'hearts_K', suit: 'hearts', rank: 'K', value: 13, cardType: 'standard', isDadajiJoker: false, name: 'King of Hearts', shortName: 'K♥' };
    const hand = [joker, cardHeartK];

    // Leading in Trick 2: User is not denied
    const legalLead = getLegalCards(hand, [], 2, 'diamonds');
    assert(legalLead.some(c => c.isDadajiJoker), 'Joker must be legal to lead in Trick 2 (not denied)');
    const val = validateCardPlay(joker, 'south', 'south', hand, [], 2, 'diamonds');
    assert(val.isValid, 'Leading Joker in Trick 2 must be valid');

    // When led, it counts as 2 of Spades and does not beat a higher Spade
    const trickWithJokerLead: TrickCard[] = [
      { playerId: 'south', card: joker, timestamp: 1 }, // Led with Joker (counts as 2 of Spades)
      { playerId: 'west', card: { id: 'spades_5', suit: 'spades', rank: '5', value: 5, cardType: 'standard', isDadajiJoker: false, name: '5 of Spades', shortName: '5♠' }, timestamp: 2 },
      { playerId: 'north', card: { id: 'clubs_3', suit: 'clubs', rank: '3', value: 3, cardType: 'standard', isDadajiJoker: false, name: '3 of Clubs', shortName: '3♣' }, timestamp: 3 },
      { playerId: 'east', card: { id: 'clubs_4', suit: 'clubs', rank: '4', value: 4, cardType: 'standard', isDadajiJoker: false, name: '4 of Clubs', shortName: '4♣' }, timestamp: 4 },
    ];

    const result = determineTrickWinner(trickWithJokerLead, 2, 'hearts', false);
    // 5 of Spades beats 2 of Spades (led Joker)
    assert(result.winnerId === 'west', `5 of Spades should beat led Joker (counted as 2 of Spades), got winner: ${result.winnerId}`);
  });

  test(26, 'The Joker outranks the Ace of trump under normal conditions', () => {
    const trumpAce: Card = { id: 'hearts_A', suit: 'hearts', rank: 'A', value: 14, cardType: 'standard', isDadajiJoker: false, name: 'Ace of Hearts', shortName: 'A♥' };
    const joker = { ...DADAJI_JOKER_CARD };

    const trick: TrickCard[] = [
      { playerId: 'east', card: { id: 'diamonds_5', suit: 'diamonds', rank: '5', value: 5, cardType: 'standard', isDadajiJoker: false, name: '5 of Diamonds', shortName: '5♦' }, timestamp: 1 },
      { playerId: 'north', card: trumpAce, timestamp: 2 },
      { playerId: 'west', card: joker, timestamp: 3 },
      { playerId: 'south', card: { id: 'diamonds_8', suit: 'diamonds', rank: '8', value: 8, cardType: 'standard', isDadajiJoker: false, name: '8 of Diamonds', shortName: '8♦' }, timestamp: 4 },
    ];

    const winner = determineTrickWinner(trick, 5, 'hearts', false);
    assert(winner.winnerId === 'west', `Joker should beat Trump Ace, got winner ${winner.winnerId}`);
  });

  test(27, 'The Joker is devalued during the final trick', () => {
    const eff = getEffectiveJokerCard(13);
    assert(eff.isDevalued === true, 'Joker must be devalued in Trick 13');
    assert(eff.effectiveSuit === 'spades' && eff.effectiveRank === '2', 'Trick 13 Joker must act as 2 of Spades');
  });

  test(28, 'A final-trick Joker acts as a low trump when Spades are trump', () => {
    const spade5: Card = { id: 'spades_5', suit: 'spades', rank: '5', value: 5, cardType: 'standard', isDadajiJoker: false, name: '5 of Spades', shortName: '5♠' };
    const joker = { ...DADAJI_JOKER_CARD };

    // Trick 13 where Spades are trump
    // Player West plays devalued Joker (value 2), Player North plays 5 of Spades (value 5)
    const trick: TrickCard[] = [
      { playerId: 'east', card: { id: 'clubs_8', suit: 'clubs', rank: '8', value: 8, cardType: 'standard', isDadajiJoker: false, name: '8 of Clubs', shortName: '8♣' }, timestamp: 1 },
      { playerId: 'north', card: spade5, timestamp: 2 },
      { playerId: 'west', card: joker, timestamp: 3 }, // Acts as 2 of Spades trump
      { playerId: 'south', card: { id: 'clubs_9', suit: 'clubs', rank: '9', value: 9, cardType: 'standard', isDadajiJoker: false, name: '9 of Clubs', shortName: '9♣' }, timestamp: 4 },
    ];

    const winner = determineTrickWinner(trick, 13, 'spades', false);
    // 5 of Spades beats 2 of Spades (devalued Joker)!
    assert(winner.winnerId === 'north', '5 of Spades must beat 2 of Spades (devalued Joker)');
  });

  test(29, 'A final-trick Joker acts as a weak off-suit card when another suit is trump', () => {
    const heart5: Card = { id: 'hearts_5', suit: 'hearts', rank: '5', value: 5, cardType: 'standard', isDadajiJoker: false, name: '5 of Hearts', shortName: '5♥' };
    const joker = { ...DADAJI_JOKER_CARD };

    // Hearts are trump. Trick 13 led with Clubs.
    // West plays Joker (acts as 2 of Spades, weak off-suit).
    // East led with 8 of Clubs.
    const trick: TrickCard[] = [
      { playerId: 'east', card: { id: 'clubs_8', suit: 'clubs', rank: '8', value: 8, cardType: 'standard', isDadajiJoker: false, name: '8 of Clubs', shortName: '8♣' }, timestamp: 1 },
      { playerId: 'north', card: { id: 'clubs_4', suit: 'clubs', rank: '4', value: 4, cardType: 'standard', isDadajiJoker: false, name: '4 of Clubs', shortName: '4♣' }, timestamp: 2 },
      { playerId: 'west', card: joker, timestamp: 3 }, // Acts as off-suit 2 of Spades
      { playerId: 'south', card: { id: 'clubs_6', suit: 'clubs', rank: '6', value: 6, cardType: 'standard', isDadajiJoker: false, name: '6 of Clubs', shortName: '6♣' }, timestamp: 4 },
    ];

    const winner = determineTrickWinner(trick, 13, 'hearts', false);
    assert(winner.winnerId === 'east', `8 of Clubs should win, got ${winner.winnerId}`);
  });

  test(30, 'The Joker-reveal rule remains active for the entire hand', () => {
    // When Joker is revealed, no permanent trump.
    // Led suit is Clubs. West plays higher Diamond. Since Diamonds are not trump, Clubs King wins!
    const trick: TrickCard[] = [
      { playerId: 'east', card: { id: 'clubs_K', suit: 'clubs', rank: 'K', value: 13, cardType: 'standard', isDadajiJoker: false, name: 'King of Clubs', shortName: 'K♣' }, timestamp: 1 },
      { playerId: 'north', card: { id: 'clubs_9', suit: 'clubs', rank: '9', value: 9, cardType: 'standard', isDadajiJoker: false, name: '9 of Clubs', shortName: '9♣' }, timestamp: 2 },
      { playerId: 'west', card: { id: 'diamonds_A', suit: 'diamonds', rank: 'A', value: 14, cardType: 'standard', isDadajiJoker: false, name: 'Ace of Diamonds', shortName: 'A♦' }, timestamp: 3 },
      { playerId: 'south', card: { id: 'clubs_3', suit: 'clubs', rank: '3', value: 3, cardType: 'standard', isDadajiJoker: false, name: '3 of Clubs', shortName: '3♣' }, timestamp: 4 },
    ];

    const winner = determineTrickWinner(trick, 7, null, true);
    assert(winner.winnerId === 'east', 'In Joker-reveal hand, led suit is highest; off-suit Ace cannot win');
  });

  // ================= SCORING TESTS (31-37) =================
  test(31, 'A bid of 5 with 7 tricks earns +5', () => {
    const res = calculatePartnershipScore(5, 7);
    assert(res.scoreDelta === 5, `Expected +5 points, got ${res.scoreDelta}`);
  });

  test(32, 'A bid of 5 with 4 tricks loses 5', () => {
    const res = calculatePartnershipScore(5, 4);
    assert(res.scoreDelta === -5, `Expected -5 points, got ${res.scoreDelta}`);
  });

  test(33, 'A bid of 10 with at least 10 tricks earns +20', () => {
    const res10 = calculatePartnershipScore(10, 10);
    assert(res10.scoreDelta === 20, `Expected +20 points for 10/10, got ${res10.scoreDelta}`);
    const res11 = calculatePartnershipScore(10, 11);
    assert(res11.scoreDelta === 20, `Expected +20 points for 10/11, got ${res11.scoreDelta}`);
  });

  test(34, 'A bid of 10 with 9 tricks loses 10', () => {
    const res = calculatePartnershipScore(10, 9);
    assert(res.scoreDelta === -10, `Expected -10 points, got ${res.scoreDelta}`);
  });

  test(35, 'A bid of 13 with 13 tricks earns +26', () => {
    const res = calculatePartnershipScore(13, 13);
    assert(res.scoreDelta === 26, `Expected +26 points, got ${res.scoreDelta}`);
  });

  test(36, 'A Boston sweep applies the specified scoring rule', () => {
    // If a team wins all 13 tricks on a standard contract (e.g. bid 5, win 13), score is doubled
    const res = calculatePartnershipScore(5, 13, true);
    assert(res.scoreDelta === 10, `Expected Boston sweep doubled score of 10, got ${res.scoreDelta}`);
  });

  test(37, 'The opposing team receives its applicable failed-contract penalty', () => {
    // Team 1 wins 13 tricks (Boston sweep). Team 2 bid 3 and wins 0 tricks.
    const handScores = calculateHandScores(10, 13, 3, 0);
    assert(handScores.team2.scoreDelta === -3, `Opposing team should lose 3 points, got ${handScores.team2.scoreDelta}`);
  });

  // ================= MATCH TESTS (38-42) =================
  test(38, 'Default Point Mode ends when a team reaches or exceeds 100 points', () => {
    const config = { mode: 'default_points' as const, targetPoints: 100, durationSeconds: 1800 };
    const status1 = evaluateMatchStatus(config, 95, 80, false, false);
    assert(!status1.isMatchOver, 'Match should continue when neither reached 100');

    const status2 = evaluateMatchStatus(config, 105, 80, false, false);
    assert(status2.isMatchOver && status2.winner === 'team1', 'Team 1 should win reaching 105');
  });

  test(39, 'Custom Point Mode respects the chosen target', () => {
    const config = { mode: 'custom_points' as const, targetPoints: 60, durationSeconds: 1800 };
    const status1 = evaluateMatchStatus(config, 55, 40, false, false);
    assert(!status1.isMatchOver, 'Match should continue when below 60');

    const status2 = evaluateMatchStatus(config, 55, 62, false, false);
    assert(status2.isMatchOver && status2.winner === 'team2', 'Team 2 should win reaching 62');
  });

  test(40, 'Time Mode resolves the current hand before declaring the winner', () => {
    const config = { mode: 'time' as const, targetPoints: 100, durationSeconds: 1800 };
    // Time is expired (true), but hand is STILL in progress (true)
    const status = evaluateMatchStatus(config, 40, 30, true, true);
    assert(!status.isMatchOver, 'Match must not end while hand is in progress even if time expired');

    // Hand finished (false), time expired (true)
    const statusDone = evaluateMatchStatus(config, 40, 30, false, true);
    assert(statusDone.isMatchOver && statusDone.winner === 'team1', 'Match should conclude after hand resolves');
  });

  test(41, 'A tie at the end of Time Mode is handled explicitly', () => {
    const config = { mode: 'time' as const, targetPoints: 100, durationSeconds: 1800 };
    const status = evaluateMatchStatus(config, 40, 40, false, true);
    assert(status.isMatchOver && status.winner === 'tie', 'Tie score must be handled explicitly as tie');
  });

  test(42, 'No additional hand starts after match completion', () => {
    const config = { mode: 'default_points' as const, targetPoints: 100, durationSeconds: 1800 };
    let state = initializeMatch(config);
    state.matchWinner = 'team1';

    let threw = false;
    try {
      startHand(state);
    } catch {
      threw = true;
    }
    assert(threw, 'startHand must throw or prevent starting hand when matchWinner is set');
  });

  // ================= PLAYABILITY TESTS (43-45) =================
  test(43, 'A hand with no face cards (A,K,Q,J), no trump cards, and no Joker is flagged as unplayable', () => {
    // 13 low cards from Spades and Clubs (no A, K, Q, J)
    const unplayableHand: Card[] = [
      { id: 'spades_3', suit: 'spades', rank: '3', value: 3, cardType: 'standard', isDadajiJoker: false, name: '3 of Spades', shortName: '3♠' },
      { id: 'spades_4', suit: 'spades', rank: '4', value: 4, cardType: 'standard', isDadajiJoker: false, name: '4 of Spades', shortName: '4♠' },
      { id: 'spades_5', suit: 'spades', rank: '5', value: 5, cardType: 'standard', isDadajiJoker: false, name: '5 of Spades', shortName: '5♠' },
      { id: 'spades_6', suit: 'spades', rank: '6', value: 6, cardType: 'standard', isDadajiJoker: false, name: '6 of Spades', shortName: '6♠' },
      { id: 'spades_7', suit: 'spades', rank: '7', value: 7, cardType: 'standard', isDadajiJoker: false, name: '7 of Spades', shortName: '7♠' },
      { id: 'spades_8', suit: 'spades', rank: '8', value: 8, cardType: 'standard', isDadajiJoker: false, name: '8 of Spades', shortName: '8♠' },
      { id: 'spades_9', suit: 'spades', rank: '9', value: 9, cardType: 'standard', isDadajiJoker: false, name: '9 of Spades', shortName: '9♠' },
      { id: 'spades_10', suit: 'spades', rank: '10', value: 10, cardType: 'standard', isDadajiJoker: false, name: '10 of Spades', shortName: '10♠' },
      { id: 'clubs_3', suit: 'clubs', rank: '3', value: 3, cardType: 'standard', isDadajiJoker: false, name: '3 of Clubs', shortName: '3♣' },
      { id: 'clubs_4', suit: 'clubs', rank: '4', value: 4, cardType: 'standard', isDadajiJoker: false, name: '4 of Clubs', shortName: '4♣' },
      { id: 'clubs_5', suit: 'clubs', rank: '5', value: 5, cardType: 'standard', isDadajiJoker: false, name: '5 of Clubs', shortName: '5♣' },
      { id: 'clubs_6', suit: 'clubs', rank: '6', value: 6, cardType: 'standard', isDadajiJoker: false, name: '6 of Clubs', shortName: '6♣' },
      { id: 'clubs_7', suit: 'clubs', rank: '7', value: 7, cardType: 'standard', isDadajiJoker: false, name: '7 of Clubs', shortName: '7♣' },
    ];

    // Trump is Hearts -> player has no face cards, no trumps (no Hearts), and no Joker
    const playable = isHandPlayable(unplayableHand, 'hearts');
    assert(!playable, 'Hand with no face cards, no trumps, and no Joker must NOT be playable');
  });

  test(44, 'A hand with at least one qualifying card (Face card, Trump, or Joker) is playable', () => {
    const lowBaseCards: Card[] = [
      { id: 'spades_3', suit: 'spades', rank: '3', value: 3, cardType: 'standard', isDadajiJoker: false, name: '3 of Spades', shortName: '3♠' },
      { id: 'spades_4', suit: 'spades', rank: '4', value: 4, cardType: 'standard', isDadajiJoker: false, name: '4 of Spades', shortName: '4♠' },
    ];

    // Qualifying via Face card (King)
    const withKing: Card[] = [...lowBaseCards, { id: 'diamonds_K', suit: 'diamonds' as Suit, rank: 'K' as const, value: 13, cardType: 'standard' as const, isDadajiJoker: false, name: 'King of Diamonds', shortName: 'K♦' }];
    assert(isHandPlayable(withKing, 'hearts'), 'Hand with King must be playable');

    // Qualifying via Trump card
    const withTrump: Card[] = [...lowBaseCards, { id: 'hearts_3', suit: 'hearts' as Suit, rank: '3' as const, value: 3, cardType: 'standard' as const, isDadajiJoker: false, name: '3 of Hearts', shortName: '3♥' }];
    assert(isHandPlayable(withTrump, 'hearts'), 'Hand with Trump must be playable');

    // Qualifying via Joker
    const withJoker = [...lowBaseCards, { ...DADAJI_JOKER_CARD }];
    assert(isHandPlayable(withJoker, 'hearts'), 'Hand with Joker must be playable');
  });

  test(45, 'If any player has no qualifying card, the deal is flagged as unplayable', () => {
    const validHand: Card[] = [
      { id: 'spades_A', suit: 'spades', rank: 'A', value: 14, cardType: 'standard', isDadajiJoker: false, name: 'Ace of Spades', shortName: 'A♠' },
    ];
    const invalidHand: Card[] = [
      { id: 'diamonds_3', suit: 'diamonds', rank: '3', value: 3, cardType: 'standard', isDadajiJoker: false, name: '3 of Diamonds', shortName: '3♦' },
    ];

    const hands: Record<PlayerId, Card[]> = {
      south: validHand,
      east: validHand,
      north: invalidHand, // North has no face cards, no trumps, no Joker
      west: validHand,
    };

    const result = validateDealPlayability(hands, 'spades');
    assert(!result.isPlayable, 'Deal must be invalid if any of the 4 players lacks all qualifying cards');
    assert(result.unplayablePlayerId === 'north', 'Must identify the unplayable player');
  });

  // ================= INTELLIGENCE MODE TESTS (46-48) =================
  test(46, 'Legend Mode executes King-Rescue Strike when opponent drops an Ace over player\'s King', () => {
    const cardKingHearts: Card = { id: 'hearts_K', suit: 'hearts', rank: 'K', value: 13, cardType: 'standard', isDadajiJoker: false, name: 'King of Hearts', shortName: 'K♥' };
    const card7Hearts: Card = { id: 'hearts_7', suit: 'hearts', rank: '7', value: 7, cardType: 'standard', isDadajiJoker: false, name: '7 of Hearts', shortName: '7♥' };
    const joker = { ...DADAJI_JOKER_CARD };
    const hand = [cardKingHearts, card7Hearts, joker];

    // East (opponent) led with Ace of Hearts!
    const currentTrick: TrickCard[] = [
      { playerId: 'east', card: { id: 'hearts_A', suit: 'hearts', rank: 'A', value: 14, cardType: 'standard', isDadajiJoker: false, name: 'Ace of Hearts', shortName: 'A♥' }, timestamp: 1 },
    ];

    const playerSouth = {
      id: 'south' as const,
      name: 'Aadesh',
      title: 'You',
      avatarSeed: 'south',
      teamId: 'team1' as const,
      isHuman: false,
      hand,
      bid: 3,
      tricksWon: 1,
    };

    // In Legend mode: AI must hit the Dadaji Joker to rescue the King!
    const decision = chooseAICard(playerSouth, hand, currentTrick, 3, 'diamonds', false, 'legend');
    assert(decision.isDadajiJoker, 'Legend mode must play Joker on opponent Ace to rescue King');
    assert(Boolean(decision.tacticalTactic?.includes('King-Rescue')), 'Legend mode must label move as King-Rescue Strike');
  });

  test(47, 'Novice Mode does not execute King-Rescue Strike (unveiled only in Legend Mode)', () => {
    const cardKingHearts: Card = { id: 'hearts_K', suit: 'hearts', rank: 'K', value: 13, cardType: 'standard', isDadajiJoker: false, name: 'King of Hearts', shortName: 'K♥' };
    const card7Hearts: Card = { id: 'hearts_7', suit: 'hearts', rank: '7', value: 7, cardType: 'standard', isDadajiJoker: false, name: '7 of Hearts', shortName: '7♥' };
    const joker = { ...DADAJI_JOKER_CARD };
    const hand = [cardKingHearts, card7Hearts, joker];

    // East (opponent) led with Ace of Hearts
    const currentTrick: TrickCard[] = [
      { playerId: 'east', card: { id: 'hearts_A', suit: 'hearts', rank: 'A', value: 14, cardType: 'standard', isDadajiJoker: false, name: 'Ace of Hearts', shortName: 'A♥' }, timestamp: 1 },
    ];

    const playerSouth = {
      id: 'south' as const,
      name: 'Aadesh',
      title: 'You',
      avatarSeed: 'south',
      teamId: 'team1' as const,
      isHuman: false,
      hand,
      bid: 3,
      tricksWon: 1,
    };

    // In Novice mode: AI does NOT do King-Rescue (plays standard follow suit)
    const decision = chooseAICard(playerSouth, hand, currentTrick, 3, 'diamonds', false, 'novice');
    assert(!decision.isDadajiJoker, 'Novice mode must NOT play Joker to rescue King; plays basic card');
  });

  test(48, 'Master & Legend modes enforce Partner Protection and never waste the Joker on partner\'s winning trick', () => {
    const card3Clubs: Card = { id: 'clubs_3', suit: 'clubs', rank: '3', value: 3, cardType: 'standard', isDadajiJoker: false, name: '3 of Clubs', shortName: '3♣' };
    const joker = { ...DADAJI_JOKER_CARD };
    const hand = [card3Clubs, joker];

    // North (Partner of South) is winning the trick with Trump Ace!
    const currentTrick: TrickCard[] = [
      { playerId: 'east', card: { id: 'clubs_10', suit: 'clubs', rank: '10', value: 10, cardType: 'standard', isDadajiJoker: false, name: '10 of Clubs', shortName: '10♣' }, timestamp: 1 },
      { playerId: 'north', card: { id: 'hearts_A', suit: 'hearts', rank: 'A', value: 14, cardType: 'standard', isDadajiJoker: false, name: 'Ace of Hearts', shortName: 'A♥' }, timestamp: 2 },
    ];

    const playerSouth = {
      id: 'south' as const,
      name: 'Aadesh',
      title: 'You',
      avatarSeed: 'south',
      teamId: 'team1' as const,
      isHuman: false,
      hand,
      bid: 2,
      tricksWon: 1,
    };

    // In Master and Legend mode: AI must protect partner and NOT waste the Joker!
    const decisionMaster = chooseAICard(playerSouth, hand, currentTrick, 4, 'hearts', false, 'master');
    assert(!decisionMaster.isDadajiJoker, 'Master mode must not waste Joker on partner\'s trick');

    const decisionLegend = chooseAICard(playerSouth, hand, currentTrick, 4, 'hearts', false, 'legend');
    assert(!decisionLegend.isDadajiJoker, 'Legend mode must not waste Joker on partner\'s trick');
  });

  // ================= CALCULATED RISKS TESTS (49-52) =================
  test(49, 'Legend Mode executes Calculated 10-Bid Contract Push (+20 Bonus Attempt)', () => {
    const cardAceHearts: Card = { id: 'hearts_A', suit: 'hearts', rank: 'A', value: 14, cardType: 'standard', isDadajiJoker: false, name: 'Ace of Hearts', shortName: 'A♥' };
    const card9Hearts: Card = { id: 'hearts_9', suit: 'hearts', rank: '9', value: 9, cardType: 'standard', isDadajiJoker: false, name: '9 of Hearts', shortName: '9♥' };
    const card4Spades: Card = { id: 'spades_4', suit: 'spades', rank: '4', value: 4, cardType: 'standard', isDadajiJoker: false, name: '4 of Spades', shortName: '4♠' };
    const card5Diamonds: Card = { id: 'diamonds_5', suit: 'diamonds', rank: '5', value: 5, cardType: 'standard', isDadajiJoker: false, name: '5 of Diamonds', shortName: '5♦' };
    const card6Clubs: Card = { id: 'clubs_6', suit: 'clubs', rank: '6', value: 6, cardType: 'standard', isDadajiJoker: false, name: '6 of Clubs', shortName: '6♣' };
    const hand = [cardAceHearts, card9Hearts, card4Spades, card5Diamonds, card6Clubs];

    // Trump is Hearts. Partner already bid 7.
    // Standard valuation yields 1 trick (combined = 8).
    // Legend calculates high reward of reaching combined 10 for +20 bonus and stretches bid to 3!
    const decision = calculateAIBid(hand, 'hearts', false, 7, 'legend');
    assert(decision.bid === 3, `Expected calculated push to 3, got ${decision.bid}`);
    assert(Boolean(decision.isCalculatedRisk), 'Must flag as calculated risk');
    assert(Boolean(decision.tacticalReason?.includes('10-Bid Push')), 'Reason must specify 10-Bid Push');
  });

  test(50, 'Legend Mode executes Calculated Trump Extraction when holding dominant trumps & side Bosses', () => {
    const trumpA: Card = { id: 'hearts_A', suit: 'hearts', rank: 'A', value: 14, cardType: 'standard', isDadajiJoker: false, name: 'Ace of Hearts', shortName: 'A♥' };
    const trumpK: Card = { id: 'hearts_K', suit: 'hearts', rank: 'K', value: 13, cardType: 'standard', isDadajiJoker: false, name: 'King of Hearts', shortName: 'K♥' };
    const trump9: Card = { id: 'hearts_9', suit: 'hearts', rank: '9', value: 9, cardType: 'standard', isDadajiJoker: false, name: '9 of Hearts', shortName: '9♥' };
    const clubA: Card = { id: 'clubs_A', suit: 'clubs', rank: 'A', value: 14, cardType: 'standard', isDadajiJoker: false, name: 'Ace of Clubs', shortName: 'A♣' };
    const hand = [trumpA, trumpK, trump9, clubA];

    const player = {
      id: 'south' as const,
      name: 'Aadesh',
      title: 'You',
      avatarSeed: 'south',
      teamId: 'team1' as const,
      isHuman: false,
      hand,
      bid: 4,
      tricksWon: 0,
    };

    // Leading trick 2, Trump is Hearts. AI holds 3 trumps (including Ace & King) and side Boss (Ace of Clubs).
    // Legend AI extracts trumps to prevent opponents ruffing the Ace of Clubs!
    const decision = chooseAICard(player, hand, [], 2, 'hearts', false, 'legend');
    assert(decision.suit === 'hearts', `Expected trump extraction lead, got ${decision.suit}`);
    assert(Boolean(decision.tacticalTactic?.includes('Trump Extraction')), 'Must annotate as Calculated Trump Extraction');
  });

  test(51, 'Legend Mode executes Calculated Under-lead Finesse from Ace-Queen holding', () => {
    const spadeA: Card = { id: 'spades_A', suit: 'spades', rank: 'A', value: 14, cardType: 'standard', isDadajiJoker: false, name: 'Ace of Spades', shortName: 'A♠' };
    const spadeQ: Card = { id: 'spades_Q', suit: 'spades', rank: 'Q', value: 12, cardType: 'standard', isDadajiJoker: false, name: 'Queen of Spades', shortName: 'Q♠' };
    const spade5: Card = { id: 'spades_5', suit: 'spades', rank: '5', value: 5, cardType: 'standard', isDadajiJoker: false, name: '5 of Spades', shortName: '5♠' };
    const hand = [spadeA, spadeQ, spade5];

    const player = {
      id: 'south' as const,
      name: 'Aadesh',
      title: 'You',
      avatarSeed: 'south',
      teamId: 'team1' as const,
      isHuman: false,
      hand,
      bid: 2,
      tricksWon: 0,
    };

    // Hearts are trump. AI leads with Ace + Queen + 5 of Spades.
    // Instead of bashing Ace, Legend under-leads 5 of Spades to trap opponent's King!
    const decision = chooseAICard(player, hand, [], 2, 'hearts', false, 'legend');
    assert(decision.id === 'spades_5', `Expected under-lead of 5 of Spades, got ${decision.shortName}`);
    assert(Boolean(decision.tacticalTactic?.includes('Under-lead Finesse')), 'Must annotate as Calculated Under-lead Finesse');
  });

  test(52, 'Legend Mode executes Calculated Boston Interception when opposing team threatens a sweep', () => {
    const diamondK: Card = { id: 'diamonds_K', suit: 'diamonds', rank: 'K', value: 13, cardType: 'standard', isDadajiJoker: false, name: 'King of Diamonds', shortName: 'K♦' };
    const diamond7: Card = { id: 'diamonds_7', suit: 'diamonds', rank: '7', value: 7, cardType: 'standard', isDadajiJoker: false, name: '7 of Diamonds', shortName: '7♦' };
    const hand = [diamondK, diamond7];

    const player = {
      id: 'south' as const,
      name: 'Aadesh',
      title: 'You',
      avatarSeed: 'south',
      teamId: 'team1' as const,
      isHuman: false,
      hand,
      bid: 3,
      tricksWon: 0,
    };

    // Opponent East won Trick 1, 2, and 3 (opponents sweeping!)
    const trickHistory: TrickResult[] = [
      { trickNumber: 1, leadPlayer: 'east', winnerId: 'east', winningCard: { id: 'clubs_A', suit: 'clubs', rank: 'A', value: 14, cardType: 'standard', isDadajiJoker: false, name: 'Ace of Clubs', shortName: 'A♣' }, cards: [] },
      { trickNumber: 2, leadPlayer: 'east', winnerId: 'west', winningCard: { id: 'hearts_K', suit: 'hearts', rank: 'K', value: 13, cardType: 'standard', isDadajiJoker: false, name: 'King of Hearts', shortName: 'K♥' }, cards: [] },
      { trickNumber: 3, leadPlayer: 'west', winnerId: 'east', winningCard: { id: 'spades_A', suit: 'spades', rank: 'A', value: 14, cardType: 'standard', isDadajiJoker: false, name: 'Ace of Spades', shortName: 'A♠' }, cards: [] },
    ];

    // Trick 4: Opponent West leads 9 of Diamonds
    const currentTrick: TrickCard[] = [
      { playerId: 'west', card: { id: 'diamonds_9', suit: 'diamonds', rank: '9', value: 9, cardType: 'standard', isDadajiJoker: false, name: '9 of Diamonds', shortName: '9♦' }, timestamp: 1 },
    ];

    // AI South follows: must intercept Boston with King of Diamonds!
    const decision = chooseAICard(player, hand, currentTrick, 4, 'spades', false, 'legend', trickHistory);
    assert(decision.id === 'diamonds_K', `Expected King of Diamonds to intercept Boston, got ${decision.shortName}`);
    assert(Boolean(decision.tacticalTactic?.includes('Boston Interception')), 'Must annotate as Calculated Boston Interception');
  });

  // ================= 6-BID THRESHOLD, SKIP ROUNDS & SHOW HAND TESTS (53-55) =================
  test(53, 'Minimum 6-Bid Contract Threshold triggers automatic reshuffle when both team bids are below 6', () => {
    // Both teams below 6 (e.g. 5 and 5) -> must trigger reshuffle
    const bothBelow6 = checkReshuffleCondition(5, 5, 'both_below_6');
    assert(bothBelow6.requiresReshuffle === true, 'Bids of 5 vs 5 must trigger reshuffle');

    // Both teams below 6 (e.g. 4 and 5) -> must trigger reshuffle
    const lowBids = checkReshuffleCondition(4, 5, 'both_below_6');
    assert(lowBids.requiresReshuffle === true, 'Bids of 4 vs 5 must trigger reshuffle');

    // One team reaches 6 or higher (e.g. Team 1 bids 5, Team 2 bids 6) -> valid! Play proceeds!
    const validThreshold = checkReshuffleCondition(5, 6, 'both_below_6');
    assert(validThreshold.requiresReshuffle === false, 'Bids of 5 vs 6 must NOT trigger reshuffle because Team 2 reached 6');

    // Both reach 6 or higher (e.g. 6 and 7) -> valid!
    const highBids = checkReshuffleCondition(6, 7, 'both_below_6');
    assert(highBids.requiresReshuffle === false, 'Bids of 6 vs 7 must NOT trigger reshuffle');
  });

  test(54, 'Human player can skip remaining rounds once both team contracts are achieved', () => {
    let state = initializeMatch();
    state = startHand(state);

    // Set playing phase with Team 1 bid 5, won 5; Team 2 bid 6, won 6
    state = {
      ...state,
      phase: 'playing',
      trickNumber: 12,
      partnerships: {
        team1: { ...state.partnerships.team1, totalBid: 5, tricksWon: 5, matchScore: 10 },
        team2: { ...state.partnerships.team2, totalBid: 6, tricksWon: 6, matchScore: 20 },
      },
    };

    const advancedState = skipRemainingTricks(state);
    assert(advancedState.phase === 'round_summary', 'Hand must immediately transition to round_summary');
    assert(advancedState.partnerships.team1.matchScore === 15, `Expected Team 1 score 15, got ${advancedState.partnerships.team1.matchScore}`);
    assert(advancedState.partnerships.team2.matchScore === 26, `Expected Team 2 score 26, got ${advancedState.partnerships.team2.matchScore}`);
    assert(advancedState.statusMessage.includes('Both contracts achieved'), 'Status message must note both contracts achieved');
  });

  test(55, 'Show Hand awards contract on valid claim and penalizes with (Total Score - Current Bid) on fail', () => {
    let state = initializeMatch();
    state = startHand(state);

    // Opponents (Team 2) achieved bid of 6 (tricksWon = 6)
    // Team 1 bid 5, but currently has won 4 tricks (needs 1 more trick)
    const cardSpadeA: Card = { id: 'spades_A', suit: 'spades', rank: 'A', value: 14, cardType: 'standard', isDadajiJoker: false, name: 'Ace of Spades', shortName: 'A♠' };
    const joker = { ...DADAJI_JOKER_CARD };

    state = {
      ...state,
      phase: 'playing',
      trickNumber: 11,
      trumpSuit: 'hearts',
      partnerships: {
        team1: { ...state.partnerships.team1, totalBid: 5, tricksWon: 4, matchScore: 30, roundScoreHistory: [] },
        team2: { ...state.partnerships.team2, totalBid: 6, tricksWon: 6, matchScore: 20, roundScoreHistory: [] },
      },
      players: {
        ...state.players,
        south: { ...state.players.south, hand: [joker] }, // Holds unassailable Dadaji Joker
        north: { ...state.players.north, hand: [] },
        east: { ...state.players.east, hand: [cardSpadeA] },
        west: { ...state.players.west, hand: [] },
      },
    };

    // 1. Success test: With Dadaji Joker held, guaranteed winners = 1, needed tricks = 1 -> Claim succeeds!
    const analysis = evaluateShowHand(state);
    assert(analysis.isGuaranteedSuccess === true, 'Holding Dadaji Joker for 1 needed trick must be guaranteed success');

    const successState = claimShowHand(state, true);
    assert(successState.phase === 'round_summary', 'Hand must transition to round_summary on success');
    assert(successState.partnerships.team1.tricksWon === 5, 'Team 1 tricks won must be credited to contract');
    assert(successState.partnerships.team1.matchScore === 35, `Team 1 must gain 5 points for contract (30 + 5 = 35), got ${successState.partnerships.team1.matchScore}`);

    // 2. Failure test: If claim fails, penalty is strictly: Total Score - Current Bid (30 - 5 = 25)
    const failState = claimShowHand(state, false);
    assert(failState.phase === 'round_summary', 'Hand must transition to round_summary on failure');
    assert(failState.partnerships.team1.matchScore === 25, `Failed claim must penalize Total Score - Current Bid (30 - 5 = 25), got ${failState.partnerships.team1.matchScore}`);
    assert(failState.statusMessage.includes('Total score reduced by bid'), 'Status message must report score reduction by bid');
  });

  // Test 56: Interactive Show Hand - Verification succeeds when player selects guaranteed winners
  test(56, 'Interactive Show Hand: System verifies user-selected cards correctly and approves guaranteed winning cards', () => {
    let state = initializeMatch();
    state = startHand(state);

    const aceSpadesTrump: Card = { id: 'spades_A', suit: 'spades', rank: 'A', value: 14, cardType: 'standard', isDadajiJoker: false, name: 'Ace of Spades', shortName: 'A♠' };
    const kingSpadesTrump: Card = { id: 'spades_K', suit: 'spades', rank: 'K', value: 13, cardType: 'standard', isDadajiJoker: false, name: 'King of Spades', shortName: 'K♠' };
    const tenHearts: Card = { id: 'hearts_10', suit: 'hearts', rank: '10', value: 10, cardType: 'standard', isDadajiJoker: false, name: '10 of Hearts', shortName: '10♥' };

    const oppQueenSpadesTrump: Card = { id: 'spades_Q', suit: 'spades', rank: 'Q', value: 12, cardType: 'standard', isDadajiJoker: false, name: 'Queen of Spades', shortName: 'Q♠' };
    const oppEightHearts: Card = { id: 'hearts_8', suit: 'hearts', rank: '8', value: 8, cardType: 'standard', isDadajiJoker: false, name: '8 of Hearts', shortName: '8♥' };

    state = {
      ...state,
      phase: 'playing',
      trickNumber: 11,
      trumpSuit: 'spades',
      partnerships: {
        team1: { ...state.partnerships.team1, totalBid: 5, tricksWon: 3, matchScore: 25, roundScoreHistory: [] },
        team2: { ...state.partnerships.team2, totalBid: 6, tricksWon: 6, matchScore: 20, roundScoreHistory: [] },
      },
      players: {
        ...state.players,
        south: { ...state.players.south, hand: [aceSpadesTrump, kingSpadesTrump, tenHearts] },
        north: { ...state.players.north, hand: [] },
        east: { ...state.players.east, hand: [oppQueenSpadesTrump, oppEightHearts] },
        west: { ...state.players.west, hand: [] },
      },
    };

    // South needs 2 tricks (5 totalBid - 3 tricksWon = 2 needed)
    // South selects A♠ and K♠:
    const verification = verifyUserSelectedCards(state, ['spades_A', 'spades_K']);
    assert(verification.isValid === true, 'Selecting A♠ and K♠ against Q♠ must pass verification');
    assert(verification.verifiedWinnersCount === 2, `Must verify 2 winners, got ${verification.verifiedWinnersCount}`);

    // Executing claimShowHand with these selected card IDs must fulfill the contract
    const claimedState = claimShowHand(state, ['spades_A', 'spades_K']);
    assert(claimedState.phase === 'round_summary', 'Must transition to round_summary on successful verified claim');
    assert(claimedState.partnerships.team1.tricksWon === 5, 'Must award 5 tricks won');
    assert(claimedState.partnerships.team1.matchScore === 30, `Score must increase by bid (25 + 5 = 30), got ${claimedState.partnerships.team1.matchScore}`);
  });

  // Test 57: Interactive Show Hand - Verification catches flawed card selection and enforces Total Score - Current Bid penalty
  test(57, 'Interactive Show Hand: System catches flawed card selection, rejects claim, and applies penalty Total Score - Current Bid', () => {
    let state = initializeMatch();
    state = startHand(state);

    const queenHearts: Card = { id: 'hearts_Q', suit: 'hearts', rank: 'Q', value: 12, cardType: 'standard', isDadajiJoker: false, name: 'Queen of Hearts', shortName: 'Q♥' };
    const jackDiamonds: Card = { id: 'diamonds_J', suit: 'diamonds', rank: 'J', value: 11, cardType: 'standard', isDadajiJoker: false, name: 'Jack of Diamonds', shortName: 'J♦' };

    // Opponent still holds trump and ace of hearts
    const oppTrump: Card = { id: 'spades_5', suit: 'spades', rank: '5', value: 5, cardType: 'standard', isDadajiJoker: false, name: '5 of Spades', shortName: '5♠' };
    const oppAceHearts: Card = { id: 'hearts_A', suit: 'hearts', rank: 'A', value: 14, cardType: 'standard', isDadajiJoker: false, name: 'Ace of Hearts', shortName: 'A♥' };

    state = {
      ...state,
      phase: 'playing',
      trickNumber: 11,
      trumpSuit: 'spades',
      partnerships: {
        team1: { ...state.partnerships.team1, totalBid: 6, tricksWon: 4, matchScore: 40, roundScoreHistory: [] },
        team2: { ...state.partnerships.team2, totalBid: 6, tricksWon: 6, matchScore: 20, roundScoreHistory: [] },
      },
      players: {
        ...state.players,
        south: { ...state.players.south, hand: [queenHearts, jackDiamonds] },
        north: { ...state.players.north, hand: [] },
        east: { ...state.players.east, hand: [oppTrump] },
        west: { ...state.players.west, hand: [oppAceHearts] },
      },
    };

    // South needs 2 tricks (6 - 4 = 2), but selects Q♥ and J♦ when opponent holds 5♠ (trump) and A♥!
    const verification = verifyUserSelectedCards(state, ['hearts_Q', 'diamonds_J']);
    assert(verification.isValid === false, 'Selecting side cards when opponent has trumps must fail verification');
    assert(verification.cardVerifications.some(cv => cv.status === 'failed'), 'At least one card verification must fail');

    // Executing claimShowHand with flawed card IDs must enforce penalty: Total Score - Current Bid (40 - 6 = 34)
    const penalizedState = claimShowHand(state, ['hearts_Q', 'diamonds_J']);
    assert(penalizedState.phase === 'round_summary', 'Must transition to round_summary on failed verified claim');
    assert(penalizedState.partnerships.team1.matchScore === 34, `Must penalize score by bid (40 - 6 = 34), got ${penalizedState.partnerships.team1.matchScore}`);
    assert(penalizedState.statusMessage.includes('Penalty applied'), 'Status message must report penalty applied');
  });

  // Test 58: Multilingual Rulebook (English, Hindi, Odia) verification
  test(58, 'Multilingual Rulebook contains complete chapters in English, Hindi, and Odia', () => {
    const langs: ('en' | 'hi' | 'or')[] = ['en', 'hi', 'or'];
    for (const l of langs) {
      const book = RULEBOOK_TRANSLATIONS[l];
      assert(!!book, `Rulebook for language ${l} must exist`);
      assert(book.title.length > 0, `Title for language ${l} must not be empty`);
      assert(book.sections.length >= 7, `Language ${l} must have at least 7 complete sections, got ${book.sections.length}`);
      for (const section of book.sections) {
        assert(section.title.length > 0, `Section title in ${l} must not be empty`);
        assert(section.points.length >= 2, `Section in ${l} must have at least 2 key points`);
      }
    }
    // Verify native Odia phrasing requirements
    const odiaBook = RULEBOOK_TRANSLATIONS.or;
    assert(
      odiaBook.sections[1].points.some(pt => pt.includes('କଳା ପାନ୍ ଦୁଇ')),
      'Odia section 2 must reference Two of Spades as "କଳା ପାନ୍ ଦୁଇ"'
    );
    assert(
      odiaBook.sections[4].title.includes('ଜୋକର୍ ଖେଳିବା ନିୟମ'),
      'Odia section 5 title must be "ଜୋକର୍ ଖେଳିବା ନିୟମ"'
    );
  });

  // Test 59: Card suits and Joker localized nomenclature verification
  test(59, 'Card suits and Joker names match exact Odia, Hindi, and English requirements', () => {
    // Clubs
    assert(SUIT_NAMES.clubs === 'Clubs', 'Clubs English name must be Clubs');
    assert(SUIT_NAMES_ODIA.clubs === 'ଚିଡ଼ିଆ', 'Clubs Odia name must be ଚିଡ଼ିଆ');
    assert(SUIT_NAMES_HINDI.clubs === 'चिडि', 'Clubs Hindi name must be चिडि');

    // Hearts
    assert(SUIT_NAMES.hearts === 'Hearts', 'Hearts English name must be Hearts');
    assert(SUIT_NAMES_ODIA.hearts === 'ଲାଲ୍ ପାନ୍', 'Hearts Odia name must be ଲାଲ୍ ପାନ୍');
    assert(SUIT_NAMES_HINDI.hearts === 'पान', 'Hearts Hindi name must be पान');

    // Spades
    assert(SUIT_NAMES.spades === 'Spades', 'Spades English name must be Spades');
    assert(SUIT_NAMES_ODIA.spades === 'କଳା ପାନ୍', 'Spades Odia name must be କଳା ପାନ୍');
    assert(SUIT_NAMES_HINDI.spades === 'हुकुम', 'Spades Hindi name must be हुकुम');

    // Diamond
    assert(SUIT_NAMES.diamonds === 'Diamond', 'Diamond English name must be Diamond');
    assert(SUIT_NAMES_ODIA.diamonds === 'ଠିକିରି', 'Diamond Odia name must be ଠିକିରି');
    assert(SUIT_NAMES_HINDI.diamonds === 'ईट', 'Diamond Hindi name must be ईट');

    // Joker
    assert(JOKER_NAMES.en === 'Joker', 'Joker English name must be Joker');
    assert(JOKER_NAMES.or === 'ଜୋକର୍', 'Joker Odia name must be ଜୋକର୍');
    assert(JOKER_NAMES.hi === 'जोकर', 'Joker Hindi name must be जोकर');

    // Multilingual mappings check
    assert(MULTILINGUAL_SUIT_NAMES.clubs.or === 'ଚିଡ଼ିଆ' && MULTILINGUAL_SUIT_NAMES.clubs.hi === 'चिडि', 'Multilingual clubs mapping valid');
    assert(MULTILINGUAL_SUIT_NAMES.hearts.or === 'ଲାଲ୍ ପାନ୍' && MULTILINGUAL_SUIT_NAMES.hearts.hi === 'पान', 'Multilingual hearts mapping valid');
    assert(MULTILINGUAL_SUIT_NAMES.spades.or === 'କଳା ପାନ୍' && MULTILINGUAL_SUIT_NAMES.spades.hi === 'हुकुम', 'Multilingual spades mapping valid');
    assert(MULTILINGUAL_SUIT_NAMES.diamonds.or === 'ଠିକିରି' && MULTILINGUAL_SUIT_NAMES.diamonds.hi === 'ईट', 'Multilingual diamond mapping valid');
  });

  // Test 60: Multilingual Modal Dictionaries Verification
  test(60, 'All pop pages have comprehensive 3-language translations (EN, HI, OR)', () => {
    const langs: ('en' | 'hi' | 'or')[] = ['en', 'hi', 'or'];
    for (const l of langs) {
      const dict = MODAL_TRANSLATIONS[l];
      assert(!!dict, `Modal translations dictionary for ${l} must exist`);
      // Scoreboard
      assert(!!dict.scoreboard.titleFinal, `Scoreboard in ${l} must have titleFinal`);
      assert(!!dict.scoreboard.colPartnership, `Scoreboard in ${l} must have colPartnership`);
      assert(!!dict.scoreboard.bostonSweep, `Scoreboard in ${l} must have bostonSweep`);
      // Match Config
      assert(!!dict.matchConfig.title, `Match Config in ${l} must have title`);
      assert(!!dict.matchConfig.defaultModeTitle, `Match Config in ${l} must have defaultModeTitle`);
      // Tactics
      assert(!!dict.tactics.title, `Tactics in ${l} must have title`);
      assert(dict.tactics.noviceUnveiled.length >= 3, `Tactics novice in ${l} must have unveiled tricks`);
      assert(dict.tactics.masterUnveiled.length >= 4, `Tactics master in ${l} must have unveiled tricks`);
      assert(dict.tactics.legendUnveiled.length >= 8, `Tactics legend in ${l} must have unveiled tricks`);
      // Trump Inspect
      assert(!!dict.trumpInspect.title, `Trump inspect in ${l} must have title`);
      assert(!!dict.trumpInspect.badge, `Trump inspect in ${l} must have badge`);
      // Show Hand
      assert(!!dict.showHand.title, `Show Hand in ${l} must have title`);
      assert(!!dict.showHand.penaltyNoticeTitle, `Show Hand in ${l} must have penaltyNoticeTitle`);
      assert(!!dict.showHand.verifiedPassedTitle, `Show Hand in ${l} must have verifiedPassedTitle`);
      // Test Runner
      assert(!!dict.testRunner.badge, `Test runner in ${l} must have badge`);
      assert(!!dict.testRunner.allPassedBanner, `Test runner in ${l} must have allPassedBanner`);
    }
  });

  // Test 61: Strict Odia Native Terminology in Modals
  test(61, 'Odia modal dictionaries use authentic card-table terminology', () => {
    const orDict = MODAL_TRANSLATIONS.or;
    // Two of Spades referenced as 'କଳା ପାନ୍ ଦୁଇ'
    assert(
      orDict.tactics.masterUnveiled.some(t => t.includes('କଳା ପାନ୍ ଦୁଇ')),
      'Odia master tactics must mention "କଳା ପାନ୍ ଦୁଇ"'
    );
    // Dadaji Joker referenced in showHand tip
    assert(
      orDict.showHand.tip.includes('ଦାଦାଜୀ ଜୋକର୍'),
      'Odia showHand tip must mention "ଦାଦାଜୀ ଜୋକର୍"'
    );
    // Boston Sweep in Odia scoreboard
    assert(
      orDict.scoreboard.bostonSweep.includes('ବୋଷ୍ଟନ୍ ସୁଇପ୍'),
      'Odia scoreboard must use "ବୋଷ୍ଟନ୍ ସୁଇପ୍"'
    );
    // Ruling Trump in Odia Trump Inspect
    assert(
      orDict.trumpInspect.title.includes('ତୁରୁପ୍'),
      'Odia trump inspect must use "ତୁରୁପ୍"'
    );
  });

  const passedCount = results.filter(r => r.passed).length;
  return { passedCount, totalCount: results.length, results };
}

// If executed via node / tsx directly in command line
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('runTests')) {
  console.log('Running Universal Joker 55 Automated Engine Tests...\n');
  const outcome = runAllTests();
  for (const r of outcome.results) {
    if (r.passed) {
      console.log(`[PASS] Test #${r.id}: ${r.description}`);
    } else {
      console.error(`[FAIL] Test #${r.id}: ${r.description}\n       Error: ${r.error}`);
    }
  }
  console.log(`\nResults: ${outcome.passedCount} / ${outcome.totalCount} tests passed.`);
  if (outcome.passedCount !== outcome.totalCount) {
    process.exit(1);
  }
}
