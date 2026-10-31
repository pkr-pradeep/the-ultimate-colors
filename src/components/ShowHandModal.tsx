import React, { useState, useEffect } from 'react';
import { Card, GameState } from '../types/game';
import { evaluateShowHand, verifyUserSelectedCards, ShowHandSelectionVerification } from '../engine/showHand';
import { CardView } from './CardView';
import {
  ShieldAlert,
  Award,
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Check,
  Wand2,
} from 'lucide-react';
import { RulebookLanguage, getSavedRulebookLanguage, saveRulebookLanguage } from '../utils/firstTimeUser';
import { LanguageSelector } from './LanguageSelector';
import { MODAL_TRANSLATIONS } from '../data/modalTranslations';

interface ShowHandModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onConfirmClaim: (selectedCardIds?: string[]) => void;
  language?: RulebookLanguage;
  onLanguageChange?: (lang: RulebookLanguage) => void;
}

export const ShowHandModal: React.FC<ShowHandModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onConfirmClaim,
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

  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'select' | 'verified'>('select');
  const [verificationResult, setVerificationResult] = useState<ShowHandSelectionVerification | null>(null);

  const team1 = gameState.partnerships.team1;
  const team2 = gameState.partnerships.team2;
  const neededTricks = Math.max(0, team1.totalBid - team1.tricksWon);

  const southPlayer = gameState.players.south;
  const northPlayer = gameState.players.north;

  // Reset or initialize when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedCardIds([]);
      setViewMode('select');
      setVerificationResult(null);
    }
  }, [isOpen, gameState.handNumber, gameState.trickNumber]);

  if (!isOpen) return null;

  const activeLang = controlledLang || localLang;
  const t = (MODAL_TRANSLATIONS[activeLang] || MODAL_TRANSLATIONS.en).showHand;

  const handleLangChange = (lang: RulebookLanguage) => {
    setLocalLang(lang);
    saveRulebookLanguage(lang);
    onLanguageChange?.(lang);
  };

  const analysis = evaluateShowHand(gameState);

  const toggleCardSelection = (cardId: string) => {
    setSelectedCardIds(prev =>
      prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
    );
  };

  const handleAutoSelectBest = () => {
    // Select top guaranteed winners up to needed tricks
    const bestIds = analysis.guaranteedWinningCards
      .slice(0, neededTricks)
      .map(item => item.card.id);

    // If fewer than neededTricks guaranteed, also fill with highest remaining south cards
    if (bestIds.length < neededTricks) {
      const remainingSouthCards = southPlayer.hand
        .filter(c => !bestIds.includes(c.id))
        .sort((a, b) => b.value - a.value);
      for (const card of remainingSouthCards) {
        if (bestIds.length >= neededTricks) break;
        bestIds.push(card.id);
      }
    }

    setSelectedCardIds(bestIds);
  };

  const handleClearSelection = () => {
    setSelectedCardIds([]);
  };

  const handleVerifyClick = () => {
    const result = verifyUserSelectedCards(gameState, selectedCardIds);
    setVerificationResult(result);
    setViewMode('verified');
  };

  const handleConclude = () => {
    onConfirmClaim(selectedCardIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in font-outfit">
      <div className="w-full max-w-2xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-amber-600/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-amber-950/90 via-neutral-900 to-amber-950/90 border-b border-amber-700/50 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-inner flex-shrink-0">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cinzel text-lg sm:text-xl font-bold text-amber-200">
                  {t.title}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 font-cinzel">
                  {t.claimBadge}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-amber-400/80 font-outfit">
                {t.headerDesc(team2.tricksWon, team2.totalBid, neededTricks)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSelector
              currentLanguage={activeLang}
              onSelectLanguage={handleLangChange}
              size="xs"
              showIcon
            />
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 font-outfit text-neutral-200">
          {/* Partnership Status Bar */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-600/40 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-cinzel text-emerald-400 font-bold">
                  {t.team1Label}
                </span>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {t.team1TricksWon(team1.tricksWon, team1.totalBid)}
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-emerald-800/40 flex items-center justify-between">
                <span className="text-[11px] text-emerald-300">{t.targetToWin}</span>
                <span className="text-xs font-bold text-emerald-200 font-mono bg-emerald-900/60 px-2 py-0.5 rounded-lg border border-emerald-500/40">
                  {t.neededTricks(neededTricks)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-700 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-cinzel text-amber-400 font-bold">
                  {t.team2Label}
                </span>
                <div className="text-base sm:text-lg font-bold text-amber-200 mt-0.5">
                  {t.team2TricksWon(team2.tricksWon, team2.totalBid)}
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">{t.team2Status}</span>
                <span className="text-xs font-bold text-amber-300 font-cinzel">
                  {t.contractMet}
                </span>
              </div>
            </div>
          </div>

          {/* VIEW MODE 1: SELECTION */}
          {viewMode === 'select' && (
            <>
              {/* Instructions Bar */}
              <div className="p-3.5 rounded-2xl bg-neutral-900/90 border border-amber-600/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 flex-shrink-0">
                    <Check size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold font-cinzel text-amber-200">
                      {t.step1Title}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {t.step1Desc(neededTricks)}
                    </div>
                  </div>
                </div>

                {/* Live Counter Badge */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <div
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 ${
                      selectedCardIds.length === neededTricks
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : selectedCardIds.length > neededTricks
                        ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                        : 'bg-neutral-800/80 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    <span>{t.selectedLabel}</span>
                    <span className="text-sm">
                      {selectedCardIds.length} / {neededTricks}
                    </span>
                    {selectedCardIds.length === neededTricks && (
                      <span className="text-emerald-400 text-xs">{t.readyLabel}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions (Auto-select / Clear) */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="text-[11px] text-neutral-400 italic">
                  {t.tip}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoSelectBest}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[11px] font-cinzel font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Wand2 size={13} />
                    <span>{t.btnAutoSelect}</span>
                  </button>
                  {selectedCardIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-[11px] font-outfit cursor-pointer transition-all"
                    >
                      {t.btnClear}
                    </button>
                  )}
                </div>
              </div>

              {/* Cards Grid: South Hand */}
              <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                <div className="text-xs font-cinzel text-amber-300 font-bold uppercase flex items-center justify-between">
                  <span>{t.yourHandTitle}</span>
                  <span className="text-[10px] text-neutral-400 font-normal">
                    {t.remainingCards(southPlayer.hand.length)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {southPlayer.hand.map(card => {
                    const isSelected = selectedCardIds.includes(card.id);
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => toggleCardSelection(card.id)}
                        className={`relative rounded-xl p-0.5 transition-all transform cursor-pointer ${
                          isSelected
                            ? 'ring-3 ring-amber-400 shadow-xl shadow-amber-500/40 -translate-y-1 scale-105'
                            : 'hover:-translate-y-0.5 hover:ring-1 hover:ring-neutral-600 opacity-90'
                        }`}
                      >
                        <CardView card={card} size="sm" />
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center text-[10px] font-black shadow-md border border-white">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cards Grid: North Hand (Partner) */}
              {northPlayer.hand.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                  <div className="text-xs font-cinzel text-emerald-300 font-bold uppercase flex items-center justify-between">
                    <span>{t.partnerHandTitle}</span>
                    <span className="text-[10px] text-neutral-400 font-normal">
                      {t.remainingCards(northPlayer.hand.length)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {northPlayer.hand.map(card => {
                      const isSelected = selectedCardIds.includes(card.id);
                      return (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => toggleCardSelection(card.id)}
                          className={`relative rounded-xl p-0.5 transition-all transform cursor-pointer ${
                            isSelected
                              ? 'ring-3 ring-emerald-400 shadow-xl shadow-emerald-500/40 -translate-y-1 scale-105'
                              : 'hover:-translate-y-0.5 hover:ring-1 hover:ring-neutral-600 opacity-90'
                          }`}
                        >
                          <CardView card={card} size="sm" />
                          {isSelected && (
                            <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-400 text-black flex items-center justify-center text-[10px] font-black shadow-md border border-white">
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Penalty Notice Warning Box */}
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-600/50 flex items-start gap-3">
                <ShieldAlert className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-xs leading-relaxed">
                  <span className="font-cinzel font-bold text-amber-300 uppercase block mb-0.5">
                    {t.penaltyNoticeTitle}
                  </span>
                  <p className="text-neutral-300">
                    {t.penaltyNoticeDesc(team1.totalBid, team1.matchScore, team1.matchScore - team1.totalBid)}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* VIEW MODE 2: VERIFICATION RESULTS */}
          {viewMode === 'verified' && verificationResult && (
            <div className="space-y-4">
              {/* Result Banner */}
              <div
                className={`p-4 rounded-2xl border ${
                  verificationResult.isValid
                    ? 'bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-emerald-950/80 border-emerald-500 shadow-lg shadow-emerald-900/30'
                    : 'bg-gradient-to-r from-rose-950/80 via-rose-900/60 to-rose-950/80 border-rose-500 shadow-lg shadow-rose-900/30'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  {verificationResult.isValid ? (
                    <>
                      <CheckCircle2 className="text-emerald-400" size={24} />
                      <div>
                        <h3 className="font-cinzel text-base sm:text-lg font-bold text-emerald-200">
                          {t.verifiedPassedTitle}
                        </h3>
                        <p className="text-xs text-emerald-300/90 font-outfit">
                          {t.verifiedPassedSubtitle(verificationResult.neededTricks)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-rose-400" size={24} />
                      <div>
                        <h3 className="font-cinzel text-base sm:text-lg font-bold text-rose-200">
                          {t.verifiedFailedTitle}
                        </h3>
                        <p className="text-xs text-rose-300/90 font-outfit">
                          {t.verifiedFailedSubtitle}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-neutral-200 mt-2 bg-black/40 p-2.5 rounded-xl border border-white/10">
                  {verificationResult.summary}
                </p>
              </div>

              {/* Itemized Card Breakdown */}
              <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2.5">
                <span className="text-xs font-cinzel font-bold text-amber-300 uppercase tracking-wider block">
                  {t.itemizedTitle}
                </span>
                <div className="space-y-2">
                  {verificationResult.cardVerifications.map((item, idx) => {
                    const isPassed = item.status === 'passed';
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                          isPassed
                            ? 'bg-emerald-950/30 border-emerald-600/40 text-neutral-200'
                            : 'bg-rose-950/30 border-rose-600/40 text-neutral-200'
                        }`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {isPassed ? (
                            <CheckCircle2 size={16} className="text-emerald-400" />
                          ) : (
                            <XCircle size={16} className="text-rose-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-200 text-sm">
                              {item.card.shortName}
                            </span>
                            <span className="text-[10px] uppercase font-cinzel text-neutral-400">
                              ({item.playerId === 'south' ? t.youLabel : t.hridayLabel})
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase font-cinzel ${
                                isPassed
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {isPassed ? t.guaranteedWin : t.beatenFlawed}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                            {item.reason}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Score Impact Card */}
              <div className="p-3.5 rounded-2xl bg-neutral-900/90 border border-amber-600/40 text-xs">
                <span className="font-cinzel font-bold text-amber-300 uppercase block mb-1.5">
                  {t.scoreImpactTitle}
                </span>
                {verificationResult.isValid ? (
                  <div className="flex items-center justify-between text-emerald-300">
                    <span>{t.contractAwarded(verificationResult.successScoreGain)}</span>
                    <span className="font-mono font-bold text-sm">
                      {team1.matchScore} → {team1.matchScore + verificationResult.successScoreGain} pts
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-rose-300">
                    <span>
                      {t.penaltyApplied(verificationResult.penaltyPoints)}
                    </span>
                    <span className="font-mono font-bold text-sm">
                      {team1.matchScore} → {verificationResult.penaltyNewScore} pts
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-neutral-950 border-t border-amber-800/40 flex items-center justify-between gap-3">
          {viewMode === 'select' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-cinzel text-xs font-semibold cursor-pointer transition-all"
              >
                {t.btnCancelNormal}
              </button>

              <button
                type="button"
                disabled={selectedCardIds.length === 0}
                onClick={handleVerifyClick}
                className={`px-5 py-2.5 rounded-xl font-cinzel text-xs font-bold uppercase shadow-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCardIds.length >= neededTricks
                    ? 'bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white border border-amber-400'
                    : selectedCardIds.length > 0
                    ? 'bg-gradient-to-r from-amber-700 to-neutral-700 text-amber-200 border border-amber-600/50'
                    : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                }`}
              >
                <Sparkles size={14} />
                <span>
                  {t.btnVerifyCards(selectedCardIds.length, neededTricks)}
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setViewMode('select')}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-cinzel text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <RotateCcw size={14} />
                <span>{t.btnAdjustSelection}</span>
              </button>

              {verificationResult?.isValid ? (
                <button
                  type="button"
                  onClick={handleConclude}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400 font-cinzel text-xs font-bold uppercase shadow-lg flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Award size={15} />
                  <span>{t.btnClaimHand(verificationResult.successScoreGain)}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConclude}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-amber-700 hover:from-rose-600 hover:to-amber-600 text-white border border-rose-400 font-cinzel text-xs font-bold uppercase shadow-lg flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <AlertTriangle size={15} />
                  <span>{t.btnAcceptPenalty(verificationResult?.penaltyPoints || 0)}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
