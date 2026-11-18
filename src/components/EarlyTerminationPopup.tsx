import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { EarlyTerminationNotification } from '../types/game';
import { RulebookLanguage } from '../utils/firstTimeUser';

interface EarlyTerminationPopupProps {
  isOpen: boolean;
  notification: EarlyTerminationNotification | null;
  onClose: () => void;
  language?: RulebookLanguage;
}

function getLocalizedCopy(
  notification: EarlyTerminationNotification,
  language: RulebookLanguage
): {
  title: string;
  message: string;
  teamALabel: string;
  teamBLabel: string;
  metLabel: string;
  failedLabel: (needed: number) => string;
  remainingLabel: (remaining: number, played: number) => string;
  btnOkay: string;
  closeLabel: string;
} {
  if (language === 'hi') {
    const teamA = 'टीम A (आप व हृदय)';
    const teamB = 'टीम B (शीला व मैना)';
    let title = 'अनुबंध परिणाम तय हो गया!';
    let message =
      notification.team1Status === 'succeeded'
        ? 'टीम A ने अपनी बोली पूरी कर ली है। टीम B अपना अनुबंध पूरा नहीं कर सकती।'
        : 'टीम B ने अपनी बोली पूरी कर ली है। टीम A अपना अनुबंध पूरा नहीं कर सकती।';

    if (notification.caseType === 'both_failed') {
      title = 'दोनों टीमें अपनी बोली पूरी करने में विफल रहीं!';
      message = 'शेष बचे हाथों से कोई भी टीम अपना अनुबंध पूरा नहीं कर सकती।';
    } else if (notification.caseType === 'team_b_failed') {
      title = 'टीम B अपनी बोली पूरी नहीं कर सकती!';
      message = 'टीम A ने पर्याप्त हाथ जीतकर टीम B का अनुबंध असंभव बना दिया है।';
    } else if (notification.caseType === 'team_a_failed') {
      title = 'टीम A अपनी बोली पूरी नहीं कर सकती!';
      message = 'टीम B ने पर्याप्त हाथ जीतकर टीम A का अनुबंध असंभव बना दिया है।';
    }

    return {
      title,
      message,
      teamALabel: teamA,
      teamBLabel: teamB,
      metLabel: 'सफल',
      failedLabel: (needed) => `विफल · ${needed} और चाहिए`,
      remainingLabel: (rem, played) => `शेष हाथ: ${rem} · खेले गए: ${played}/13`,
      btnOkay: 'ठीक है',
      closeLabel: 'बंद करें',
    };
  }

  if (language === 'or') {
    const teamA = 'ଟିମ୍ A (ଆପଣ ଓ ହୃଦୟ)';
    const teamB = 'ଟିମ୍ B (ଶୀଳା ଓ ମୈନା)';
    let title = 'ଚୁକ୍ତି ଫଳାଫଳ ସ୍ଥିର ହୋଇଛି!';
    let message =
      notification.team1Status === 'succeeded'
        ? 'ଟିମ୍ A ନିଜ ଡାକ ପୂରଣ କରିଛି। ଟିମ୍ B ନିଜ ଚୁକ୍ତି ପୂରଣ କରିପାରିବ ନାହିଁ।'
        : 'ଟିମ୍ B ନିଜ ଡାକ ପୂରଣ କରିଛି। ଟିମ୍ A ନିଜ ଚୁକ୍ତି ପୂରଣ କରିପାରିବ ନାହିଁ।';

    if (notification.caseType === 'both_failed') {
      title = 'ଉଭୟ ଟିମ୍ ନିଜ ଡାକରେ ବିଫଳ ହୋଇଛନ୍ତି!';
      message = 'ବାକି ଥିବା ହାତରେ କୌଣସି ଟିମ୍ ନିଜ ଚୁକ୍ତି ପୂରଣ କରିପାରିବେ ନାହିଁ।';
    } else if (notification.caseType === 'team_b_failed') {
      title = 'ଟିମ୍ B ନିଜ ଡାକ ପୂରଣ କରିପାରିବ ନାହିଁ!';
      message = 'ଟିମ୍ A ପର୍ଯ୍ୟାପ୍ତ ହାତ ଜିତି ଟିମ୍ B ର ଚୁକ୍ତି ଅସମ୍ଭବ କରିଦେଇଛି।';
    } else if (notification.caseType === 'team_a_failed') {
      title = 'ଟିମ୍ A ନିଜ ଡାକ ପୂରଣ କରିପାରିବ ନାହିଁ!';
      message = 'ଟିମ୍ B ପର୍ଯ୍ୟାପ୍ତ ହାତ ଜିତି ଟିମ୍ A ର ଚୁକ୍ତି ଅସମ୍ଭବ କରିଦେଇଛି।';
    }

    return {
      title,
      message,
      teamALabel: teamA,
      teamBLabel: teamB,
      metLabel: 'ସଫଳ',
      failedLabel: (needed) => `ବିଫଳ · ଆଉ ${needed} ଦରକାର`,
      remainingLabel: (rem, played) => `ବାକି ହାତ: ${rem} · ଖେଳାଯାଇଛି: ${played}/13`,
      btnOkay: 'ଠିକ୍ ଅଛି',
      closeLabel: 'ବନ୍ଦ କରନ୍ତୁ',
    };
  }

  return {
    title: notification.title,
    message: notification.message,
    teamALabel: 'Team A (You & Hriday)',
    teamBLabel: 'Team B (Shilaa & Mainaa)',
    metLabel: 'Fulfilled',
    failedLabel: (needed) => `Failed · Needs ${needed} more`,
    remainingLabel: (rem, played) => `Remaining tricks: ${rem} · Trick ${played} of 13`,
    btnOkay: 'Okay',
    closeLabel: 'Cancel',
  };
}

