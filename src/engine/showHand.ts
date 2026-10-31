import { Card, GameState, PlayerId, Suit } from '../types/game';

export interface ShowHandAnalysis {
  isEligible: boolean;
  neededTricks: number;
  remainingTricksInHand: number;
  guaranteedWinners: number;
  isGuaranteedSuccess: boolean;
  guaranteedWinningCards: { playerId: PlayerId; card: Card; reason: string }[];
  otherTeam1Cards: { playerId: PlayerId; card: Card }[];
  riskAnalysis: string;
}

/**
 * Evaluates whether Team 1 (South + North) can legitimately claim their remaining needed tricks.
 * Triggered under the rule:
 * "opponent has already got their bids, your team yet to complete the bids,
 * if you are so sure that you have those cards which can give you remaining numbers
 * there would be show option and done. But if fail, then as part of penalty, total score-current bid."
 */
export function evaluateShowHand(state: GameState): ShowHandAnalysis {
  const team1 = state.partnerships.team1;
  const team2 = state.partnerships.team2;

  const opponentMetBid = team2.tricksWon >= team2.totalBid;
  const userTeamNeedsTricks = team1.tricksWon < team1.totalBid;
  const isPlaying = state.phase === 'playing' || state.phase === 'trick_completed';
  const isEligible = isPlaying && opponentMetBid && userTeamNeedsTricks;

  const neededTricks = Math.max(0, team1.totalBid - team1.tricksWon);
  const remainingTricksInHand = state.players.south.hand.length;

  if (!isEligible) {
    return {
      isEligible: false,
      neededTricks,
      remainingTricksInHand,
      guaranteedWinners: 0,
      isGuaranteedSuccess: false,
      guaranteedWinningCards: [],
      otherTeam1Cards: [],
      riskAnalysis: 'Show Hand is only available when opponents have made their contract and your team has not yet.',
    };
  }

  const trumpSuit = state.trumpSuit;
  const southHand = state.players.south.hand;
  const northHand = state.players.north.hand;
  const eastHand = state.players.east.hand;
  const westHand = state.players.west.hand;

  const team1CardsWithPlayer: { playerId: PlayerId; card: Card }[] = [
    ...southHand.map(c => ({ playerId: 'south' as PlayerId, card: c })),
    ...northHand.map(c => ({ playerId: 'north' as PlayerId, card: c })),
  ];

  const opponentCards: Card[] = [...eastHand, ...westHand];

  const guaranteedWinningCards: { playerId: PlayerId; card: Card; reason: string }[] = [];
  const claimedCardIds = new Set<string>();

  // 1. Dadaji Joker Analysis
  const jokerHolding = team1CardsWithPlayer.find(cp => cp.card.isDadajiJoker);
  if (jokerHolding && state.trickNumber < 13) {
    guaranteedWinningCards.push({
      playerId: jokerHolding.playerId,
      card: jokerHolding.card,
      reason: 'Dadaji Joker (Supreme Trump — beats all other cards)',
    });
    claimedCardIds.add(jokerHolding.card.id);
  }

  // 2. Trump Suit Analysis
  if (trumpSuit) {
    const team1Trumps = team1CardsWithPlayer
      .filter(cp => !claimedCardIds.has(cp.card.id) && cp.card.suit === trumpSuit && !cp.card.isDadajiJoker)
      .sort((a, b) => b.card.value - a.card.value);

    let oppTrumps = opponentCards
      .filter(c => c.suit === trumpSuit && !c.isDadajiJoker)
      .sort((a, b) => b.value - a.value);

    // Opponent Joker check
    const oppHasJoker = opponentCards.some(c => c.isDadajiJoker);

    for (const t1Trump of team1Trumps) {
      if (oppTrumps.length === 0) {
        // Opponents have no trumps left! All team 1 trumps are winners
        guaranteedWinningCards.push({
          playerId: t1Trump.playerId,
          card: t1Trump.card,
          reason: `High Trump (${t1Trump.card.shortName}) — opponents void in trumps`,
        });
        claimedCardIds.add(t1Trump.card.id);
      } else {
        const oppHighest = oppTrumps[0];
        if (t1Trump.card.value > oppHighest.value && (!oppHasJoker || state.trickNumber === 13)) {
          // Team 1 trump is higher than any opponent trump
          guaranteedWinningCards.push({
            playerId: t1Trump.playerId,
            card: t1Trump.card,
            reason: `Top Trump (${t1Trump.card.shortName}) — beats opponent highest (${oppHighest.shortName})`,
          });
          claimedCardIds.add(t1Trump.card.id);
          // Draws/extracts the highest opponent trump
          oppTrumps = oppTrumps.slice(1);
        }
      }
    }
  }

  // 3. Side Suit Boss Cards Analysis
  // If opponents have no trumps remaining, top cards in side suits are guaranteed winners!
  const oppRemainingTrumps = trumpSuit
    ? opponentCards.filter(c => c.suit === trumpSuit && !c.isDadajiJoker).length
    : 0;
  const oppHasJoker = opponentCards.some(c => c.isDadajiJoker);

  if (oppRemainingTrumps === 0 && !oppHasJoker) {
    const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
    for (const suit of suits) {
      if (suit === trumpSuit) continue;

      const t1SuitCards = team1CardsWithPlayer
        .filter(cp => !claimedCardIds.has(cp.card.id) && cp.card.suit === suit && !cp.card.isDadajiJoker)
        .sort((a, b) => b.card.value - a.card.value);

      let oppSuitCards = opponentCards
        .filter(c => c.suit === suit && !c.isDadajiJoker)
        .sort((a, b) => b.value - a.value);

      for (const cp of t1SuitCards) {
        if (oppSuitCards.length === 0) {
          guaranteedWinningCards.push({
            playerId: cp.playerId,
            card: cp.card,
            reason: `Boss card (${cp.card.shortName}) — opponents void in suit & trumps exhausted`,
          });
          claimedCardIds.add(cp.card.id);
        } else if (cp.card.value > oppSuitCards[0].value) {
          guaranteedWinningCards.push({
            playerId: cp.playerId,
            card: cp.card,
            reason: `Boss card (${cp.card.shortName}) — higher than opponent's best (${oppSuitCards[0].shortName})`,
          });
          claimedCardIds.add(cp.card.id);
          oppSuitCards = oppSuitCards.slice(1);
        }
      }
    }
  }

  const guaranteedWinners = guaranteedWinningCards.length;
  const isGuaranteedSuccess = guaranteedWinners >= neededTricks;

  const otherTeam1Cards = team1CardsWithPlayer.filter(cp => !claimedCardIds.has(cp.card.id));

  let riskAnalysis = '';
  if (isGuaranteedSuccess) {
    riskAnalysis = `Guaranteed Success: Your team holds ${guaranteedWinners} unassailable winner(s) which satisfies the required ${neededTricks} trick(s). Claim is 100% safe!`;
  } else {
    riskAnalysis = `High Risk: Your team only holds ${guaranteedWinners} guaranteed winner(s), but needs ${neededTricks} trick(s). Opponents hold cards that can defeat you. Failure penalty will deduct ${team1.totalBid} points from total score!`;
  }

  return {
    isEligible,
    neededTricks,
    remainingTricksInHand,
    guaranteedWinners,
    isGuaranteedSuccess,
    guaranteedWinningCards,
    otherTeam1Cards,
    riskAnalysis,
  };
}

