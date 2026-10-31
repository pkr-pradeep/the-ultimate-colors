import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { MatchConfig, Partnership, Player, PlayerId, TeamId } from '../types/game';
import { RulebookLanguage, getSavedRulebookLanguage, saveRulebookLanguage } from '../utils/firstTimeUser';
import { LanguageSelector } from './LanguageSelector';
import { MODAL_TRANSLATIONS } from '../data/modalTranslations';

interface ScoreboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Record<PlayerId, Player>;
  partnerships: Record<TeamId, Partnership>;
  handNumber: number;
  matchConfig: MatchConfig;
  isMatchOver?: boolean;
  matchWinner?: TeamId | 'tie' | null;
  onNextHand?: () => void;
  onRestartMatch?: () => void;
  autoDealCountdown?: number | null;
  isAutoDealPaused?: boolean;
  onTogglePauseAutoDeal?: () => void;
  language?: RulebookLanguage;
  onLanguageChange?: (lang: RulebookLanguage) => void;
}

export const ScoreboardModal: React.FC<ScoreboardModalProps> = ({
  isOpen,
  onClose,
  players,
  partnerships,
  handNumber,
  matchConfig,
  isMatchOver = false,
  matchWinner = null,
  onNextHand,
  onRestartMatch,
  autoDealCountdown = null,
  isAutoDealPaused = false,
  onTogglePauseAutoDeal,
  language: controlledLang,
  onLanguageChange,
}) => {
  const [localLang, setLocalLang] = useState<RulebookLanguage>(controlledLang || getSavedRulebookLanguage());

  useEffect(() => {
    if (controlledLang) {
      setLocalLang(controlledLang);
    } else {
      setLocalLang(getSavedRulebookLanguage());
    }
  }, [isOpen, controlledLang]);

  const activeLang = controlledLang || localLang;
  const t = (MODAL_TRANSLATIONS[activeLang] || MODAL_TRANSLATIONS.en).scoreboard;

  const handleLangChange = (lang: RulebookLanguage) => {
    setLocalLang(lang);
    saveRulebookLanguage(lang);
    onLanguageChange?.(lang);
  };

  useEffect(() => {
    if (isOpen && isMatchOver) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#D4AF37', '#DC2626', '#FEF08A', '#10B981'],
      });
    }
  }, [isOpen, isMatchOver]);

  if (!isOpen) return null;

  const team1 = partnerships.team1;
  const team2 = partnerships.team2;

  const targetLabel =
    matchConfig.mode === 'default_points'
      ? t.targetDefault
      : matchConfig.mode === 'custom_points'
      ? t.targetCustom(matchConfig.targetPoints)
      : t.targetTime;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-neutral-950/85 backdrop-blur-md animate-fade-in font-outfit">
      <div className="relative w-full max-w-xl max-h-[90dvh] overflow-y-auto bg-gradient-to-b from-[#2E1810] via-[#1F100B] to-[#120704] border-2 border-amber-600/70 rounded-2xl p-4 sm:p-8 shadow-2xl text-center text-amber-100">
        {/* Top Controls: Language Toggle & Close Button */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-800/40">
          <LanguageSelector
            currentLanguage={activeLang}
            onSelectLanguage={handleLangChange}
            size="sm"
            showIcon
          />
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-amber-700/60 text-amber-300 hover:text-white flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Header */}
        <div className="mb-5">
          <div className="inline-block px-3 py-1 rounded-full bg-amber-950 border border-amber-600/50 text-amber-300 font-cinzel text-xs uppercase tracking-widest mb-1">
            {isMatchOver ? t.titleFinal : t.titleSummary(handNumber)}
          </div>
          <h2 className="font-cinzel text-2xl sm:text-3xl font-black text-amber-200">
            {isMatchOver
              ? matchWinner === 'tie'
                ? t.tieTitle
                : t.championTitle(matchWinner === 'team1' ? team1.name : team2.name)
              : t.subtitle}
          </h2>
          <p className="text-xs text-amber-300/80 font-outfit mt-1">
            {targetLabel} · {t.scoringMatrix}
          </p>
        </div>

        {/* Partnership Scores Table */}
        <div className="overflow-x-auto rounded-xl border border-amber-700/40 bg-neutral-950/70 mb-5">
          <table className="w-full text-left font-outfit text-xs sm:text-sm">
            <thead className="bg-amber-950/80 text-amber-300 font-cinzel text-[11px] uppercase tracking-wider border-b border-amber-800/50">
              <tr>
                <th className="py-2.5 px-3">{t.colPartnership}</th>
                <th className="py-2.5 px-2 text-center">{t.colIndividualBids}</th>
                <th className="py-2.5 px-2 text-center">{t.colTeamBid}</th>
                <th className="py-2.5 px-2 text-center">{t.colTricksWon}</th>
                <th className="py-2.5 px-2 text-center">{t.colHandResult}</th>
                <th className="py-2.5 px-3 text-right">{t.colMatchPoints}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-900/30 text-amber-100">
              {/* Team 1 */}
              <tr className="bg-amber-950/30 font-semibold">
                <td className="py-3 px-3">
                  <div className="flex flex-col">
                    <span className="font-cinzel text-amber-100 flex items-center gap-1">
                      {t.team1Label}
                    </span>
                    <span className="text-[10px] text-amber-400/70 font-sans">
                      {t.team1Seats}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2 text-center font-mono text-amber-300">
                  {players.south.bid ?? '0'} + {players.north.bid ?? '0'}
                </td>
                <td className="py-3 px-2 text-center font-mono font-bold text-amber-200">
                  {team1.totalBid}
                </td>
                <td className="py-3 px-2 text-center font-mono">
                  <span
                    className={
                      team1.tricksWon >= team1.totalBid
                        ? 'text-emerald-400 font-bold'
                        : 'text-rose-400 font-bold'
                    }
                  >
                    {team1.tricksWon}
                  </span>
                </td>
                <td className="py-3 px-2 text-center text-xs">
                  {team1.tricksWon === 13 ? (
                    <span className="text-amber-400 font-bold">{t.bostonSweep}</span>
                  ) : team1.tricksWon >= team1.totalBid ? (
                    <span className="text-emerald-400">
                      {t.metContract(team1.totalBid >= 10 ? team1.totalBid * 2 : team1.totalBid)}
                    </span>
                  ) : (
                    <span className="text-rose-400">{t.failedContract(team1.totalBid)}</span>
                  )}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-base text-amber-300">
                  {team1.matchScore}
                </td>
              </tr>

              {/* Team 2 */}
              <tr>
                <td className="py-3 px-3">
                  <div className="flex flex-col">
                    <span className="font-cinzel text-amber-100 flex items-center gap-1">
                      {t.team2Label}
                    </span>
                    <span className="text-[10px] text-amber-400/70 font-sans">
                      {t.team2Seats}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2 text-center font-mono text-amber-300">
                  {players.west.bid ?? '0'} + {players.east.bid ?? '0'}
                </td>
                <td className="py-3 px-2 text-center font-mono font-bold text-amber-200">
                  {team2.totalBid}
                </td>
                <td className="py-3 px-2 text-center font-mono">
                  <span
                    className={
                      team2.tricksWon >= team2.totalBid
                        ? 'text-emerald-400 font-bold'
                        : 'text-rose-400 font-bold'
                    }
                  >
                    {team2.tricksWon}
                  </span>
                </td>
                <td className="py-3 px-2 text-center text-xs">
                  {team2.tricksWon === 13 ? (
                    <span className="text-amber-400 font-bold">{t.bostonSweep}</span>
                  ) : team2.tricksWon >= team2.totalBid ? (
                    <span className="text-emerald-400">
                      {t.metContract(team2.totalBid >= 10 ? team2.totalBid * 2 : team2.totalBid)}
                    </span>
                  ) : (
                    <span className="text-rose-400">{t.failedContract(team2.totalBid)}</span>
                  )}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-base text-amber-300">
                  {team2.matchScore}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Scoring Rules Quick Clarification */}
        <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-amber-900/40 text-left text-[11px] text-amber-300/80 mb-5 space-y-0.5">
          <div>• {t.rulePoint1}</div>
          <div>• {t.rulePoint2}</div>
          <div>• {t.rulePoint3}</div>
          <div>• {t.rulePoint4}</div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {!isMatchOver && onNextHand && (
            <div className="flex flex-col items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onNextHand}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-cinzel font-bold text-xs uppercase rounded-xl border border-emerald-300 shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <span>{t.btnDealNext}</span>
                {autoDealCountdown !== null && !isAutoDealPaused && (
                  <span className="px-2 py-0.5 rounded-full bg-neutral-950/70 text-amber-300 font-mono text-[11px] border border-amber-400/50 animate-pulse">
                    {t.btnAutoIn(autoDealCountdown)}
                  </span>
                )}
              </button>
              {autoDealCountdown !== null && onTogglePauseAutoDeal && (
                <button
                  type="button"
                  onClick={onTogglePauseAutoDeal}
                  className="text-[11px] text-amber-300/80 hover:text-amber-200 underline cursor-pointer"
                >
                  {isAutoDealPaused ? t.btnResumeAuto : t.btnPauseAuto}
                </button>
              )}
            </div>
          )}

          {isMatchOver && onRestartMatch && (
            <button
              type="button"
              onClick={onRestartMatch}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-cinzel font-bold text-xs uppercase rounded-xl border border-amber-200 shadow-md cursor-pointer transition-all"
            >
              {t.btnStartNewMatch}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-amber-200 font-cinzel text-xs rounded-xl border border-amber-700/50 cursor-pointer transition-colors"
          >
            {t.btnReviewTable}
          </button>
        </div>
      </div>
    </div>
  );
};
