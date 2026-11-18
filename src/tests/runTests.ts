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
  advanceToNextHand,
  skipRemainingTricks,
  claimShowHand,
  evaluateContractOutcomes,
  confirmPlayAgain,
  exitCompletedMatch,
  buildEarlyTerminationNotification,
  EARLY_TERMINATION_NOTIFICATION_DURATION_MS,
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

  // ================= 6-BID SUMMATION THRESHOLD, SKIP ROUNDS & SHOW HAND TESTS (53-55) =================
  test(53, 'Reshuffle rule: Reshuffle happens when summation of two team bids is not greater than or equal to 6', () => {
    // Summation strictly below 6 (e.g. 2 vs 2 = 4, 2 vs 3 = 5, 4 vs 1 = 5) -> must trigger reshuffle
    const sum4 = checkReshuffleCondition(2, 2, 'sum_below_6');
    assert(sum4.requiresReshuffle === true, 'Bids of 2 vs 2 (sum 4) must trigger reshuffle');

    const sum5 = checkReshuffleCondition(2, 3, 'sum_below_6');
    assert(sum5.requiresReshuffle === true, 'Bids of 2 vs 3 (sum 5) must trigger reshuffle');

    const sum41 = checkReshuffleCondition(4, 1, 'sum_below_6');
    assert(sum41.requiresReshuffle === true, 'Bids of 4 vs 1 (sum 5) must trigger reshuffle');

    // Summation exactly 6: Team A bids 4, Team B bids 2 (4 + 2 = 6 >= 6) -> play proceeds!
    const exact6 = checkReshuffleCondition(4, 2, 'sum_below_6');
    assert(exact6.requiresReshuffle === false, 'Team A 4 and Team B 2 equals 6 >= 6: play proceeds without reshuffle');

    // Summation 3 vs 3 (sum 6 >= 6) -> valid, play proceeds!
    const valid33 = checkReshuffleCondition(3, 3, 'sum_below_6');
    assert(valid33.requiresReshuffle === false, 'Bids of 3 vs 3 (sum 6) must NOT trigger reshuffle');

    // Higher bids (e.g. 5 vs 5 = 10, 5 vs 6 = 11) -> valid!
    const highBids = checkReshuffleCondition(5, 5, 'sum_below_6');
    assert(highBids.requiresReshuffle === false, 'Bids of 5 vs 5 (sum 10 >= 6) must NOT trigger reshuffle');
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

  // ================= EARLY TERMINATION, SCORING & MATCH CONFIRMATION TESTS (62-87) =================
  const makeCard = (suit: Suit, rank: Card['rank'], value: number): Card => ({
    id: `${suit}_${rank}`,
    suit,
    rank,
    value,
    cardType: 'standard',
    isDadajiJoker: false,
    name: `${rank} of ${suit}`,
    shortName: `${rank}${suit[0].toUpperCase()}`,
  });

  const buildCompletedTrickState = (params: {
    trickNumber: number;
    team1Bid: number;
    team1TricksBefore: number;
    team2Bid: number;
    team2TricksBefore: number;
    winnerId: PlayerId;
    team1MatchScore?: number;
    team2MatchScore?: number;
    targetPoints?: number;
    dealer?: PlayerId;
    handNumber?: number;
  }) => {
    let state = initializeMatch({
      mode: 'custom_points',
      targetPoints: params.targetPoints ?? 100,
      durationSeconds: 1800,
    });
    state = startHand(state);

    const trick: TrickCard[] = [
      { playerId: 'south', card: makeCard('clubs', '4', 4), timestamp: 1 },
      { playerId: 'east', card: makeCard('clubs', '5', 5), timestamp: 2 },
      { playerId: 'north', card: makeCard('clubs', '6', 6), timestamp: 3 },
      { playerId: 'west', card: makeCard('clubs', '7', 7), timestamp: 4 },
    ];
    // Ensure winnerId plays highest card (Ace of Clubs)
    const winnerIndex = trick.findIndex(t => t.playerId === params.winnerId);
    trick[winnerIndex] = { playerId: params.winnerId, card: makeCard('clubs', 'A', 14), timestamp: 5 };

    return {
      ...state,
      handNumber: params.handNumber ?? state.handNumber,
      dealer: params.dealer ?? state.dealer,
      trumpSuit: 'spades' as Suit,
      isJokerRevealHand: false,
      phase: 'trick_completed' as const,
      trickNumber: params.trickNumber,
      leadPlayer: 'south' as PlayerId,
      lastTrickWinner: params.winnerId,
      currentTrick: trick,
      partnerships: {
        team1: {
          ...state.partnerships.team1,
          totalBid: params.team1Bid,
          tricksWon: params.team1TricksBefore,
          matchScore: params.team1MatchScore ?? 0,
        },
        team2: {
          ...state.partnerships.team2,
          totalBid: params.team2Bid,
          tricksWon: params.team2TricksBefore,
          matchScore: params.team2MatchScore ?? 0,
        },
      },
    };
  };

  test(62, 'Early termination: Both teams successfully fulfil their bids', () => {
    const evalRes = evaluateContractOutcomes(5, 5, 5, 5, 10);
    assert(evalRes.bothSucceeded === true, 'Both teams winning their 5-bids after 10 tricks must set bothSucceeded');
    assert(evalRes.bothOutcomesDetermined === true, 'Both outcomes must be determined');
    assert(evalRes.shouldTerminateOnFailure === false, 'Successful contracts must preserve skip flow instead of failure termination');

    let state = initializeMatch();
    state = startHand(state);
    state = {
      ...state,
      phase: 'playing',
      trickNumber: 11,
      partnerships: {
        team1: { ...state.partnerships.team1, totalBid: 5, tricksWon: 5, matchScore: 0 },
        team2: { ...state.partnerships.team2, totalBid: 5, tricksWon: 5, matchScore: 0 },
      },
    };
    const skipped = skipRemainingTricks(state);
    assert(skipped.phase === 'round_summary', 'Existing skipRemainingTricks must terminate hand cleanly');
    assert(skipped.partnerships.team1.matchScore === 5, 'Team 1 must receive +5');
    assert(skipped.partnerships.team2.matchScore === 5, 'Team 2 must receive +5');
  });

  test(63, 'Early termination: Only Team A fails while Team B remains capable -> continues playing', () => {
    // After 7 tricks, 6 remain. Team A bid 7 won 0 (max 6 < 7 -> failed). Team B bid 8 won 7 (max 13 >= 8 -> achievable).
    const state = buildCompletedTrickState({
      trickNumber: 7,
      team1Bid: 7,
      team1TricksBefore: 0,
      team2Bid: 8,
      team2TricksBefore: 6,
      winnerId: 'east', // Team 2 wins trick 7 -> Team 1: 0/7, Team 2: 7/8
    });
    const next = resolveCompletedTrick(state);
    assert(next.phase === 'playing', `Expected phase 'playing' when Team B can still succeed, got ${next.phase}`);
    assert(next.trickNumber === 8, `Expected trickNumber 8, got ${next.trickNumber}`);
    assert(next.partnerships.team1.matchScore === 0, 'Must not score prematurely while Team B is still achievable');
  });

  test(64, 'Early termination: Only Team B fails while Team A remains capable -> continues playing (Scenario A)', () => {
    // Scenario A: Team A bid 8, Team B bid 7. After 7 tricks: Team A won 7, Team B won 0, 6 remain.
    const state = buildCompletedTrickState({
      trickNumber: 7,
      team1Bid: 8,
      team1TricksBefore: 6,
      team2Bid: 7,
      team2TricksBefore: 0,
      winnerId: 'south', // Team 1 wins trick 7 -> Team 1: 7/8, Team 2: 0/7
    });
    const next = resolveCompletedTrick(state);
    assert(next.phase === 'playing', `Expected phase 'playing' when Team A can still reach 8, got ${next.phase}`);
    assert(next.trickNumber === 8, `Expected trickNumber 8, got ${next.trickNumber}`);
    assert(next.partnerships.team1.tricksWon === 7, 'Team 1 tricksWon must be 7');
    assert(next.partnerships.team2.tricksWon === 0, 'Team 2 tricksWon must be 0');
  });

  test(65, 'Early termination: Both teams fail before Trick 13 -> terminates immediately', () => {
    // Team A bid 8, Team B bid 7. After trick 12 (1 remaining): Team A has 6, Team B wins trick 12 -> 6.
    // Max possible with 1 remaining: Team A = 7 < 8 (failed), Team B = 7... wait use 8 & 8 or trick 12 with 6 & 5.
    // Team A bid 8 won 6, Team B bid 7 won 6? No, 6+6=12! Team A max = 6+1 = 7 < 8 (fails); Team B max = 6+1 = 7 >= 7 (still achievable!).
    // With Team A bid 8, Team B bid 8: after 12 tricks (6 & 6, 1 remaining), max is 7 < 8 for both -> BOTH FAIL!
    const state = buildCompletedTrickState({
      trickNumber: 12,
      team1Bid: 8,
      team1TricksBefore: 6,
      team2Bid: 8,
      team2TricksBefore: 5,
      winnerId: 'east', // Team 2 reaches 6; Team 1 has 6; remaining = 1 -> both max 7 < 8
    });
    const next = resolveCompletedTrick(state);
    assert(next.phase === 'round_summary', `Expected immediate termination ('round_summary'), got ${next.phase}`);
    assert(next.trickHistory.length === 1, 'Only played tricks recorded; Trick 13 must not be played');
    assert(next.partnerships.team1.matchScore === -8, `Expected Team 1 score -8, got ${next.partnerships.team1.matchScore}`);
    assert(next.partnerships.team2.matchScore === -8, `Expected Team 2 score -8, got ${next.partnerships.team2.matchScore}`);
  });

  test(66, 'Early termination: Team A succeeds and Team B fails before Trick 13 -> terminates immediately', () => {
    // Team A bid 8, Team B bid 7. After Trick 11 (2 remaining): Team A has 8 (succeeded), Team B has 3 (max 5 < 7, failed).
    const state = buildCompletedTrickState({
      trickNumber: 11,
      team1Bid: 8,
      team1TricksBefore: 7,
      team2Bid: 7,
      team2TricksBefore: 3,
      winnerId: 'south', // Team 1 reaches 8/8; Team 2 at 3/7 with 2 left (max 5 < 7)
    });
    const next = resolveCompletedTrick(state);
    assert(next.phase === 'round_summary', `Expected immediate termination, got ${next.phase}`);
    assert(next.partnerships.team1.matchScore === 8, `Expected Team 1 +8, got ${next.partnerships.team1.matchScore}`);
    assert(next.partnerships.team2.matchScore === -7, `Expected Team 2 -7, got ${next.partnerships.team2.matchScore}`);
  });

  test(67, 'Early termination: Team B succeeds and Team A fails before Trick 13 -> terminates immediately', () => {
    // Team A bid 7, Team B bid 8. After Trick 11 (2 remaining): Team A has 3 (max 5 < 7, failed), Team B has 8 (succeeded).
    const state = buildCompletedTrickState({
      trickNumber: 11,
      team1Bid: 7,
      team1TricksBefore: 3,
      team2Bid: 8,
      team2TricksBefore: 7,
      winnerId: 'west', // Team 2 reaches 8/8; Team 1 at 3/7 with 2 left (max 5 < 7)
    });
    const next = resolveCompletedTrick(state);
    assert(next.phase === 'round_summary', `Expected immediate termination, got ${next.phase}`);
    assert(next.partnerships.team1.matchScore === -7, `Expected Team 1 -7, got ${next.partnerships.team1.matchScore}`);
    assert(next.partnerships.team2.matchScore === 8, `Expected Team 2 +8, got ${next.partnerships.team2.matchScore}`);
  });

  test(68, 'Early termination: One team succeeds while the other remains capable -> continues playing', () => {
    // Team A bid 5 won 5 (succeeded); Team B bid 6 won 4 after Trick 9 (4 remaining -> max 8 >= 6, achievable).
    const state = buildCompletedTrickState({
      trickNumber: 9,
      team1Bid: 5,
      team1TricksBefore: 4,
      team2Bid: 6,
      team2TricksBefore: 4,
      winnerId: 'south',
    });
    const next = resolveCompletedTrick(state);
    assert(next.phase === 'playing', 'Must continue playing while Team B can still reach its contract');
    assert(next.trickNumber === 10, `Expected trick 10, got ${next.trickNumber}`);
  });

  test(69, 'Early termination: Both teams remain capable -> continues playing', () => {
    // Team A bid 6 won 3; Team B bid 6 won 3 after Trick 6 (7 remaining).
    const state = buildCompletedTrickState({
      trickNumber: 6,
      team1Bid: 6,
      team1TricksBefore: 2,
      team2Bid: 6,
      team2TricksBefore: 3,
      winnerId: 'north',
    });
    const next = resolveCompletedTrick(state);
    assert(next.phase === 'playing', 'Must continue playing when both contracts remain achievable');
    assert(next.trickNumber === 7, `Expected trick 7, got ${next.trickNumber}`);
  });

  test(70, 'Early termination: Failure detected on the final trick (Trick 13, 0 remaining)', () => {
    // Scenario B on Trick 13: Team A bid 8 won 7, Team B bid 7 won 6 -> both fail at Trick 13
    const state = buildCompletedTrickState({
      trickNumber: 13,
      team1Bid: 8,
      team1TricksBefore: 7,
      team2Bid: 7,
      team2TricksBefore: 5,
      winnerId: 'east', // Team 2 finishes with 6/7, Team 1 has 7/8
    });
    const next = resolveCompletedTrick(state);
    assert(next.phase === 'round_summary', 'Hand must finish on Trick 13');
    assert(next.partnerships.team1.matchScore === -8, `Expected Team 1 -8, got ${next.partnerships.team1.matchScore}`);
    assert(next.partnerships.team2.matchScore === -7, `Expected Team 2 -7, got ${next.partnerships.team2.matchScore}`);
  });

  test(71, 'Early termination: Unplayed cards are NOT counted as tricks or hypothetical penalties', () => {
    // Team A bid 6 won 6 by Trick 9; Team B bid 6 won 3 (4 remaining -> actually trick 11: 2 remaining, max 5 < 6).
    const state = buildCompletedTrickState({
      trickNumber: 11,
      team1Bid: 6,
      team1TricksBefore: 5,
      team2Bid: 6,
      team2TricksBefore: 3,
      winnerId: 'south', // Team 1 finishes trick 11 at 6 tricks; Team 2 has 3 tricks (2 unplayed)
    });
    const next = resolveCompletedTrick(state);
    assert(next.phase === 'round_summary', 'Hand must terminate early');
    assert(next.partnerships.team1.tricksWon === 6, 'Team 1 tricksWon must reflect only actual tricks won (6)');
    assert(next.partnerships.team2.tricksWon === 3, 'Team 2 tricksWon must reflect only actual tricks won (3), never unplayed cards');
    assert(next.partnerships.team2.matchScore === -6, 'Penalty must be exactly -originalBid (-6), independent of remaining cards');
  });

  test(72, 'Scoring: Both teams fail -> both original bids subtracted independently', () => {
    const state = buildCompletedTrickState({
      trickNumber: 12,
      team1Bid: 8,
      team1TricksBefore: 5,
      team2Bid: 7,
      team2TricksBefore: 5,
      winnerId: 'east', // Team 1: 5/8 (max 6), Team 2: 6/7 (Wait: max 7 >= 7 -> still achievable!)
    });
    // Adjust so Team 2 bid is 8 too or 6 tricks won -> let's test Trick 11 with bids 9 & 8 (6 won + 4 won)
    const bothFailState = buildCompletedTrickState({
      trickNumber: 11,
      team1Bid: 9,
      team1TricksBefore: 6,
      team2Bid: 8,
      team2TricksBefore: 4,
      winnerId: 'east', // Team 1: 6/9 (max 8 < 9), Team 2: 5/8 (max 7 < 8)
      team1MatchScore: 25,
      team2MatchScore: 18,
    });
    const next = resolveCompletedTrick(bothFailState);
    assert(next.phase === 'round_summary', 'Hand must terminate when both teams fail');
    assert(next.partnerships.team1.matchScore === 16, `Expected 25 - 9 = 16, got ${next.partnerships.team1.matchScore}`);
    assert(next.partnerships.team2.matchScore === 10, `Expected 18 - 8 = 10, got ${next.partnerships.team2.matchScore}`);
  });

  test(73, 'Scoring: One team succeeds and the other team fails', () => {
    const scores = calculateHandScores(8, 8, 7, 5);
    assert(scores.team1.succeeded === true && scores.team1.scoreDelta === 8, 'Winning team bid 8 awards +8');
    assert(scores.team2.succeeded === false && scores.team2.scoreDelta === -7, 'Failing team bid 7 subtracts -7');
  });

  test(74, 'Scoring: Standard contracts (bids 2 through 9) award exact original bid', () => {
    for (let bid = 2; bid <= 9; bid++) {
      const res = calculatePartnershipScore(bid, bid + 1);
      assert(res.scoreDelta === bid, `Standard bid ${bid} must award exactly ${bid}, got ${res.scoreDelta}`);
    }
  });

  test(75, 'Scoring: High contracts (bids 10 through 13) apply doubled reward', () => {
    for (let bid = 10; bid <= 13; bid++) {
      const res = calculatePartnershipScore(bid, bid);
      assert(res.scoreDelta === bid * 2, `High contract bid ${bid} must award ${bid * 2}, got ${res.scoreDelta}`);
    }
  });

  test(76, 'Scoring: Negative cumulative scores handled accurately', () => {
    const state = buildCompletedTrickState({
      trickNumber: 12,
      team1Bid: 10,
      team1TricksBefore: 7,
      team2Bid: 6,
      team2TricksBefore: 3,
      winnerId: 'west', // Team 1: 7/10 (max 8 < 10), Team 2: 4/6 (max 5 < 6)
      team1MatchScore: 4,
      team2MatchScore: -3,
    });
    const next = resolveCompletedTrick(state);
    assert(next.partnerships.team1.matchScore === -6, `Expected 4 - 10 = -6, got ${next.partnerships.team1.matchScore}`);
    assert(next.partnerships.team2.matchScore === -9, `Expected -3 - 6 = -9, got ${next.partnerships.team2.matchScore}`);
  });

  test(77, 'Scoring: Boston scoring unchanged (awarded only when a team actually wins all 13 tricks)', () => {
    const earlyNoBoston = calculatePartnershipScore(5, 11, true);
    assert(earlyNoBoston.isBostonSweep === false, 'Winning fewer than 13 tricks must NOT trigger Boston');
    assert(earlyNoBoston.scoreDelta === 5, 'Standard reward must apply without Boston bonus');

    const realBoston = calculatePartnershipScore(5, 13, true);
    assert(realBoston.isBostonSweep === true, 'Winning all 13 tricks must trigger Boston');
    assert(realBoston.scoreDelta === 10, 'Boston sweep rule for bid 5 must double to 10');
  });

  test(78, 'Scoring: Scores are NOT applied twice if resolution runs again on a terminated hand', () => {
    const state = buildCompletedTrickState({
      trickNumber: 11,
      team1Bid: 8,
      team1TricksBefore: 7,
      team2Bid: 7,
      team2TricksBefore: 3,
      winnerId: 'south',
      team1MatchScore: 10,
      team2MatchScore: 15,
    });
    const once = resolveCompletedTrick(state);
    const twice = resolveCompletedTrick(once);
    assert(twice.partnerships.team1.matchScore === once.partnerships.team1.matchScore, 'Re-resolving must not alter Team 1 score');
    assert(twice.partnerships.team2.matchScore === once.partnerships.team2.matchScore, 'Re-resolving must not alter Team 2 score');
    assert(twice.partnerships.team1.roundScoreHistory.length === 1, 'Round score history must contain exactly 1 entry');

    let threwOnDoubleSkip = false;
    try {
      skipRemainingTricks(once);
    } catch {
      threwOnDoubleSkip = true;
    }
    assert(threwOnDoubleSkip, 'Calling skipRemainingTricks after hand termination must throw and never double-score');
  });

  test(79, 'Match lifecycle: Match-winning condition is checked after every completed hand', () => {
    const midMatch = buildCompletedTrickState({
      trickNumber: 13,
      team1Bid: 6,
      team1TricksBefore: 6,
      team2Bid: 7,
      team2TricksBefore: 5,
      winnerId: 'east',
      team1MatchScore: 93,
      team2MatchScore: 40,
      targetPoints: 100,
    });
    const stillPlaying = resolveCompletedTrick(midMatch);
    assert(stillPlaying.partnerships.team1.matchScore === 99, 'Score updated to 99');
    assert(stillPlaying.phase === 'round_summary' && !stillPlaying.matchWinner, 'Score 99 < 100 must NOT end match');

    const finalHand = buildCompletedTrickState({
      trickNumber: 13,
      team1Bid: 6,
      team1TricksBefore: 6,
      team2Bid: 7,
      team2TricksBefore: 5,
      winnerId: 'east',
      team1MatchScore: 95,
      team2MatchScore: 40,
      targetPoints: 100,
    });
    const wonMatch = resolveCompletedTrick(finalHand);
    assert(wonMatch.partnerships.team1.matchScore === 101, 'Score updated to 101 >= 100');
    assert(wonMatch.phase === 'match_completed', 'Match must transition to match_completed when target reached');
    assert(wonMatch.matchWinner === 'team1', 'Team 1 must be declared matchWinner');
  });

  test(80, 'Match lifecycle: When no team wins, next hand starts cleanly via advanceToNextHand', () => {
    const state = buildCompletedTrickState({
      trickNumber: 11,
      team1Bid: 8,
      team1TricksBefore: 7,
      team2Bid: 7,
      team2TricksBefore: 3,
      winnerId: 'south',
      team1MatchScore: 20,
      team2MatchScore: 15,
      targetPoints: 100,
      handNumber: 1,
    });
    const summary = resolveCompletedTrick(state);
    assert(summary.phase === 'round_summary', 'Must enter round_summary when match is not yet won');

    const nextHand = advanceToNextHand(summary);
    assert(nextHand.handNumber === 2, `Expected handNumber 2, got ${nextHand.handNumber}`);
    assert(nextHand.phase === 'bidding', `Expected phase 'bidding' after dealing new hand, got ${nextHand.phase}`);
    for (const pid of ['south', 'east', 'north', 'west'] as PlayerId[]) {
      assert(nextHand.players[pid].hand.length === 13, `Player ${pid} must receive 13 freshly dealt cards`);
    }
  });

  test(81, 'Match lifecycle: Cumulative scores are preserved between hands', () => {
    const state = buildCompletedTrickState({
      trickNumber: 13,
      team1Bid: 7,
      team1TricksBefore: 7,
      team2Bid: 6,
      team2TricksBefore: 4,
      winnerId: 'east',
      team1MatchScore: 30,
      team2MatchScore: 22,
      targetPoints: 100,
    });
    const summary = resolveCompletedTrick(state);
    const nextHand = advanceToNextHand(summary);
    assert(nextHand.partnerships.team1.matchScore === 37, `Cumulative score 37 must be preserved, got ${nextHand.partnerships.team1.matchScore}`);
    assert(nextHand.partnerships.team2.matchScore === 16, `Cumulative score 16 must be preserved, got ${nextHand.partnerships.team2.matchScore}`);
    assert(nextHand.partnerships.team1.roundScoreHistory.length === 1, 'Prior round history must be preserved');
  });

  test(82, 'Match lifecycle: Dealer rotation remains counter-clockwise across consecutive hands', () => {
    let state = initializeMatch();
    state = { ...state, dealer: 'south' };
    state = startHand(state);
    state = { ...state, phase: 'round_summary', matchWinner: null };

    const hand2 = advanceToNextHand(state);
    assert(hand2.dealer === 'east', `After south, dealer must rotate to east, got ${hand2.dealer}`);

    const hand3 = advanceToNextHand({ ...hand2, phase: 'round_summary', matchWinner: null });
    assert(hand3.dealer === 'north', `After east, dealer must rotate to north, got ${hand3.dealer}`);

    const hand4 = advanceToNextHand({ ...hand3, phase: 'round_summary', matchWinner: null });
    assert(hand4.dealer === 'west', `After north, dealer must rotate to west, got ${hand4.dealer}`);

    const hand5 = advanceToNextHand({ ...hand4, phase: 'round_summary', matchWinner: null });
    assert(hand5.dealer === 'south', `After west, dealer must wrap around to south, got ${hand5.dealer}`);
  });

  test(83, 'Match lifecycle: Winning team triggers New Match Confirmation state and localized prompt', () => {
    const finalHand = buildCompletedTrickState({
      trickNumber: 12,
      team1Bid: 10,
      team1TricksBefore: 9,
      team2Bid: 6,
      team2TricksBefore: 2,
      winnerId: 'north', // Team 1 wins trick 12 -> 10/10 (+20 pts), Team 2 at 2/6 (1 left, max 3 -> -6 pts)
      team1MatchScore: 85,
      team2MatchScore: 40,
      targetPoints: 100,
    });
    const completed = resolveCompletedTrick(finalHand);
    assert(completed.phase === 'match_completed', 'Match must reach match_completed');
    assert(completed.matchWinner === 'team1', 'Winning team must be identified');
    assert(
      MODAL_TRANSLATIONS.en.scoreboard.rematchPrompt === 'Congratulations! Would you like to play another game?',
      'Confirmation prompt must match exact specification'
    );
    assert(Boolean(MODAL_TRANSLATIONS.hi.scoreboard.rematchPrompt && MODAL_TRANSLATIONS.or.scoreboard.rematchPrompt), 'All languages must include rematch prompt');
  });

  test(84, 'Match lifecycle: Play Again (confirmPlayAgain) resets scores and initializes fresh match', () => {
    const finalHand = buildCompletedTrickState({
      trickNumber: 13,
      team1Bid: 6,
      team1TricksBefore: 6,
      team2Bid: 7,
      team2TricksBefore: 5,
      winnerId: 'east',
      team1MatchScore: 95,
      team2MatchScore: 50,
      targetPoints: 100,
      handNumber: 4,
    });
    const completed = resolveCompletedTrick(finalHand);
    assert(completed.phase === 'match_completed', 'Precondition: match completed');

    const restarted = confirmPlayAgain(completed);
    assert(restarted.phase === 'bidding', `New match must deal and enter bidding phase, got ${restarted.phase}`);
    assert(restarted.handNumber === 1, `Hand number must reset to 1, got ${restarted.handNumber}`);
    assert(restarted.matchWinner === null, 'matchWinner must reset to null');
    assert(restarted.partnerships.team1.matchScore === 0, 'Team 1 score must reset to 0');
    assert(restarted.partnerships.team2.matchScore === 0, 'Team 2 score must reset to 0');
    assert(restarted.partnerships.team1.roundScoreHistory.length === 0, 'Team 1 round history must reset');
    assert(restarted.partnerships.team2.roundScoreHistory.length === 0, 'Team 2 round history must reset');
    assert(restarted.earlyTerminationReason === null, 'earlyTerminationReason must reset');
  });

  test(85, 'Match lifecycle: Exit Game (exitCompletedMatch) safely clears scores without starting a new match', () => {
    const finalHand = buildCompletedTrickState({
      trickNumber: 13,
      team1Bid: 6,
      team1TricksBefore: 6,
      team2Bid: 7,
      team2TricksBefore: 5,
      winnerId: 'east',
      team1MatchScore: 95,
      team2MatchScore: 50,
      targetPoints: 100,
    });
    const completed = resolveCompletedTrick(finalHand);
    const exited = exitCompletedMatch(completed);

    assert(exited.phase === 'idle', `Exit must leave state idle without dealing a match, got ${exited.phase}`);
    assert(exited.matchWinner === null, 'matchWinner must be cleared');
    assert(exited.partnerships.team1.matchScore === 0, 'Team 1 score must be cleared to 0');
    assert(exited.partnerships.team2.matchScore === 0, 'Team 2 score must be cleared to 0');
    assert(exited.players.south.hand.length === 0, 'Exit must not deal cards for another match');
  });

  test(86, 'Match lifecycle: AI bots and fixed partnerships automatically participate in new match', () => {
    const finalHand = buildCompletedTrickState({
      trickNumber: 13,
      team1Bid: 6,
      team1TricksBefore: 6,
      team2Bid: 7,
      team2TricksBefore: 5,
      winnerId: 'east',
      team1MatchScore: 95,
      team2MatchScore: 50,
      targetPoints: 100,
    });
    const completed = resolveCompletedTrick(finalHand);
    const restarted = confirmPlayAgain(completed);

    assert(restarted.players.south.isHuman === true && restarted.players.south.teamId === 'team1', 'Human player retained at south on team1');
    assert(restarted.players.north.isHuman === false && restarted.players.north.teamId === 'team1', 'AI bot north retained on team1');
    assert(restarted.players.east.isHuman === false && restarted.players.east.teamId === 'team2', 'AI bot east retained on team2');
    assert(restarted.players.west.isHuman === false && restarted.players.west.teamId === 'team2', 'AI bot west retained on team2');

    // AI bidder can immediately bid on turn in the new match without confirmation
    const firstBidderId = restarted.biddingOrder[0];
    assert(Boolean(firstBidderId), 'Bidding order must be populated immediately');
    const afterFirstBid = submitPlayerBid(restarted, firstBidderId, 3);
    assert(afterFirstBid.players[firstBidderId].bid === 3, 'First player in new match must be able to bid immediately');
  });

  test(87, 'Match lifecycle: Repeated Play Again triggers cannot initialize multiple matches', () => {
    const finalHand = buildCompletedTrickState({
      trickNumber: 13,
      team1Bid: 6,
      team1TricksBefore: 6,
      team2Bid: 7,
      team2TricksBefore: 5,
      winnerId: 'east',
      team1MatchScore: 95,
      team2MatchScore: 50,
      targetPoints: 100,
    });
    const completed = resolveCompletedTrick(finalHand);

    const firstStart = confirmPlayAgain(completed);
    const secondClick = confirmPlayAgain(firstStart);
    assert(secondClick === firstStart, 'Subsequent Play Again call on already-started match must be a no-op returning identical state');
    assert(secondClick.handNumber === 1 && secondClick.players.south.hand === firstStart.players.south.hand, 'Deal must remain untouched across duplicate clicks');
  });

  // ================= EARLY TERMINATION NOTIFICATION TESTS (88-97) =================
  test(88, 'Early termination notification: Team A fails and Team B succeeds (Case B & Case D)', () => {
    // Team B already fulfilled bid 5 (has 6), Team A bid 7 has 4 at Trick 10 (3 left -> 4+3=7 achievable);
    // On Trick 11 (2 left), Team B wins 7th trick -> Team A max 6 < 7 (NOW failed!) -> Case B
    const state = buildCompletedTrickState({
      trickNumber: 11,
      team1Bid: 7,
      team1TricksBefore: 4,
      team2Bid: 5,
      team2TricksBefore: 6,
      winnerId: 'west',
    });
    const next = resolveCompletedTrick(state);
    assert(next.phase === 'round_summary', 'Hand must terminate early');
    assert(Boolean(next.earlyTerminationNotification), 'Notification must be generated');
    assert(next.earlyTerminationNotification!.caseType === 'team_a_failed', 'Must classify as team_a_failed');
    assert(next.earlyTerminationNotification!.title === 'Team A cannot fulfil its bid!', 'Title must match Case B');
    assert(
      next.earlyTerminationNotification!.message === "Team B has secured enough tricks to make Team A's contract impossible.",
      'Message must match Case B'
    );
    assert(next.earlyTerminationNotification!.team1TricksNeeded === 3, 'Team A needs 3 more tricks (7 - 4)');

    // Chronological Case D: Team A already failed on Trick 7, then Team B fulfills its 8th trick on Trick 8
    const notifD = buildEarlyTerminationNotification(7, 0, 8, 8, 8, 0, 7);
    assert(notifD !== null && notifD.caseType === 'one_succeeded_one_failed', 'Must classify as one_succeeded_one_failed');
    assert(notifD!.title === 'Contract outcome decided!', 'Title must match Case D');
    assert(notifD!.message === 'Team B has fulfilled its bid. Team A cannot fulfil its contract.', 'Message must match Case D');
  });

  test(89, 'Early termination notification: Team B fails and Team A succeeds (Case A & Case D)', () => {
    // Team A already fulfilled bid 5 (has 6), Team B bid 7 has 4 at Trick 10 (3 left -> achievable);
    // On Trick 11 (2 left), Team A wins 7th trick -> Team B max 6 < 7 (NOW failed!) -> Case A
    const state = buildCompletedTrickState({
      trickNumber: 11,
      team1Bid: 5,
      team1TricksBefore: 6,
      team2Bid: 7,
      team2TricksBefore: 4,
      winnerId: 'south',
    });
    const next = resolveCompletedTrick(state);
    assert(next.phase === 'round_summary', 'Hand must terminate early');
    assert(Boolean(next.earlyTerminationNotification), 'Notification must be generated');
    assert(next.earlyTerminationNotification!.caseType === 'team_b_failed', 'Must classify as team_b_failed');
    assert(next.earlyTerminationNotification!.title === 'Team B cannot fulfil its bid!', 'Title must match Case A');
    assert(
      next.earlyTerminationNotification!.message === "Team A has secured enough tricks to make Team B's contract impossible.",
      'Message must match Case A'
    );
    assert(next.earlyTerminationNotification!.team2TricksNeeded === 3, 'Team B needs 3 more tricks (7 - 4)');

    // Chronological Case D: Team B failed earlier, then Team A reaches its bid 8 on Trick 8
    const notifD = buildEarlyTerminationNotification(8, 8, 7, 0, 8, 7, 0);
    assert(notifD !== null && notifD.caseType === 'one_succeeded_one_failed', 'Must classify as one_succeeded_one_failed');
    assert(notifD!.title === 'Contract outcome decided!', 'Title must match Case D');
    assert(notifD!.message === 'Team A has fulfilled its bid. Team B cannot fulfil its contract.', 'Message must match Case D');
  });

  test(90, 'Early termination notification: Both teams fail (Case C)', () => {
    const state = buildCompletedTrickState({
      trickNumber: 12,
      team1Bid: 8,
      team1TricksBefore: 6,
      team2Bid: 8,
      team2TricksBefore: 5,
      winnerId: 'east', // Team 1: 6/8, Team 2: 6/8, 1 remaining -> both fail
    });
    const next = resolveCompletedTrick(state);
    assert(next.phase === 'round_summary', 'Hand must terminate early');
    assert(Boolean(next.earlyTerminationNotification), 'Notification must be generated');
    assert(next.earlyTerminationNotification!.caseType === 'both_failed', 'Must classify as both_failed');
    assert(next.earlyTerminationNotification!.title === 'Both teams have failed their bids!', 'Title must match Case C');
    assert(
      next.earlyTerminationNotification!.message === 'Neither team can fulfil its contract with the remaining tricks.',
      'Message must match Case C'
    );
  });

  test(91, 'Early termination notification: One team fails while other remains capable -> NO popup', () => {
    const state = buildCompletedTrickState({
      trickNumber: 7,
      team1Bid: 8,
      team1TricksBefore: 6,
      team2Bid: 7,
      team2TricksBefore: 0,
      winnerId: 'south', // Team A: 7/8 (achievable), Team B: 0/7 (failed), 6 remaining
    });
    const next = resolveCompletedTrick(state);
    assert(next.phase === 'playing', 'Game must continue playing');
    assert(!next.earlyTerminationNotification, 'Failure notification must NOT appear when other team can still succeed');
  });

  test(92, 'Early termination notification: Both teams succeed -> existing Skip button flow unchanged & NO failure popup', () => {
    // At Trick 10, both teams reach 5/5 bids -> hand stays in playing so Skip banner shows, no failure popup
    const state = buildCompletedTrickState({
      trickNumber: 10,
      team1Bid: 5,
      team1TricksBefore: 4,
      team2Bid: 5,
      team2TricksBefore: 5,
      winnerId: 'south',
    });
    const next = resolveCompletedTrick(state);
    assert(next.phase === 'playing', 'Must stay in playing so existing Skip banner remains available');
    assert(!next.earlyTerminationNotification, 'No failure notification when both teams succeed');

    const skipped = skipRemainingTricks(next);
    assert(skipped.phase === 'round_summary', 'Existing Skip flow still terminates cleanly');
    assert(!skipped.earlyTerminationNotification, 'Skip flow must never emit a failure notification');
  });

  test(93, 'Early termination notification: Payload contains accurate bids, tricks won, remaining tricks, and needed count', () => {
    const state = buildCompletedTrickState({
      trickNumber: 11,
      team1Bid: 5,
      team1TricksBefore: 6,
      team2Bid: 7,
      team2TricksBefore: 4,
      winnerId: 'north', // Team A ends with 7 tricks won on bid 5; Team B ends with 4 tricks won on bid 7; 2 remaining
    });
    const next = resolveCompletedTrick(state);
    const n = next.earlyTerminationNotification!;
    assert(n.team1Bid === 5 && n.team1TricksWon === 7 && n.team1Status === 'succeeded' && n.team1TricksNeeded === 0, 'Team A stats must match actual game state');
    assert(n.team2Bid === 7 && n.team2TricksWon === 4 && n.team2Status === 'failed' && n.team2TricksNeeded === 3, 'Team B stats must match actual game state');
    assert(n.remainingTricks === 2 && n.tricksPlayed === 11, 'Remaining tricks (2) and tricks played (11) must be exact');
  });

  test(94, 'Early termination notification: Awaits user dismissal (no auto-dismiss override on state)', () => {
    const state = buildCompletedTrickState({
      trickNumber: 11,
      team1Bid: 8,
      team1TricksBefore: 6,
      team2Bid: 8,
      team2TricksBefore: 5,
      winnerId: 'west', // Team 1: 6/8 (2 left -> max 8? Wait trick 12 makes max 7 < 8)
    });
    const state12 = { ...state, trickNumber: 12 };
    const terminated = resolveCompletedTrick(state12);
    assert(terminated.phase === 'round_summary', 'Hand terminates early into round_summary');
    assert(Boolean(terminated.earlyTerminationNotification), 'Notification remains attached in state until user clicks Okay or Cancel');
  });

  test(95, 'Early termination notification: Hand is scored & scoreboard-ready upon user dismissal (and silent on natural Trick 13)', () => {
    const earlyState = buildCompletedTrickState({
      trickNumber: 11,
      team1Bid: 6,
      team1TricksBefore: 6,
      team2Bid: 7,
      team2TricksBefore: 4,
      winnerId: 'south',
    });
    const terminated = resolveCompletedTrick(earlyState);
    assert(terminated.phase === 'round_summary', 'Hand enters round_summary so scoreboard opens immediately once user clicks Okay or Cancel');
    assert(terminated.partnerships.team1.matchScore === 6 && terminated.partnerships.team2.matchScore === -7, 'Final scores ready for scoreboard');

    // Natural Trick 13 end must NOT trigger an early termination notification
    const trick13State = buildCompletedTrickState({
      trickNumber: 13,
      team1Bid: 8,
      team1TricksBefore: 7,
      team2Bid: 7,
      team2TricksBefore: 5,
      winnerId: 'east',
    });
    const naturalEnd = resolveCompletedTrick(trick13State);
    assert(naturalEnd.phase === 'round_summary', 'Natural Trick 13 end enters round_summary');
    assert(!naturalEnd.earlyTerminationNotification, 'Natural Trick 13 end must NOT emit an early termination popup');
  });

  test(96, 'Early termination notification: No additional card play or AI bid can occur during transition', () => {
    const state = buildCompletedTrickState({
      trickNumber: 11,
      team1Bid: 5,
      team1TricksBefore: 6,
      team2Bid: 7,
      team2TricksBefore: 4,
      winnerId: 'south',
    });
    const terminated = resolveCompletedTrick(state);

    let playBlocked = false;
    try {
      executeCardPlay(terminated, 'east', terminated.players.east.hand[0]);
    } catch {
      playBlocked = true;
    }
    assert(playBlocked, 'Card plays must be rejected during early termination notification transition');

    let bidBlocked = false;
    try {
      submitPlayerBid(terminated, 'east', 3);
    } catch {
      bidBlocked = true;
    }
    assert(bidBlocked, 'Bids must be rejected during early termination notification transition');
  });

  test(97, 'Early termination notification: Duplicate resolution cannot create duplicate notifications or scoreboards', () => {
    const state = buildCompletedTrickState({
      trickNumber: 11,
      team1Bid: 5,
      team1TricksBefore: 6,
      team2Bid: 7,
      team2TricksBefore: 4,
      winnerId: 'south',
    });
    const once = resolveCompletedTrick(state);
    const twice = resolveCompletedTrick(once);
    assert(twice === once, 'Second resolveCompletedTrick on terminated hand must be an exact no-op');
    assert(once.partnerships.team1.roundScoreHistory.length === 1, 'Score applied strictly once');
  });

  const passedCount = results.filter(r => r.passed).length;
  return { passedCount, totalCount: results.length, results };
}

// If executed via node / tsx directly in command line
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('runTests')) {
  console.log('Running Universal Joker 97 Automated Engine Tests...\n');
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