export interface CardVerificationDetail {
  card: Card;
  playerId: PlayerId;
  status: 'passed' | 'failed';
  reason: string;
}

export interface ShowHandSelectionVerification {
  isValid: boolean;
  neededTricks: number;
  selectedCount: number;
  verifiedWinnersCount: number;
  cardVerifications: CardVerificationDetail[];
  summary: string;
  penaltyPoints: number;
  penaltyNewScore: number;
  successScoreGain: number;
}

/**
 * Verifies whether the specific cards selected by the user (from South / North)
 * are mathematically guaranteed to win Team 1's remaining needed tricks against
 * all opponent cards (East & West).
 */
export function verifyUserSelectedCards(
  state: GameState,
  selectedCardIds: string[]
): ShowHandSelectionVerification {
  const team1 = state.partnerships.team1;
  const neededTricks = Math.max(0, team1.totalBid - team1.tricksWon);
  const trumpSuit = state.trumpSuit;

  const southCards = state.players.south.hand.map(c => ({ playerId: 'south' as PlayerId, card: c }));
  const northCards = state.players.north.hand.map(c => ({ playerId: 'north' as PlayerId, card: c }));
  const allTeam1Cards = [...southCards, ...northCards];

  const selectedCardsWithPlayer = selectedCardIds
    .map(id => allTeam1Cards.find(cp => cp.card.id === id))
    .filter((cp): cp is { playerId: PlayerId; card: Card } => cp !== undefined);

  const selectedCount = selectedCardsWithPlayer.length;
  const penaltyPoints = team1.totalBid;
  const penaltyNewScore = team1.matchScore - penaltyPoints;
  const successScoreGain = team1.totalBid;

  // Insufficient cards selected check
  if (selectedCount < neededTricks) {
    return {
      isValid: false,
      neededTricks,
      selectedCount,
      verifiedWinnersCount: 0,
      cardVerifications: selectedCardsWithPlayer.map(cp => ({
        card: cp.card,
        playerId: cp.playerId,
        status: 'failed',
        reason: `Need ${neededTricks} trick(s), but only ${selectedCount} card(s) selected in total.`,
      })),
      summary: `You need ${neededTricks} trick(s) to fulfill the contract of ${team1.totalBid}, but selected only ${selectedCount} card(s).`,
      penaltyPoints,
      penaltyNewScore,
      successScoreGain,
    };
  }

  // Opponents' remaining cards (East + West)
  const oppCards: Card[] = [...state.players.east.hand, ...state.players.west.hand];
  let oppTrumps = trumpSuit
    ? oppCards.filter(c => c.suit === trumpSuit && !c.isDadajiJoker).sort((a, b) => b.value - a.value)
    : [];
  let oppHasJoker = oppCards.some(c => c.isDadajiJoker) && state.trickNumber < 13;

  // Group opponent side cards by suit
  const oppSideCards: Record<Suit, Card[]> = {
    spades: oppCards.filter(c => c.suit === 'spades' && !c.isDadajiJoker && c.suit !== trumpSuit).sort((a, b) => b.value - a.value),
    hearts: oppCards.filter(c => c.suit === 'hearts' && !c.isDadajiJoker && c.suit !== trumpSuit).sort((a, b) => b.value - a.value),
    diamonds: oppCards.filter(c => c.suit === 'diamonds' && !c.isDadajiJoker && c.suit !== trumpSuit).sort((a, b) => b.value - a.value),
    clubs: oppCards.filter(c => c.suit === 'clubs' && !c.isDadajiJoker && c.suit !== trumpSuit).sort((a, b) => b.value - a.value),
  };

  const cardVerifications: CardVerificationDetail[] = [];

  // Group selected cards into: Dadaji Joker, Trumps, and Side cards
  const selectedJokers = selectedCardsWithPlayer.filter(cp => cp.card.isDadajiJoker);
  const selectedTrumps = selectedCardsWithPlayer
    .filter(cp => !cp.card.isDadajiJoker && cp.card.suit === trumpSuit)
    .sort((a, b) => b.card.value - a.card.value);
  const selectedSideCards = selectedCardsWithPlayer
    .filter(cp => !cp.card.isDadajiJoker && cp.card.suit !== trumpSuit);

  // 1. Verify Dadaji Joker
  for (const cp of selectedJokers) {
    if (state.trickNumber < 13) {
      cardVerifications.push({
        card: cp.card,
        playerId: cp.playerId,
        status: 'passed',
        reason: 'Dadaji Joker (Supreme Trump) beats all other cards unconditionally.',
      });
    } else {
      // Trick 13 rule: Dadaji Joker acts as 2♠
      const oppHighest = oppCards.reduce((max, c) => (c.value > max ? c.value : max), 0);
      if (cp.card.value > oppHighest || oppCards.length === 0) {
        cardVerifications.push({
          card: cp.card,
          playerId: cp.playerId,
          status: 'passed',
          reason: 'Dadaji Joker (counts as 2♠ on trick 13) is sufficient to win.',
        });
      } else {
        cardVerifications.push({
          card: cp.card,
          playerId: cp.playerId,
          status: 'failed',
          reason: 'On trick 13, Dadaji Joker counts only as 2♠ and opponents have higher remaining cards.',
        });
      }
    }
  }

  // 2. Verify Trumps (in descending order)
  for (const cp of selectedTrumps) {
    if (oppHasJoker) {
      // Opponent Joker beats this trump unless drawn
      cardVerifications.push({
        card: cp.card,
        playerId: cp.playerId,
        status: 'failed',
        reason: `Opponents hold Dadaji Joker which trumps your ${cp.card.shortName}.`,
      });
      // Consume opponent joker on this trick
      oppHasJoker = false;
    } else if (oppTrumps.length === 0) {
      cardVerifications.push({
        card: cp.card,
        playerId: cp.playerId,
        status: 'passed',
        reason: `Trump (${cp.card.shortName}) is an uncontested winner — opponents have no trumps left.`,
      });
    } else {
      const oppHighestTrump = oppTrumps[0];
      if (cp.card.value > oppHighestTrump.value) {
        cardVerifications.push({
          card: cp.card,
          playerId: cp.playerId,
          status: 'passed',
          reason: `Top Trump (${cp.card.shortName}) beats opponent's highest trump (${oppHighestTrump.shortName}).`,
        });
        // This higher trump extracts the highest opponent trump
        oppTrumps = oppTrumps.slice(1);
      } else {
        cardVerifications.push({
          card: cp.card,
          playerId: cp.playerId,
          status: 'failed',
          reason: `Opponents hold ${oppHighestTrump.shortName} which is higher than your ${cp.card.shortName}.`,
        });
      }
    }
  }

  // 3. Verify Side Cards
  for (const cp of selectedSideCards) {
    if (cp.card.suit === 'joker') continue;
    const suit = cp.card.suit as Suit;

    if (oppHasJoker) {
      cardVerifications.push({
        card: cp.card,
        playerId: cp.playerId,
        status: 'failed',
        reason: `Opponents hold Dadaji Joker and can trump your ${cp.card.shortName}.`,
      });
      oppHasJoker = false;
    } else if (oppTrumps.length > 0) {
      const oppTrump = oppTrumps[0];
      cardVerifications.push({
        card: cp.card,
        playerId: cp.playerId,
        status: 'failed',
        reason: `Opponents still hold ${oppTrumps.length} trump(s) (e.g. ${oppTrump.shortName}) and can ruff your ${cp.card.shortName}.`,
      });
    } else {
      // Opponents have 0 trumps and no Joker left; check suit honors
      const oppSuitList = oppSideCards[suit] || [];
      if (oppSuitList.length === 0) {
        cardVerifications.push({
          card: cp.card,
          playerId: cp.playerId,
          status: 'passed',
          reason: `Boss card (${cp.card.shortName}) — opponents have no cards in ${suit} and no trumps remaining.`,
        });
      } else {
        const oppTopCard = oppSuitList[0];
        if (cp.card.value > oppTopCard.value) {
          cardVerifications.push({
            card: cp.card,
            playerId: cp.playerId,
            status: 'passed',
            reason: `Boss card (${cp.card.shortName}) beats opponent's highest ${suit} (${oppTopCard.shortName}).`,
          });
          oppSideCards[suit] = oppSuitList.slice(1);
        } else {
          cardVerifications.push({
            card: cp.card,
            playerId: cp.playerId,
            status: 'failed',
            reason: `Opponent holds ${oppTopCard.shortName} which beats your ${cp.card.shortName}.`,
          });
        }
      }
    }
  }

  const verifiedWinnersCount = cardVerifications.filter(cv => cv.status === 'passed').length;
  const isValid = verifiedWinnersCount >= neededTricks;

  let summary = '';
  if (isValid) {
    summary = `Verification Succeeded! All ${neededTricks} required trick(s) are mathematically guaranteed by your selected cards.`;
  } else {
    const failedCards = cardVerifications.filter(cv => cv.status === 'failed');
    summary = `Verification Failed! Only ${verifiedWinnersCount} of ${neededTricks} needed tricks are guaranteed. Flaws detected on ${failedCards.map(fc => fc.card.shortName).join(', ')}.`;
  }

  return {
    isValid,
    neededTricks,
    selectedCount,
    verifiedWinnersCount,
    cardVerifications,
    summary,
    penaltyPoints,
    penaltyNewScore,
    successScoreGain,
  };
}

