import {
  AIIntelligenceLevel,
  Card,
  Partnership,
  Player,
  PlayerId,
  Suit,
  TeamId,
  TrickCard,
  TrickResult,
} from '../types/game';
import { determineTrickWinner } from './trickWinner';
import { OPPOSITE_PARTNERS } from './dealing';

export interface AICardDecision extends Card {
  tacticalTactic?: string;
}

export interface AIBidDecision {
  bid: number;
  tacticalReason?: string;
  isCalculatedRisk?: boolean;
}

/**
 * Calculates a rules-compliant, intelligent AI bid.
 * - Allows individual bids of 0 or 1.
 * - In Novice/Master: standard conservative valuation.
 * - In Legend: calculated risks (10-bid milestone push for +20 bonus, deficit comeback gambits, distributional ruffing shape evaluation, calculated nil).
 */
export function calculateAIBid(
  hand: Card[],
  trumpSuit: Suit | null,
  isJokerRevealHand: boolean,
  partnerBid: number | null,
  mode: AIIntelligenceLevel = 'legend',
  partnerships?: Record<TeamId, Partnership>,
  playerTeamId?: TeamId
): AIBidDecision {
  let estimatedTricks = 0;
  let tacticalReason: string | undefined;
  let isCalculatedRisk = false;

  const trumps = trumpSuit && !isJokerRevealHand ? hand.filter(c => c.suit === trumpSuit) : [];
  const trumpCount = trumps.length;
  const hasJoker = hand.some(c => c.isDadajiJoker);

  for (const card of hand) {
    if (card.isDadajiJoker) {
      estimatedTricks += 1.0;
      continue;
    }

    const isTrump = trumpSuit && !isJokerRevealHand && card.suit === trumpSuit;

    if (card.rank === 'A') {
      estimatedTricks += isTrump ? 1.0 : 0.85;
    } else if (card.rank === 'K') {
      estimatedTricks += isTrump ? 0.7 : 0.45;
    } else if (card.rank === 'Q' && isTrump) {
      estimatedTricks += 0.4;
    } else if (card.rank === 'J' && isTrump) {
      estimatedTricks += 0.25;
    }
  }

  // Trump length bonus
  if (trumpCount >= 6) estimatedTricks += 2.0;
  else if (trumpCount >= 5) estimatedTricks += 1.2;
  else if (trumpCount >= 4) estimatedTricks += 0.5;

  // -------------------------------------------------------------------------
  // NOVICE & MASTER BIDDING (Conservative)
  // -------------------------------------------------------------------------
  if (mode === 'novice' || mode === 'master') {
    let rawBid = Math.max(0, Math.min(13, Math.round(estimatedTricks)));
    if (partnerBid !== null && partnerBid !== undefined) {
      if (rawBid + partnerBid < 2) {
        rawBid = Math.max(rawBid, 2 - partnerBid);
      }
    }
    return {
      bid: rawBid,
      tacticalReason: mode === 'master' ? '⚖️ Standard Safe Bid' : undefined,
    };
  }

  // -------------------------------------------------------------------------
  // LEGEND MODE: CALCULATED AGGRESSION & GAME-STATE RISKS
  // -------------------------------------------------------------------------
  // 1. Distributional shape evaluation (Ruffing Value)
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  let voidCount = 0;
  let singletonCount = 0;

  for (const suit of suits) {
    if (trumpSuit && suit === trumpSuit) continue;
    const count = hand.filter(c => c.suit === suit).length;
    if (count === 0) voidCount++;
    else if (count === 1) singletonCount++;
  }

  if (trumpCount >= 3) {
    if (voidCount > 0) {
      estimatedTricks += voidCount * 1.2;
      tacticalReason = '🎯 Calculated Shape Stretch (Void Ruffing)';
      isCalculatedRisk = true;
    } else if (singletonCount > 0) {
      estimatedTricks += singletonCount * 0.6;
    }
  }

  // Synergy: Dadaji Joker + 4+ Trumps is an unshakeable control holding
  if (hasJoker && trumpCount >= 4) {
    estimatedTricks += 0.8;
  }

  let rawBid = Math.max(0, Math.min(13, Math.round(estimatedTricks)));

  // 2. Score Deficit Comeback Gambit: If trailing by >= 25 points, stretch bid
  if (partnerships && playerTeamId) {
    const oppTeamId: TeamId = playerTeamId === 'team1' ? 'team2' : 'team1';
    const myScore = partnerships[playerTeamId].matchScore;
    const oppScore = partnerships[oppTeamId].matchScore;
    const deficit = oppScore - myScore;

    if (deficit >= 25 && rawBid < 10 && estimatedTricks >= rawBid - 0.4) {
      rawBid = Math.min(13, rawBid + 1);
      tacticalReason = '🔥 Calculated Comeback Gambit (Aggressive Stretch)';
      isCalculatedRisk = true;
    }
  }

  // 3. Milestone 10-Contract Push (+20 Bonus Hunting):
  // If partner already bid 4+, and combined bid is 8 or 9, stretch to 10!
  if (partnerBid !== null && partnerBid !== undefined && partnerBid >= 4) {
    const combined = rawBid + partnerBid;
    if ((combined === 8 || combined === 9) && (hasJoker || trumpCount >= 3 || hand.some(c => c.rank === 'A'))) {
      rawBid = 10 - partnerBid;
      tacticalReason = '⚔️ Calculated 10-Bid Push (+20 Bonus Attempt)';
      isCalculatedRisk = true;
    }
  }

  // 4. Boston 13-Trick Shot:
  if (partnerBid !== null && partnerBid !== undefined && partnerBid >= 6 && estimatedTricks >= 6 && (hasJoker || trumpCount >= 5)) {
    rawBid = 13 - partnerBid;
    tacticalReason = '🚀 Calculated Boston 13-Trick Shot';
    isCalculatedRisk = true;
  }

  // 5. Tactical Nil (Clean Ducking):
  const hasFaceOrTrumpOrJoker = hand.some(
    c => c.isDadajiJoker || (trumpSuit && c.suit === trumpSuit) || c.rank === 'A' || c.rank === 'K' || c.rank === 'Q' || c.rank === 'J'
  );
  if (!hasFaceOrTrumpOrJoker && partnerBid !== null && partnerBid >= 2) {
    rawBid = 0;
    tacticalReason = '🧊 Calculated Nil (Clean Ducking)';
    isCalculatedRisk = true;
  }

  // Ensure combined partnership minimum of >= 2
  if (partnerBid !== null && partnerBid !== undefined) {
    if (rawBid + partnerBid < 2) {
      rawBid = Math.max(rawBid, 2 - partnerBid);
      if (!tacticalReason) {
        tacticalReason = '⚖️ Partnership Quota Adjustment';
      }
    }
  }

  if (!tacticalReason) {
    tacticalReason = rawBid >= 4 ? '⚡ High-Ceiling Value Bid' : '🛡️ Solid Positional Bid';
  }

  return {
    bid: rawBid,
    tacticalReason,
    isCalculatedRisk,
  };
}

