export interface PartnershipScoreResult {
  totalBid: number;
  tricksWon: number;
  succeeded: boolean;
  scoreDelta: number;
  isBostonSweep: boolean;
  explanation: string;
}

export interface HandScoringResult {
  team1: PartnershipScoreResult;
  team2: PartnershipScoreResult;
}

/**
 * Calculates a partnership's score delta for a hand according to the playbook:
 * - Successful contract (bids 2..9): Exactly +totalBid (extra tricks give 0).
 * - Successful high contract (bids 10..13): Exactly +2 * totalBid (e.g. bid 10 => +20, bid 13 => +26).
 * - Failed contract: Exactly -totalBid (e.g. bid 5, win 4 => -5; bid 10, win 9 => -10).
 * - Boston sweep: If a team wins all 13 tricks, Boston sweep rule applies.
 *   Note: For bid 13 winning 13 tricks, the high-contract score is +26 points (Test 35).
 *   For lower bids winning 13 tricks, the score is doubled (e.g. bid 5 winning 13 => 5 * 2 = 10) (Test 36).
 */
export function calculatePartnershipScore(
  totalBid: number,
  tricksWon: number,
  enableBostonSweepDouble: boolean = false
): PartnershipScoreResult {
  const succeeded = tricksWon >= totalBid;
  const isBostonSweep = tricksWon === 13;

  let scoreDelta = 0;
  let explanation = '';

  if (succeeded) {
    if (totalBid >= 10) {
      // High contract (10..13): award double the bid
      scoreDelta = 2 * totalBid;
      explanation = `High Contract (${totalBid} bid met): +${scoreDelta} points (2x bid).`;
    } else {
      // Standard contract (2..9): award exactly the bid
      scoreDelta = totalBid;
      explanation = `Contract (${totalBid} bid met with ${tricksWon} tricks): +${scoreDelta} points.`;
    }

    // Boston sweep doubling (if enabled for non-13 bids or when explicit sweep bonus is applied)
    if (isBostonSweep && enableBostonSweepDouble && totalBid < 13) {
      scoreDelta *= 2;
      explanation += ` Boston Sweep (13 tricks won): Doubled to +${scoreDelta} points!`;
    }
  } else {
    // Failed contract: subtract exactly the bid
    scoreDelta = -totalBid;
    explanation = `Contract failed (${tricksWon} tricks < ${totalBid} bid): ${scoreDelta} points.`;
  }

  return {
    totalBid,
    tricksWon,
    succeeded,
    scoreDelta,
    isBostonSweep,
    explanation,
  };
}

/**
 * Calculates complete hand scoring for both partnerships.
 */
export function calculateHandScores(
  team1Bid: number,
  team1Tricks: number,
  team2Bid: number,
  team2Tricks: number
): HandScoringResult {
  return {
    team1: calculatePartnershipScore(team1Bid, team1Tricks),
    team2: calculatePartnershipScore(team2Bid, team2Tricks),
  };
}
