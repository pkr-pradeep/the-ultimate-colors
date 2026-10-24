import {
  createUniversalJokerDeck,
  validateDeckStructure,
  DADAJI_JOKER_CARD,
} from '../engine/deck';
import {
  dealHand,
  getNextPlayerCounterClockwise,
  validateDealtHands,
} from '../engine/dealing';
import {
  validateIndividualBid,
  validatePartnershipBid,
  validateAllBids,
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
import { calculateAIBid } from '../engine/ai';
import {
  initializeMatch,
  startHand,
  submitPlayerBid,
  executeCardPlay,
  resolveCompletedTrick,
} from '../engine/gameEngine';
import { Card, PlayerId, TrickCard } from '../types/game';

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
    const aiBidPartner0 = calculateAIBid([], 'hearts', false, 0);
    assert(aiBidPartner0 >= 2, `AI should bid at least 2 when partner bid 0, got ${aiBidPartner0}`);
    // If partner already bid 1, AI must bid at least 1
    const aiBidPartner1 = calculateAIBid([], 'hearts', false, 1);
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
  test(23, 'The Joker cannot be played during the first trick', () => {
    const joker = { ...DADAJI_JOKER_CARD };
    const cardHeartK: Card = { id: 'hearts_K', suit: 'hearts', rank: 'K', value: 13, cardType: 'standard', isDadajiJoker: false, name: 'King of Hearts', shortName: 'K♥' };
    const hand = [joker, cardHeartK];

    const currentTrick: TrickCard[] = [
      { playerId: 'east', card: { id: 'spades_10', suit: 'spades', rank: '10', value: 10, cardType: 'standard', isDadajiJoker: false, name: '10 of Spades', shortName: '10♠' }, timestamp: 1 },
    ];

    const legalInTrick1 = getLegalCards(hand, currentTrick, 1, 'diamonds');
    assert(!legalInTrick1.some(c => c.isDadajiJoker), 'Joker must not be legal in Trick 1');

    const val = validateCardPlay(joker, 'south', 'south', hand, currentTrick, 1, 'diamonds');
    assert(!val.isValid, 'Rule B: Joker play in Trick 1 must be rejected');
  });

  test(24, 'The Joker cannot legally lead a trick', () => {
    const joker = { ...DADAJI_JOKER_CARD };
    const cardHeartK: Card = { id: 'hearts_K', suit: 'hearts', rank: 'K', value: 13, cardType: 'standard', isDadajiJoker: false, name: 'King of Hearts', shortName: 'K♥' };
    const hand = [joker, cardHeartK];

    const legalLead = getLegalCards(hand, [], 2, 'diamonds');
    assert(!legalLead.some(c => c.isDadajiJoker), 'Joker must not be legal to lead');

    const val = validateCardPlay(joker, 'south', 'south', hand, [], 2, 'diamonds');
    assert(!val.isValid, 'Rule C: Leading Joker must be rejected by move validator');
  });

  test(25, 'The specified illegal-lead penalty is handled separately from legal move validation', () => {
    const penalized = applyIllegalJokerLeadPenalty();
    assert(penalized.suit === 'spades', 'Penalized Joker must act as Spades');
    assert(penalized.rank === '2', 'Penalized Joker must act as 2');
    assert(penalized.value === 2, 'Penalized Joker value must be 2');
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

  const passedCount = results.filter(r => r.passed).length;
  return { passedCount, totalCount: results.length, results };
}

// If executed via node / tsx directly in command line
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('runTests')) {
  console.log('Running Universal Joker 42 Automated Engine Tests...\n');
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
