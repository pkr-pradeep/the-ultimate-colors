import { MatchConfig, MatchMode, TeamId } from '../types/game';

export interface MatchStatus {
  isMatchOver: boolean;
  winner: TeamId | 'tie' | null;
  reason: string;
}

/**
 * Checks whether the match is completed under the active mode rules.
 */
export function evaluateMatchStatus(
  matchConfig: MatchConfig,
  team1Score: number,
  team2Score: number,
  isHandInProgress: boolean,
  isTimeExpired: boolean
): MatchStatus {
  // If a hand is currently actively playing, do not terminate mid-hand (Section 11)
  if (isHandInProgress) {
    return {
      isMatchOver: false,
      winner: null,
      reason: 'Hand in progress.',
    };
  }

  // Mode 1: Default Point Mode (Target 100)
  // Mode 2: Custom Point Mode (Target matchConfig.targetPoints)
  if (matchConfig.mode === 'default_points' || matchConfig.mode === 'custom_points') {
    const target = matchConfig.mode === 'default_points' ? 100 : matchConfig.targetPoints;

    const team1Reached = team1Score >= target;
    const team2Reached = team2Score >= target;

    if (team1Reached || team2Reached) {
      if (team1Score > team2Score) {
        return {
          isMatchOver: true,
          winner: 'team1',
          reason: `Team 1 (South & North) reached ${team1Score} points (target: ${target})!`,
        };
      } else if (team2Score > team1Score) {
        return {
          isMatchOver: true,
          winner: 'team2',
          reason: `Team 2 (West & East) reached ${team2Score} points (target: ${target})!`,
        };
      } else {
        // Equal scores above target
        return {
          isMatchOver: true,
          winner: 'tie',
          reason: `Match ended in an exact tie at ${team1Score} points!`,
        };
      }
    }

    return {
      isMatchOver: false,
      winner: null,
      reason: `First team to ${target} points wins.`,
    };
  }

  // Mode 3: Time Mode
  if (matchConfig.mode === 'time') {
    if (isTimeExpired && !isHandInProgress) {
      if (team1Score > team2Score) {
        return {
          isMatchOver: true,
          winner: 'team1',
          reason: `Time expired! Team 1 leads with ${team1Score} vs ${team2Score} points.`,
        };
      } else if (team2Score > team1Score) {
        return {
          isMatchOver: true,
          winner: 'team2',
          reason: `Time expired! Team 2 leads with ${team2Score} vs ${team1Score} points.`,
        };
      } else {
        return {
          isMatchOver: true,
          winner: 'tie',
          reason: `Time expired! Match ended in a tie at ${team1Score} points.`,
        };
      }
    }

    return {
      isMatchOver: false,
      winner: null,
      reason: 'Time Mode active.',
    };
  }

  return {
    isMatchOver: false,
    winner: null,
    reason: 'Active match.',
  };
}