// ================= MEMORY ENGINE UTILITIES =================

/**
 * Extracts card IDs already played in previous tricks of the hand.
 */
export function extractPlayedCardIds(trickHistory: TrickResult[]): Set<string> {
  const set = new Set<string>();
  for (const trick of trickHistory) {
    for (const play of trick.cards) {
      set.add(play.card.id);
    }
  }
  return set;
}

/**
 * Extracts suit voids for each player based on past trick history.
 * If a player did not follow the led suit with a card of that suit, they are void.
 */
export function extractVoidMatrix(trickHistory: TrickResult[]): Record<PlayerId, Set<Suit>> {
  const matrix: Record<PlayerId, Set<Suit>> = {
    south: new Set(),
    east: new Set(),
    north: new Set(),
    west: new Set(),
  };

  for (const trick of trickHistory) {
    if (trick.cards.length === 0) continue;
    const leadCard = trick.cards[0].card;
    const leadSuit: Suit = leadCard.isDadajiJoker ? 'spades' : (leadCard.suit as Suit);

    for (let i = 1; i < trick.cards.length; i++) {
      const play = trick.cards[i];
      // If player played off-suit (non-joker and non-led-suit), they showed void in leadSuit!
      if (!play.card.isDadajiJoker && play.card.suit !== leadSuit) {
        matrix[play.playerId].add(leadSuit);
      }
    }
  }

  return matrix;
}

/**
 * Checks if a card is currently the Boss (highest remaining card of its suit in circulation).
 */