export const EarlyTerminationPopup: React.FC<EarlyTerminationPopupProps> = ({
  isOpen,
  notification,
  onClose,
  language = 'en',
}) => {
  if (!isOpen || !notification) return null;

  const copy = getLocalizedCopy(notification, language);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none animate-fade-in"
    >
      <div className="relative w-full max-w-[340px] sm:max-w-sm rounded-2xl bg-gradient-to-b from-[#2B150C] via-[#1C0D07] to-[#120703] border-2 border-amber-500/80 p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.88)] text-center text-amber-100 overflow-hidden">
        {/* Corner accents matching ReshufflePopup */}
        <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-400/80 rounded-tl pointer-events-none" />
        <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-400/80 rounded-tr pointer-events-none" />
        <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-400/80 rounded-bl pointer-events-none" />
        <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400/80 rounded-br pointer-events-none" />

        {/* Cancel (Close) Icon Button */}
        <button
          type="button"
          onClick={onClose}
          title={copy.closeLabel}
          aria-label={copy.closeLabel}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-neutral-900/85 hover:bg-neutral-800 text-amber-300/85 hover:text-amber-100 border border-amber-800/60 flex items-center justify-center cursor-pointer transition-colors"
        >
          <X size={15} />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-1.5 px-7 min-w-0">
          <AlertTriangle size={17} className="text-amber-400 flex-shrink-0" aria-hidden="true" />
          <h3 className="font-cinzel text-sm sm:text-base font-bold text-amber-300 leading-snug break-words">
            {copy.title}
          </h3>
        </div>

        {/* Explanation Message */}
        <p className="text-xs sm:text-[13px] text-amber-100/90 font-outfit leading-relaxed mb-3 break-words">
          {copy.message}
        </p>

        {/* Compact Contract Breakdown */}
        <div className="rounded-xl bg-neutral-950/60 border border-amber-800/45 divide-y divide-amber-900/35 text-left text-xs font-outfit mb-2.5">
          {/* Team A */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 min-w-0">
            <span className="text-amber-100 font-medium truncate">{copy.teamALabel}</span>
            <div className="flex items-center gap-2 flex-shrink-0 font-mono tabular-nums">
              <span className="text-amber-200 font-bold">
                {notification.team1TricksWon}/{notification.team1Bid}
              </span>
              <span
                className={
                  notification.team1Status === 'succeeded'
                    ? 'text-emerald-400 font-sans font-medium'
                    : 'text-rose-400 font-sans font-medium'
                }
              >
                {notification.team1Status === 'succeeded'
                  ? copy.metLabel
                  : copy.failedLabel(notification.team1TricksNeeded)}
              </span>
            </div>
          </div>

          {/* Team B */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 min-w-0">
            <span className="text-amber-100 font-medium truncate">{copy.teamBLabel}</span>
            <div className="flex items-center gap-2 flex-shrink-0 font-mono tabular-nums">
              <span className="text-amber-200 font-bold">
                {notification.team2TricksWon}/{notification.team2Bid}
              </span>
              <span
                className={
                  notification.team2Status === 'succeeded'
                    ? 'text-emerald-400 font-sans font-medium'
                    : 'text-rose-400 font-sans font-medium'
                }
              >
                {notification.team2Status === 'succeeded'
                  ? copy.metLabel
                  : copy.failedLabel(notification.team2TricksNeeded)}
              </span>
            </div>
          </div>
        </div>

        {/* Unboxed Remaining Tricks Metadata */}
        <div className="text-[11px] text-amber-300/80 font-outfit mb-3">
          <span className="font-mono tabular-nums">
            {copy.remainingLabel(notification.remainingTricks, notification.tricksPlayed)}
          </span>
        </div>

        {/* Okay Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] px-7 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-cinzel font-black text-xs uppercase tracking-wider border border-amber-200 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {copy.btnOkay}
          </button>
        </div>
      </div>
    </div>
  );
};