export function isBossCard(
  card: Card,
  playedCardIds: Set<string>,
  hand: Card[]
): boolean {
  if (card.isDadajiJoker) return true;
  if (card.rank === 'A') return true;

  // Check if any card of higher value in the same suit is still unplayed and not held in own hand
  for (let val = card.value + 1; val <= 14; val++) {
    const higherRank = val === 14 ? 'A' : val === 13 ? 'K' : val === 12 ? 'Q' : val === 11 ? 'J' : `${val}`;
    const higherCardId = `${card.suit}_${higherRank}`;
    const isAlreadyPlayed = playedCardIds.has(higherCardId);
    const inOwnHand = hand.some(c => c.id === higherCardId);
    if (!isAlreadyPlayed && !inOwnHand) {
      return false;
    }
  }

  return true;
}

// ================= INTELLIGENT CARD SELECTION =================

/**
 * Selects an intelligent card to play based on the active Intelligence Mode:
 * - 'novice': Basic play, no card memory, no advanced tricks.
 * - 'master': Unveils Partner Protection, Trick 12 Joker mandate, honor ducking, Ace cashing.
 * - 'legend': Unveils Full Card Memory, King-Rescue Strike, Trump-Ace Decapitation, Partner Void Feeding, Boss Card Promotion, and Calculated Risks (under-lead finesse, trump extraction, Boston interception/pursuit, smooth duck).
 */
export function chooseAICard(
  player: Player,
  legalCards: Card[],
  currentTrick: TrickCard[],
  trickNumber: number,
  trumpSuit: Suit | null,
  isJokerRevealHand: boolean,
  mode: AIIntelligenceLevel = 'legend',
  trickHistory: TrickResult[] = [],
  _partnerships?: Record<TeamId, Partnership>
): AICardDecision {
  if (legalCards.length === 1) {
    return { ...legalCards[0] };
  }

  const partnerId = OPPOSITE_PARTNERS[player.id];
  const playedCardIds = extractPlayedCardIds(trickHistory);
  const voidMatrix = extractVoidMatrix(trickHistory);
  const jokerCard = legalCards.find(c => c.isDadajiJoker);

  // =========================================================================
  // CASE 1: AI IS LEADING THE TRICK (currentTrick is empty)
  // =========================================================================
  if (currentTrick.length === 0) {
    // -----------------------------------------------------------------------
    // NOVICE LEADING
    // -----------------------------------------------------------------------
    if (mode === 'novice') {
      const nonJokers = legalCards.filter(c => !c.isDadajiJoker);
      if (nonJokers.length > 0) {
        return { ...nonJokers[Math.floor(Math.random() * nonJokers.length)] };
      }
      return { ...legalCards[0] };
    }

    // -----------------------------------------------------------------------
    // LEGEND LEADING: CALCULATED RISKS & ADVANCED GAMBITS
    // -----------------------------------------------------------------------
    if (mode === 'legend') {
      // 1. CALCULATED GAMBIT: Boston Pursuit Sweep
      // If team has won 100% of tricks so far (at least 3 tricks played), play aggressively to maintain sweep!
      const teamWonAll = trickHistory.length >= 3 && trickHistory.every(t => t.winnerId === player.id || t.winnerId === partnerId);
      if (teamWonAll) {
        const bossCards = legalCards.filter(c => !c.isDadajiJoker && isBossCard(c, playedCardIds, player.hand));
        if (bossCards.length > 0) {
          bossCards.sort((a, b) => b.value - a.value);
          return {
            ...bossCards[0],
            tacticalTactic: '🚀 Calculated Boston Pursuit (Cashed Boss)',
          };
        }
      }

      // 2. CALCULATED GAMBIT: Trump Bleeding / Extraction
      // If AI holds dominant trumps (3+ trumps or Joker + trumps) AND holds side-suit Boss cards:
      // Aggressively lead trumps to bleed opponents' trumps so side Bosses won't be ruffed!
      const trumpsInHand = trumpSuit && !isJokerRevealHand ? legalCards.filter(c => !c.isDadajiJoker && c.suit === trumpSuit) : [];
      const sideBosses = legalCards.filter(c => !c.isDadajiJoker && (isJokerRevealHand || c.suit !== trumpSuit) && isBossCard(c, playedCardIds, player.hand));
      if (trumpSuit && !isJokerRevealHand && trumpsInHand.length >= 3 && sideBosses.length > 0) {
        const playedTrumpsCount = Array.from(playedCardIds).filter(id => id.startsWith(trumpSuit)).length;
        if (playedTrumpsCount + trumpsInHand.length < 12) {
          trumpsInHand.sort((a, b) => b.value - a.value);
          return {
            ...trumpsInHand[0],
            tacticalTactic: '⚔️ Calculated Trump Extraction',
          };
        }
      }

      // 3. CALCULATED GAMBIT: The Under-lead Finesse
      // If AI holds Ace + Queen in a side suit with 3+ cards, under-lead low through opponents to trap their King!
      for (const s of ['spades', 'hearts', 'diamonds', 'clubs'] as Suit[]) {
        if (trumpSuit && s === trumpSuit) continue;
        const suitCards = legalCards.filter(c => !c.isDadajiJoker && c.suit === s);
        const hasAce = suitCards.some(c => c.rank === 'A');
        const hasQueen = suitCards.some(c => c.rank === 'Q');
        const lowCards = suitCards.filter(c => c.value <= 8);
        if (hasAce && hasQueen && lowCards.length > 0 && suitCards.length >= 3) {
          lowCards.sort((a, b) => a.value - b.value);
          return {
            ...lowCards[0],
            tacticalTactic: `🎲 Calculated Under-lead Finesse (${s.toUpperCase()})`,
          };
        }
      }

      // 4. Partner Void Feeding: Lead low card in partner's known void for partner ruff
      const partnerVoids = voidMatrix[partnerId];
      if (partnerVoids && partnerVoids.size > 0 && trumpSuit && !isJokerRevealHand) {
        for (const voidSuit of partnerVoids) {
          if (voidSuit !== trumpSuit) {
            const lowCardsInVoidSuit = legalCards.filter(
              c => !c.isDadajiJoker && c.suit === voidSuit && c.value <= 9
            );
            if (lowCardsInVoidSuit.length > 0) {
              lowCardsInVoidSuit.sort((a, b) => a.value - b.value);
              return {
                ...lowCardsInVoidSuit[0],
                tacticalTactic: "🎯 Fed Partner's Void",
              };
            }
          }
        }
      }

      // 5. Dynamic Boss Card Promotion Cashing
      const bossCards = legalCards.filter(
        c => !c.isDadajiJoker && (isJokerRevealHand || c.suit !== trumpSuit) && isBossCard(c, playedCardIds, player.hand)
      );
      if (bossCards.length > 0) {
        bossCards.sort((a, b) => b.value - a.value);
        return {
          ...bossCards[0],
          tacticalTactic: '💎 Cashed Promoted Boss Card',
        };
      }
    }

    // -----------------------------------------------------------------------
    // MASTER LEADING: Basic Ace Cashing
    // -----------------------------------------------------------------------
    const nonTrumpAces = legalCards.filter(
      c => !c.isDadajiJoker && c.rank === 'A' && (isJokerRevealHand || c.suit !== trumpSuit)
    );
    if (nonTrumpAces.length > 0) {
      return {
        ...nonTrumpAces[0],
        tacticalTactic: '👑 Cashed Side Ace',
      };
    }

    // Default leading: Lead lowest card in long suit to preserve high cards
    const nonJokerCards = legalCards.filter(c => !c.isDadajiJoker);
    if (nonJokerCards.length > 0) {
      const sortedLow = [...nonJokerCards].sort((a, b) => a.value - b.value);
      const nonTrumpLow = sortedLow.find(c => isJokerRevealHand || c.suit !== trumpSuit);
      if (nonTrumpLow) return { ...nonTrumpLow };
      return { ...sortedLow[0] };
    }

    return { ...legalCards[0] };
  }

  // =========================================================================
  // CASE 2: AI IS FOLLOWING AN EXISTING TRICK
  // =========================================================================
  const currentLeader = determineTrickWinner(
    currentTrick,
    trickNumber,
    trumpSuit,
    isJokerRevealHand
  );
  const isPartnerCurrentlyWinning = currentLeader.winnerId === partnerId;
  const leadPlay = currentTrick[0];
  const effectiveLeadSuit = leadPlay.card.isDadajiJoker ? 'spades' : leadPlay.card.suit;

  // Separate winning vs losing plays
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

  // -------------------------------------------------------------------------
  // NOVICE FOLLOWING: Plays lowest winner or lowest card, no special tricks
  // -------------------------------------------------------------------------
  if (mode === 'novice') {
    const standardWinners = winningPlays.filter(c => !c.isDadajiJoker);
    if (standardWinners.length > 0) {
      standardWinners.sort((a, b) => a.value - b.value);
      return { ...standardWinners[0] };
    }
    const standardLosers = losingPlays.filter(c => !c.isDadajiJoker);
    if (standardLosers.length > 0) {
      standardLosers.sort((a, b) => a.value - b.value);
      return { ...standardLosers[0] };
    }
    return { ...legalCards[0] };
  }

  // -------------------------------------------------------------------------
  // PARTNER PROTECTION (Master & Legend): Never overtakes winning partner!
  // -------------------------------------------------------------------------
  if (isPartnerCurrentlyWinning) {
    if (losingPlays.length > 0) {
      const nonJokerLosing = losingPlays.filter(c => !c.isDadajiJoker);
      if (nonJokerLosing.length > 0) {
        // Discard lowest non-trump card
        const nonTrumpLosing = nonJokerLosing.filter(c => isJokerRevealHand || c.suit !== trumpSuit);
        if (nonTrumpLosing.length > 0) {
          nonTrumpLosing.sort((a, b) => a.value - b.value);
          return {
            ...nonTrumpLosing[0],
            tacticalTactic: '🛡️ Partner Protected (Sloughed Junk)',
          };
        }
        nonJokerLosing.sort((a, b) => a.value - b.value);
        return {
          ...nonJokerLosing[0],
          tacticalTactic: '🛡️ Partner Protected (Ducked Low)',
        };
      }
    }
  }

  // -------------------------------------------------------------------------
  // LEGEND CALCULATED RISKS (Case 2: Following)
  // -------------------------------------------------------------------------
  if (mode === 'legend' && !isPartnerCurrentlyWinning) {
    // 1. CALCULATED GAMBIT: Boston Interception Strike!
    // If opponents have swept 100% of tricks so far (at least 3 tricks), strike with highest winner to prevent Boston!
    const opponentSweeping = trickHistory.length >= 3 && trickHistory.every(t => t.winnerId !== player.id && t.winnerId !== partnerId);
    if (opponentSweeping && winningPlays.length > 0) {
      const bestWinner = [...winningPlays].sort((a, b) => b.value - a.value)[0];
      return {
        ...bestWinner,
        tacticalTactic: '💥 Calculated Boston Interception',
      };
    }

    // 2. CALCULATED GAMBIT: The Smooth Tenace Duck (The Trap)
    // When opponent leads a Queen, Jack, or 10 into AI's Ace-King or King-10 holding:
    // Smoothly duck low so opponent is forced to lead again into AI's fortified tenace!
    if (
      leadPlay &&
      leadPlay.playerId !== partnerId &&
      (leadPlay.card.rank === 'Q' || leadPlay.card.rank === 'J' || leadPlay.card.rank === '10')
    ) {
      const sameSuitCards = legalCards.filter(c => !c.isDadajiJoker && c.suit === leadPlay.card.suit);
      const hasAce = sameSuitCards.some(c => c.rank === 'A');
      const hasKing = sameSuitCards.some(c => c.rank === 'K');
      const lowCards = sameSuitCards.filter(c => c.value < leadPlay.card.value);
      if (hasAce && hasKing && lowCards.length > 0) {
        lowCards.sort((a, b) => a.value - b.value);
        return {
          ...lowCards[0],
          tacticalTactic: `🧊 Calculated Smooth Duck (${leadPlay.card.shortName} Trapped)`,
        };
      }
    }

    // 3. CALCULATED GAMBIT: Critical Contract Denial Strike
    // When opponents are 1 trick away from clinching contract, deploy top winner!
    if (_partnerships && winningPlays.length > 0 && trickNumber >= 5 && trickNumber < 13) {
      const oppTeamId: TeamId = player.teamId === 'team1' ? 'team2' : 'team1';
      const oppTeam = _partnerships[oppTeamId];
      if (oppTeam.totalBid > 0 && oppTeam.tricksWon === oppTeam.totalBid - 1) {
        const bestWinner = [...winningPlays].sort((a, b) => b.value - a.value)[0];
        return {
          ...bestWinner,
          tacticalTactic: '🛡️ Calculated Contract Denial Strike',
        };
      }
    }
  }

  // -------------------------------------------------------------------------
  // LEGEND TACTICS: Unveils King-Rescue Strike & Trump-Ace Decapitation
  // -------------------------------------------------------------------------
  if (mode === 'legend' && jokerCard && trickNumber >= 2 && trickNumber < 13 && !isPartnerCurrentlyWinning) {
    // 1. TACTIC: Trump-Ace Decapitation!
    // If an opponent played or ruffed with the Trump Ace:
    const opponentTrumpAcePlay = currentTrick.find(
      t => t.playerId !== partnerId && !isJokerRevealHand && t.card.suit === trumpSuit && t.card.rank === 'A'
    );
    if (opponentTrumpAcePlay) {
      return {
        ...jokerCard,
        tacticalTactic: '⚡ Trump-Ace Decapitation!',
      };
    }

    // 2. TACTIC: King-Rescue Strike!
    // If opponent played or led an Ace, and AI holds the King of that same suit:
    // Hitting the Joker wins the trick, decapitates opponent's Ace, and rescues player's King!
    const opponentAcePlay = currentTrick.find(
      t => t.playerId !== partnerId && t.card.rank === 'A'
    );
    if (opponentAcePlay) {
      const heldKingOfSameSuit = player.hand.find(
        c => !c.isDadajiJoker && c.suit === opponentAcePlay.card.suit && c.rank === 'K'
      );
      if (heldKingOfSameSuit) {
        return {
          ...jokerCard,
          tacticalTactic: `👑 King-Rescue Strike (${heldKingOfSameSuit.shortName} Saved!)`,
        };
      }
    }

    // 3. High-Leverage Opponent King/Queen Threat
    // If opponent played a high honor and AI holds no other card that can win:
    const opponentHighHonor = currentTrick.find(
      t => t.playerId !== partnerId && (t.card.rank === 'A' || t.card.rank === 'K' || (!isJokerRevealHand && t.card.suit === trumpSuit && t.card.value >= 11))
    );
    if (opponentHighHonor && winningPlays.length === 1 && winningPlays[0].isDadajiJoker) {
      return {
        ...jokerCard,
        tacticalTactic: '★ Tactical Dadaji Strike',
      };
    }
  }

  // -------------------------------------------------------------------------
  // TRICK 12 JOKER MANDATE (Master & Legend)
  // Must play Joker in Trick 12 before Trick 13 devaluation
  // -------------------------------------------------------------------------
  if ((mode === 'master' || mode === 'legend') && trickNumber === 12 && jokerCard && !isPartnerCurrentlyWinning) {
    return {
      ...jokerCard,
      tacticalTactic: '⏰ Trick 12 Joker Mandate (Pre-Devaluation)',
    };
  }

  // -------------------------------------------------------------------------
  // WINNING PLAY SELECTION (Conserving high cards)
  // -------------------------------------------------------------------------
  if (winningPlays.length > 0) {
    // Check non-joker winning plays first
    const nonJokerWins = winningPlays.filter(c => !c.isDadajiJoker);
    if (nonJokerWins.length > 0) {
      // DUCKING PRINCIPLE (Master & Legend):
      // If AI holds King and low card of led suit, but an unplayed Ace is still out there,
      // and a low winning play is possible, choose lowest winning card
      nonJokerWins.sort((a, b) => a.value - b.value);
      return { ...nonJokerWins[0] };
    }

    // Only Joker can win:
    // Evaluate if trick has high stakes or if it's trick 12
    const hasHighStake = currentTrick.some(
      t => t.card.rank === 'A' || t.card.rank === 'K' || (!isJokerRevealHand && t.card.suit === trumpSuit)
    );
    if (hasHighStake || losingPlays.length === 0 || trickNumber === 12) {
      return {
        ...winningPlays[0],
        tacticalTactic: '★ High-Stakes Universal Trump',
      };
    }

    // Save Joker and discard low losing card instead
    if (losingPlays.length > 0) {
      const nonJokerLosing = losingPlays.filter(c => !c.isDadajiJoker);
      if (nonJokerLosing.length > 0) {
        nonJokerLosing.sort((a, b) => a.value - b.value);
        return {
          ...nonJokerLosing[0],
          tacticalTactic: '🦆 Conserved Joker for Later',
        };
      }
    }
    return { ...winningPlays[0] };
  }

  // -------------------------------------------------------------------------
  // CANNOT WIN: DUCK / PASS WITH LOWEST LOSING CARD
  // -------------------------------------------------------------------------
  const nonJokerDiscards = losingPlays.filter(c => !c.isDadajiJoker);
  if (nonJokerDiscards.length > 0) {
    // Discard lowest non-trump card
    const nonTrumpDiscards = nonJokerDiscards.filter(c => isJokerRevealHand || c.suit !== trumpSuit);
    if (nonTrumpDiscards.length > 0) {
      nonTrumpDiscards.sort((a, b) => a.value - b.value);
      return { ...nonTrumpDiscards[0] };
    }
    nonJokerDiscards.sort((a, b) => a.value - b.value);
    return { ...nonJokerDiscards[0] };
  }

  return { ...legalCards[0] };
}
