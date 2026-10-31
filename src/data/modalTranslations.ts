import { RulebookLanguage } from '../utils/firstTimeUser';

export interface ScoreboardTranslations {
  titleSummary: (handNumber: number) => string;
  titleFinal: string;
  tieTitle: string;
  championTitle: (teamName: string) => string;
  subtitle: string;
  targetDefault: string;
  targetCustom: (pts: number) => string;
  targetTime: string;
  scoringMatrix: string;
  colPartnership: string;
  colIndividualBids: string;
  colTeamBid: string;
  colTricksWon: string;
  colHandResult: string;
  colMatchPoints: string;
  team1Label: string;
  team1Seats: string;
  team2Label: string;
  team2Seats: string;
  bostonSweep: string;
  metContract: (pts: number) => string;
  failedContract: (pts: number) => string;
  rulePoint1: string;
  rulePoint2: string;
  rulePoint3: string;
  rulePoint4: string;
  btnDealNext: string;
  btnAutoIn: (s: number) => string;
  btnResumeAuto: string;
  btnPauseAuto: string;
  btnStartNewMatch: string;
  btnReviewTable: string;
}

export interface MatchConfigTranslations {
  badge: string;
  title: string;
  subtitle: string;
  defaultModeTitle: string;
  defaultModeDesc: string;
  customModeTitle: string;
  customModeDesc: string;
  targetPointsLabel: string;
  timeModeTitle: string;
  timeModeDesc: string;
  durationLabel: string;
  btnApply: string;
  btnCancel: string;
}

export interface TacticsTranslations {
  badge: string;
  title: string;
  subtitle: string;
  noviceTitle: string;
  noviceBadge: string;
  noviceSubtitle: string;
  noviceDesc: string;
  noviceUnveiled: string[];
  noviceLocked: string[];
  masterTitle: string;
  masterBadge: string;
  masterSubtitle: string;
  masterDesc: string;
  masterUnveiled: string[];
  masterLocked: string[];
  legendTitle: string;
  legendBadge: string;
  legendSubtitle: string;
  legendDesc: string;
  legendUnveiled: string[];
  unveiledTricksHeader: string;
  activeBtn: string;
  selectBtn: string;
  activeModeLabel: string;
  applyBtn: string;
}

export interface TrumpInspectTranslations {
  badge: string;
  title: string;
  subtitle: (suit: string) => string;
  description: (suit: string) => string;
  btnClose: string;
}

export interface ShowHandTranslations {
  title: string;
  claimBadge: string;
  headerDesc: (won: number, bid: number, needed: number) => string;
  team1Label: string;
  team1TricksWon: (won: number, bid: number) => string;
  targetToWin: string;
  neededTricks: (needed: number) => string;
  team2Label: string;
  team2TricksWon: (won: number, bid: number) => string;
  team2Status: string;
  contractMet: string;
  step1Title: string;
  step1Desc: (needed: number) => string;
  selectedLabel: string;
  readyLabel: string;
  tip: string;
  btnAutoSelect: string;
  btnClear: string;
  yourHandTitle: string;
  remainingCards: (count: number) => string;
  partnerHandTitle: string;
  penaltyNoticeTitle: string;
  penaltyNoticeDesc: (bid: number, currentScore: number, newScore: number) => string;
  verifiedPassedTitle: string;
  verifiedPassedSubtitle: (needed: number) => string;
  verifiedFailedTitle: string;
  verifiedFailedSubtitle: string;
  itemizedTitle: string;
  youLabel: string;
  hridayLabel: string;
  guaranteedWin: string;
  beatenFlawed: string;
  scoreImpactTitle: string;
  contractAwarded: (pts: number) => string;
  penaltyApplied: (pts: number) => string;
  btnCancelNormal: string;
  btnVerifyCards: (selected: number, needed: number) => string;
  btnAdjustSelection: string;
  btnClaimHand: (pts: number) => string;
  btnAcceptPenalty: (pts: number) => string;
}

export interface TestRunnerTranslations {
  badge: string;
  title: (passed: number, total: number) => string;
  subtitle: string;
  btnRerun: string;
  allPassedBanner: string;
  failedBanner: (failed: number) => string;
  percentPassed: (passed: number, total: number) => string;
  passBadge: string;
  failBadge: string;
  btnClose: string;
}

export interface ModalTranslations {
  scoreboard: ScoreboardTranslations;
  matchConfig: MatchConfigTranslations;
  tactics: TacticsTranslations;
  trumpInspect: TrumpInspectTranslations;
  showHand: ShowHandTranslations;
  testRunner: TestRunnerTranslations;
}

export const MODAL_TRANSLATIONS: Record<RulebookLanguage, ModalTranslations> = {
  en: {
    scoreboard: {
      titleSummary: (n) => `Hand ${n} Summary`,
      titleFinal: 'Match Final Standings',
      tieTitle: 'Match Concluded: Royal Tie!',
      championTitle: (name) => `Champion: ${name}!`,
      subtitle: 'Partnership Scoreboard',
      targetDefault: 'Target: 100 Points',
      targetCustom: (pts) => `Target: ${pts} Points`,
      targetTime: 'Time Mode Tournament',
      scoringMatrix: 'Official Playbook Scoring Matrix',
      colPartnership: 'Partnership',
      colIndividualBids: 'Bids (Indiv)',
      colTeamBid: 'Team Bid',
      colTricksWon: 'Tricks Won',
      colHandResult: 'Hand Result',
      colMatchPoints: 'Match Points',
      team1Label: 'Team 1 (Aadesh & Hriday)',
      team1Seats: 'South & North',
      team2Label: 'Team 2 (Shilaa & Mainaa)',
      team2Seats: 'West & East',
      bostonSweep: '★ Boston Sweep',
      metContract: (pts) => `Met (+${pts})`,
      failedContract: (pts) => `Failed (-${pts})`,
      rulePoint1: 'Bids 2–9 Met: Exactly +bid points. (Overtricks award 0).',
      rulePoint2: 'High Bids 10–13 Met: Double the bid (+2x bid points).',
      rulePoint3: 'Failed Contract: Exactly -bid points deducted.',
      rulePoint4: 'Boston Sweep: Winning all 13 tricks doubles the partnership score for the hand.',
      btnDealNext: 'Deal Next Hand',
      btnAutoIn: (s) => `Auto in ${s}s`,
      btnResumeAuto: '▶ Resume Auto-Deal',
      btnPauseAuto: '⏸ Pause Auto-Deal',
      btnStartNewMatch: 'Start New Royal Match',
      btnReviewTable: 'Review Table',
    },
    matchConfig: {
      badge: 'Match Setup',
      title: 'Select Match Mode',
      subtitle: 'Choose the authoritative tournament format defined in the playbook',
      defaultModeTitle: 'Default Point Mode (100 Points)',
      defaultModeDesc: 'The first partnership to reach or exceed 100 points wins the royal match.',
      customModeTitle: 'Custom Point Mode',
      customModeDesc: 'Set a specific victory threshold for faster or longer tournament play.',
      targetPointsLabel: 'Target Points:',
      timeModeTitle: 'Time Mode (Live Timer)',
      timeModeDesc: 'Play hands until duration expires. Any ongoing hand completes fully before declaring winner.',
      durationLabel: 'Duration (Minutes):',
      btnApply: 'Apply & Restart Match',
      btnCancel: 'Cancel',
    },
    tactics: {
      badge: 'Tactical Intelligence Settings',
      title: 'Player Intelligence Modes',
      subtitle: 'Choose how players think and execute moves. Intelligent tricks are unveiled progressively across Novice, Master, and Legend tiers.',
      noviceTitle: 'Novice',
      noviceBadge: 'Level 1 · Basic Play',
      noviceSubtitle: 'Straightforward Card Play',
      noviceDesc: 'Ideal for relaxed play. Players follow suit directly without complex card memory or calculated traps.',
      noviceUnveiled: [
        'Strict Rule Compliance: Follows led suit when able',
        'Standard Card Discards: Plays lowest losing card when unable to win',
        'Direct Trick Wins: Plays lowest winning card when available',
        'Basic Joker: Kept for emergencies or played off-suit',
      ],
      noviceLocked: [
        'No Card Memory or Void Tracking',
        'No Partner Protection (may accidentally compete with partner)',
        'No King-Rescue Strike',
        'No Trump-Ace Decapitation',
      ],
      masterTitle: 'Master',
      masterBadge: 'Level 2 · Experienced Play',
      masterSubtitle: 'Honor Conservation & Partner Teamwork',
      masterDesc: 'Unveils disciplined partnership play, preventing wasteful blunders and timing high cards.',
      masterUnveiled: [
        '🛡️ Partner Protection: Never overtakes partner\'s winning trick with valuable honors',
        '⏰ Trick 12 Joker Mandate: Cashes the Joker before Trick 13 devaluation into 2 of Spades',
        '🦆 Ducking with 2nd-Best Honors: Protects Kings from walking into unplayed Aces',
        '👑 Basic Ace Cashing: Leads side Aces early before opponents create voids',
        '⚔️ Over-Trumping Defense: Over-trumps weak opponent ruffs',
      ],
      masterLocked: [
        'No Full Void Matrix Memory (does not track who showed void in every suit)',
        'No King-Rescue Strike (does not use Joker to save trapped King)',
        'No Trump-Ace Decapitation',
      ],
      legendTitle: 'Legend',
      legendBadge: 'Level 3 · Grandmaster Engine',
      legendSubtitle: 'Calculated Gambits & Dynamic Memory Engine',
      legendDesc: 'Calculated risks, aggressive stretch bidding, psychological traps, and complete 4-registry card memory. The ultimate trick-taking experience.',
      legendUnveiled: [
        '🧠 4-Registry Memory Engine: Remembers all 4 Aces, Kings, Queens, Jacks, and trumps in play',
        '⚔️ Calculated 10-Bid Contract Push: Pushes combined bid to 10 (+20 bonus hunting) when ceiling allows',
        '🔥 Calculated Comeback Gambits: Stretches bids by +1 when trailing to force dramatic match swings',
        '🎲 Calculated Under-lead Finesse: Leads low from Ace-Queen holdings to trap opponent honors',
        '⚔️ Calculated Trump Extraction: Bleeds out opponent trumps with dominant holdings to shield side Bosses',
        '🧊 Calculated Smooth Tenace Duck: Ducks low on opponent Queen/Jack to trap them into an Ace-King fortress',
        '👑 King-Rescue Strike: When opponent drops an Ace over player\'s King, fires the Joker to save the King as Boss!',
        '⚡ Trump-Ace Decapitation: Slams the Dadaji Joker on opponent\'s Trump Ace for maximum momentum swing',
        '💥 Calculated Boston Interception: Unleashes highest weapons to halt an opponent sweep in its tracks',
        '🎯 Feeding Partner\'s Void: Remembers partner\'s void suits and leads low cards for partner to ruff',
      ],
      unveiledTricksHeader: '★ Unveiled Intelligent Tricks:',
      activeBtn: 'Active',
      selectBtn: 'Select',
      activeModeLabel: 'Active Mode:',
      applyBtn: 'Apply & Play',
    },
    trumpInspect: {
      badge: '13th Final Dealt Card',
      title: 'The Ruling Trump Suit',
      subtitle: (suit) => `Determined by the final card dealt: ${suit}`,
      description: (suit) => `All cards of suit ${suit} will trump standard leads in this round! (Unless Dadaji Joker is played).`,
      btnClose: 'Close Inspection',
    },
    showHand: {
      title: 'Show Hand & Verify',
      claimBadge: 'Interactive Claim',
      headerDesc: (won, bid, needed) => `Opponents fulfilled their bid (${won}/${bid}). Select cards to prove your remaining ${needed} trick(s)!`,
      team1Label: 'Team 1 (Your Team)',
      team1TricksWon: (won, bid) => `${won} of ${bid} Tricks Won`,
      targetToWin: 'Target to win:',
      neededTricks: (n) => `${n} trick(s) needed`,
      team2Label: 'Team 2 (Opponents)',
      team2TricksWon: (won, bid) => `${won} of ${bid} Tricks Won`,
      team2Status: 'Status:',
      contractMet: 'Contract Met ✓',
      step1Title: 'Step 1: Select Your Claim Cards',
      step1Desc: (needed) => `Click cards below that you claim will win the remaining ${needed} trick(s).`,
      selectedLabel: 'Selected:',
      readyLabel: '✓ Ready',
      tip: 'Tip: Dadaji Joker & high trumps guarantee tricks.',
      btnAutoSelect: 'Auto-Select Best',
      btnClear: 'Clear',
      yourHandTitle: 'Your Hand (South) — Click to Select',
      remainingCards: (count) => `${count} card(s) remaining`,
      partnerHandTitle: "Partner's Hand (North - Hriday)",
      penaltyNoticeTitle: 'Strict Show Hand Rule Penalty',
      penaltyNoticeDesc: (bid, current, next) => `If your selected cards fail verification against opponents' holdings, your match score will suffer the penalty of: Total Score − Current Bid (-${bid} points: ${current} → ${next}).`,
      verifiedPassedTitle: 'VERIFICATION PASSED — 100% UNASSAILABLE',
      verifiedPassedSubtitle: (needed) => `All ${needed} trick(s) are guaranteed winners.`,
      verifiedFailedTitle: 'VERIFICATION FAILED — FLAWED CLAIM',
      verifiedFailedSubtitle: "Opponents hold cards that defeat your selection.",
      itemizedTitle: 'Detailed Card-by-Card Verification:',
      youLabel: 'You',
      hridayLabel: 'Hriday',
      guaranteedWin: 'Guaranteed Win',
      beatenFlawed: 'Beaten / Flawed',
      scoreImpactTitle: 'Score Impact If Concluded:',
      contractAwarded: (pts) => `Contract Awarded (+${pts} pts):`,
      penaltyApplied: (pts) => `Rule Penalty (Total Score − Current Bid of ${pts}):`,
      btnCancelNormal: 'Cancel & Play Normally',
      btnVerifyCards: (sel, need) => `Verify Selected Cards (${sel}/${need})`,
      btnAdjustSelection: 'Adjust Card Selection',
      btnClaimHand: (pts) => `Claim Hand (+${pts} pts)`,
      btnAcceptPenalty: (pts) => `Accept Penalty (-${pts} pts)`,
    },
    testRunner: {
      badge: 'Authoritative Playbook Verification',
      title: (passed, total) => `Automated Game Engine Tests (${passed} / ${total})`,
      subtitle: 'Verified against Section 15 of Universal Joker Playbook specifications',
      btnRerun: 'Re-run Tests',
      allPassedBanner: 'All Automated Playbook Tests Passed',
      failedBanner: (f) => `${f} Tests Failed`,
      percentPassed: (p, t) => `${p} / ${t} Passed (100%)`,
      passBadge: 'PASS',
      failBadge: 'FAIL',
      btnClose: 'Close Test Viewer',
    },
  },
  hi: {
    scoreboard: {
      titleSummary: (n) => `हाथ संख्या ${n} सारांश`,
      titleFinal: 'प्रतियोगिता का अंतिम परिणाम',
      tieTitle: 'मुकाबला बराबरी पर समाप्त (टाई)!',
      championTitle: (name) => `शाही विजेता: ${name}!`,
      subtitle: 'साझेदारी स्कोरकार्ड (Partnership Scoreboard)',
      targetDefault: 'लक्ष्य: 100 अंक',
      targetCustom: (pts) => `लक्ष्य: ${pts} अंक`,
      targetTime: 'समय आधारित टूर्नामेंट मोड',
      scoringMatrix: 'आधिकारिक नियम पुस्तिका स्कोरिंग तालिका',
      colPartnership: 'साझेदारी (टीम)',
      colIndividualBids: 'व्यक्तिगत बोली',
      colTeamBid: 'कुल बोली',
      colTricksWon: 'जीते गए हाथ',
      colHandResult: 'हाथ परिणाम',
      colMatchPoints: 'मैच अंक',
      team1Label: 'टीम 1 (आदेश और हृदय)',
      team1Seats: 'दक्षिण और उत्तर',
      team2Label: 'टीम 2 (शीला और मैना)',
      team2Seats: 'पश्चिम और पूर्व',
      bostonSweep: '★ बोस्टन स्वीप (13 हाथ)',
      metContract: (pts) => `बोली सफल (+${pts})`,
      failedContract: (pts) => `विफल (-${pts})`,
      rulePoint1: 'बोली 2–9 सफल: सटीक +बोली अंक (अतिरिक्त हाथ का 0 अंक)।',
      rulePoint2: 'उच्च बोली 10–13 सफल: बोली का दोगुना अंक (+2x बोली)।',
      rulePoint3: 'विफल अनुबंध: बोली के बराबर अंक काटे जाएंगे (-बोली)।',
      rulePoint4: 'बोस्टन स्वीप: सभी 13 हाथ जीतने पर उस राउंड का स्कोर दोगुना हो जाता है।',
      btnDealNext: 'अगला हाथ बांटें',
      btnAutoIn: (s) => `${s} सेकंड में स्वतः`,
      btnResumeAuto: '▶ स्वतः खेल जारी रखें',
      btnPauseAuto: '⏸ स्वतः खेल रोकें',
      btnStartNewMatch: 'नया मुकाबला शुरू करें',
      btnReviewTable: 'टेबल का जायजा लें',
    },
    matchConfig: {
      badge: 'मैच सेटिंग्स',
      title: 'मुकाबला प्रारूप चुनें',
      subtitle: 'आधिकारिक नियम पुस्तिका द्वारा निर्धारित टूर्नामेंट प्रारूप चुनें',
      defaultModeTitle: 'मानक अंक मोड (100 अंक)',
      defaultModeDesc: 'पहले 100 अंक तक पहुंचने वाली टीम शाही विजेता बनती है।',
      customModeTitle: 'कस्टम अंक मोड',
      customModeDesc: 'अपनी पसंद के अनुसार छोटे या लंबे मुकाबले के लिए लक्ष्य अंक तय करें।',
      targetPointsLabel: 'लक्ष्य अंक:',
      timeModeTitle: 'समय मोड (लाइव टाइमर)',
      timeModeDesc: 'निर्धारित समय समाप्त होने तक खेलें। समय खत्म होने पर जारी हाथ पूरा खेला जाएगा।',
      durationLabel: 'समय (मिनट):',
      btnApply: 'लागू करें और नया मैच खेलें',
      btnCancel: 'रद्द करें',
    },
    tactics: {
      badge: 'रणनीतिक बुद्धिमत्ता सेटिंग्स',
      title: 'खिलाड़ी बुद्धिमत्ता स्तर (AI Intelligence)',
      subtitle: 'खिलाड़ी कैसे सोचेंगे और चालें चलेंगे चुनें। नौसिखिया, माहिर और लीजेंड स्तरों पर विशेष चालें खुलती हैं।',
      noviceTitle: 'नौसिखिया (Novice)',
      noviceBadge: 'स्तर 1 · बुनियादी खेल',
      noviceSubtitle: 'सरल एवं सीधा खेल',
      noviceDesc: 'आरामदायक खेल के लिए आदर्श। जटिल कार्ड गणना या चालों के बिना साधारण चालें।',
      noviceUnveiled: [
        'कड़े नियम का पालन: रंग होने पर वही रंग चलना',
        'साधारण पत्ता फेंकना: न जीत पाने पर सबसे छोटा पत्ता डालना',
        'सीधे हाथ जीतना: उपलब्ध न्यूनतम विजयी पत्ता चलना',
        'बुनियादी जोकर: संकट के समय या दूसरा रंग न होने पर चलना',
      ],
      noviceLocked: [
        'पत्तों की याददाश्त या वॉयड ट्रैकिंग नहीं',
        'साझेदार की सुरक्षा नहीं',
        'बादशाह बचाव दांव नहीं',
        'तुरुप इक्का खात्मा नहीं',
      ],
      masterTitle: 'माहिर (Master)',
      masterBadge: 'स्तर 2 · अनुभवी खेल',
      masterSubtitle: 'बड़े पत्तों की बचत और साझेदार का साथ',
      masterDesc: 'अनुशासित साझेदारी, बड़े पत्तों की सही समय पर चाल और अपने साथी को सुरक्षित रखना।',
      masterUnveiled: [
        '🛡️ साझेदार की रक्षा: साथी के विजयी हाथ पर व्यर्थ बड़ा पत्ता नहीं डालता',
        '⏰ 12वें हाथ का जोकर नियम: 13वें हाथ में हुकुम दो बनने से पहले जोकर चलना',
        '🦆 बादशाह का बचाव: इक्के के सामने बादशाह को व्यर्थ जाने से बचाना',
        '👑 इक्के की सही चाल: विरोधी के तुरुप काटने से पहले बाहरी इक्के से हाथ लेना',
        '⚔️ ऊपर से तुरुप काटना: विरोधी के कमजोर तुरुप पर भारी तुरुप चलना',
      ],
      masterLocked: [
        'पूर्ण 4-रजिस्ट्री कार्ड मेमोरी नहीं',
        'जोकर से बादशाह बचाव नहीं',
        'तुरुप इक्का खात्मा नहीं',
      ],
      legendTitle: 'लीजेंड (Legend)',
      legendBadge: 'स्तर 3 · ग्रैंडमास्टर इंजन',
      legendSubtitle: 'सटीक जोखिम और 4-रजिस्ट्री कार्ड मेमोरी',
      legendDesc: 'सटीक गणना, साहसिक बोलियां, मनोवैज्ञानिक जाल और फेंके गए सभी पत्तों की सटीक याददाश्त।',
      legendUnveiled: [
        '🧠 4-रजिस्ट्री मेमोरी इंजन: सभी इक्के, बादशाह, बेगम, गुलाम और तुरुप याद रखता है',
        '⚔️ 10-बोली का आक्रामक दांव: बोनस हेतु टीम बोली 10 (+20 अंक) तक खींचना',
        '🔥 वापसी का साहसिक दांव: पिछड़ने पर +1 अधिक बोलकर मैच का रुख पलटना',
        '🎲 फिनेस चाल: इक्का-बेगम होने पर विरोधी के बादशाह को फंसाना',
        '⚔️ विरोधी के तुरुप खाली करना: अपने बड़े पत्तों को सुरक्षित रखने हेतु तुरुप निकलवाना',
        '👑 बादशाह बचाव स्ट्राइक: विरोधी के इक्के पर जोकर मारकर अपने बादशाह को मालिक बनाना',
        '⚡ तुरुप इक्का खात्मा: विरोधी के तुरुप इक्के पर दादाजी जोकर की निर्णायक मार',
        '💥 बोस्टन स्वीप रोकथाम: विरोधी को सभी 13 हाथ जीतने से हर हाल में रोकना',
        '🎯 साझेदार को तुरुप कटवाना: साथी के खाली रंग की पहचान कर उसे हाथ दिलवाना',
      ],
      unveiledTricksHeader: '★ अनलॉक की गई रणनीतिक चालें:',
      activeBtn: 'सक्रिय',
      selectBtn: 'चुनें',
      activeModeLabel: 'वर्तमान स्तर:',
      applyBtn: 'लागू करें और खेलें',
    },
    trumpInspect: {
      badge: '13वां अंतिम बांटा गया पत्ता',
      title: 'शासक तुरुप रंग (Trump Suit)',
      subtitle: (suit) => `अंतिम बांटे गए पत्ते द्वारा निर्धारित तुरुप: ${suit}`,
      description: (suit) => `इस हाथ में ${suit} रंग का कोई भी पत्ता अन्य रंगों को काट सकता है! (जब तक दादाजी जोकर न खेला जाए)।`,
      btnClose: 'निरीक्षण बंद करें',
    },
    showHand: {
      title: 'हाथ दिखाना और सत्यापन (Show Hand)',
      claimBadge: 'सीधा दावा',
      headerDesc: (won, bid, needed) => `विपक्षी टीम ने अपनी बोली पूरी कर ली (${won}/${bid})। अपने पत्ते चुनकर साबित करें कि शेष ${needed} हाथ आपके हैं!`,
      team1Label: 'टीम 1 (आपकी टीम)',
      team1TricksWon: (won, bid) => `${bid} में से ${won} हाथ जीते`,
      targetToWin: 'जीतने हेतु लक्ष्य:',
      neededTricks: (n) => `${n} हाथ बाकी हैं`,
      team2Label: 'टीम 2 (विपक्षी टीम)',
      team2TricksWon: (won, bid) => `${bid} में से ${won} हाथ जीते`,
      team2Status: 'स्थिति:',
      contractMet: 'अनुबंध पूर्ण ✓',
      step1Title: 'चरण 1: अपने विजयी पत्ते चुनें',
      step1Desc: (needed) => `नीचे दिए गए पत्तों पर क्लिक करें जो आपके अनुसार शेष ${needed} हाथ जीतेंगे।`,
      selectedLabel: 'चयनित:',
      readyLabel: '✓ तैयार',
      tip: 'सुझाव: दादाजी जोकर और बड़े तुरुप के पत्ते निश्चित जीत दिलाते हैं।',
      btnAutoSelect: 'सर्वश्रेष्ठ पत्ते स्वतः चुनें',
      btnClear: 'हटाएं',
      yourHandTitle: 'आपके पत्ते (दक्षिण) — चुनने के लिए क्लिक करें',
      remainingCards: (count) => `${count} पत्ते बाकी`,
      partnerHandTitle: 'साझेदार के पत्ते (उत्तर - हृदय)',
      penaltyNoticeTitle: 'हाथ दिखाने का सख्त दंड नियम',
      penaltyNoticeDesc: (bid, current, next) => `यदि आपके चुने गए पत्ते विपक्षी पत्तों के सामने असफल रहे, तो आपको दंड भुगतना होगा: कुल स्कोर − वर्तमान बोली (-${bid} अंक: ${current} → ${next})।`,
      verifiedPassedTitle: 'सत्यापन सफल — 100% अभेद्य दावा',
      verifiedPassedSubtitle: (needed) => `सभी ${needed} हाथ निश्चित रूप से आपके नाम होते हैं।`,
      verifiedFailedTitle: 'सत्यापन विफल — दावा गलत निकला',
      verifiedFailedSubtitle: 'विपक्षी खिलाड़ियों के पास आपके पत्तों को मात देने वाले पत्ते मौजूद हैं।',
      itemizedTitle: 'पत्ता-वार विस्तृत सत्यापन रिपोर्ट:',
      youLabel: 'आप',
      hridayLabel: 'हृदय',
      guaranteedWin: 'निश्चित विजय',
      beatenFlawed: 'मात खा गया',
      scoreImpactTitle: 'दावा पूरा करने पर स्कोर प्रभाव:',
      contractAwarded: (pts) => `अनुबंध अंक प्राप्त (+${pts} अंक):`,
      penaltyApplied: (pts) => `नियम दंड (कुल स्कोर − वर्तमान बोली ${pts}):`,
      btnCancelNormal: 'रद्द करें और सामान्य खेलें',
      btnVerifyCards: (sel, need) => `चुने गए पत्ते सत्यापित करें (${sel}/${need})`,
      btnAdjustSelection: 'पत्ते दोबारा चुनें',
      btnClaimHand: (pts) => `हाथ का दावा करें (+${pts} अंक)`,
      btnAcceptPenalty: (pts) => `दंड स्वीकार करें (-${pts} अंक)`,
    },
    testRunner: {
      badge: 'आधिकारिक नियम पुस्तिका सत्यापन',
      title: (passed, total) => `स्वचालित गेम इंजन परीक्षण (${passed} / ${total})`,
      subtitle: 'यूनिवर्सल जोकर नियम पुस्तिका के खंड 15 के अनुसार सत्यापित',
      btnRerun: 'परीक्षण दोबारा चलाएं',
      allPassedBanner: 'सभी स्वचालित नियम परीक्षण सफलतापूर्वक पास हुए',
      failedBanner: (f) => `${f} परीक्षण विफल हुए`,
      percentPassed: (p, t) => `${p} / ${t} पास (100%)`,
      passBadge: 'सफल (PASS)',
      failBadge: 'विफल (FAIL)',
      btnClose: 'परीक्षण दर्शक बंद करें',
    },
  },
  or: {
    scoreboard: {
      titleSummary: (n) => `ହାତ ନମ୍ବର ${n} ସାରାଂଶ`,
      titleFinal: 'ମ୍ୟାଚ୍ ଚୂଡ଼ାନ୍ତ ଫଳାଫଳ',
      tieTitle: 'ମୁକାବିଲା ବରାବର (ଟାଇ)!',
      championTitle: (name) => `ରାଜକୀୟ ବିଜେତା: ${name}!`,
      subtitle: 'ଯୋଡ଼ି ସ୍କୋରବୋର୍ଡ଼ (Partnership Scoreboard)',
      targetDefault: 'ଲକ୍ଷ୍ୟ: ୧୦୦ ପଏଣ୍ଟ',
      targetCustom: (pts) => `ଲକ୍ଷ୍ୟ: ${pts} ପଏଣ୍ଟ`,
      targetTime: 'ସମୟ ଭିତ୍ତିକ ଟୁର୍ଣ୍ଣାମେଣ୍ଟ',
      scoringMatrix: 'ଅଫିସିଆଲ୍ ନିୟମାବଳୀ ସ୍କୋରିଂ ତାଲିକା',
      colPartnership: 'ଯୋଡ଼ି (ଟିମ୍)',
      colIndividualBids: 'ବ୍ୟକ୍ତିଗତ ଡାକ',
      colTeamBid: 'ଦଳଗତ ଡାକ',
      colTricksWon: 'ଜିତିଥିବା ହାତ',
      colHandResult: 'ହାତ ଫଳାଫଳ',
      colMatchPoints: 'ମ୍ୟାଚ୍ ପଏଣ୍ଟ',
      team1Label: 'ଟିମ୍ ୧ (ଆଦେଶ ଓ ହୃଦୟ)',
      team1Seats: 'ଦକ୍ଷିଣ ଓ ଉତ୍ତର',
      team2Label: 'ଟିମ୍ ୨ (ଶୀଳା ଓ ମୈନା)',
      team2Seats: 'ପଶ୍ଚିମ ଓ ପୂର୍ବ',
      bostonSweep: '★ ବୋଷ୍ଟନ୍ ସୁଇପ୍ (୧୩ ହାତ)',
      metContract: (pts) => `ଡାକ ପୂରଣ (+${pts})`,
      failedContract: (pts) => `ବିଫଳ (-${pts})`,
      rulePoint1: 'ଡାକ ୨–୯ ପୂରଣ: ଠିକ୍ +ଡାକ ପଏଣ୍ଟ (ଅଧିକ ହାତ ଜିତିଲେ ଶୂନ ପଏଣ୍ଟ)।',
      rulePoint2: 'ଉଚ୍ଚ ଡାକ ୧୦–୧୩ ପୂରଣ: ଡାକର ଦୁଇଗୁଣ ପଏଣ୍ଟ (+୨x ଡାକ)।',
      rulePoint3: 'ବିଫଳ ଚୁକ୍ତି: ଡାକ ବାବଦକୁ ପଏଣ୍ଟ କଟାଯିବ (-ଡାକ)।',
      rulePoint4: 'ବୋଷ୍ଟନ୍ ସୁଇପ୍: ସମସ୍ତ ୧୩ ହାତ ଜିତିଲେ ସେହି ରାଉଣ୍ଡର ସ୍କୋର ଦୁଇଗୁଣ ହୋଇଥାଏ।',
      btnDealNext: 'ପରବର୍ତ୍ତୀ ହାତ ବାଣ୍ଟନ୍ତୁ',
      btnAutoIn: (s) => `${s} ସେକେଣ୍ଡରେ ଆପେଆପେ`,
      btnResumeAuto: '▶ ସ୍ୱୟଂଚାଳିତ ଜାରି ରଖନ୍ତୁ',
      btnPauseAuto: '⏸ ସ୍ୱୟଂଚାଳିତ ରୋକନ୍ତୁ',
      btnStartNewMatch: 'ନୂଆ ରାଜକୀୟ ମ୍ୟାଚ୍ ଆରମ୍ଭ କରନ୍ତୁ',
      btnReviewTable: 'ଟେବୁଲ୍ ଯାଞ୍ଚ କରନ୍ତୁ',
    },
    matchConfig: {
      badge: 'ମ୍ୟାଚ୍ ପ୍ରସ୍ତୁତି',
      title: 'ମ୍ୟାଚ୍ ଫର୍ମାଟ୍ ଚୟନ କରନ୍ତୁ',
      subtitle: 'ନିୟମାବଳୀ ଅନୁସାରେ ନିଜ ପସନ୍ଦର ଟୁର୍ଣ୍ଣାମେଣ୍ଟ ମୋଡ୍ ବାଛନ୍ତୁ',
      defaultModeTitle: 'ମାନକ ପଏଣ୍ଟ ମୋଡ୍ (୧୦୦ ପଏଣ୍ଟ)',
      defaultModeDesc: 'ପ୍ରଥମେ ୧୦୦ କିମ୍ବା ତା’ଠାରୁ ଅଧିକ ପଏଣ୍ଟ ହାସଲ କରିଥିବା ଯୋଡ଼ି ମ୍ୟାଚ୍ ଜିତିବେ।',
      customModeTitle: 'ନିଜ ପସନ୍ଦ ପଏଣ୍ଟ ମୋଡ୍',
      customModeDesc: 'କ୍ଷିପ୍ର କିମ୍ବା ଦୀର୍ଘ ଖେଳ ପାଇଁ ନିଜ ଇଚ୍ଛା ଅନୁସାରେ ଲକ୍ଷ୍ୟ ପଏଣ୍ଟ ସ୍ଥିର କରନ୍ତୁ।',
      targetPointsLabel: 'ଲକ୍ଷ୍ୟ ପଏଣ୍ଟ:',
      timeModeTitle: 'ସମୟ ମୋଡ୍ (ଲାଇଭ୍ ଟାଇମର୍)',
      timeModeDesc: 'ନିର୍ଦ୍ଧାରିତ ସମୟ ସରିବା ଯାଏଁ ଖେଳ ଚାଲିବ। ସମୟ ସରିବା ପରେ ଚାଲୁଥିବା ହାତଟି ସମ୍ପୂର୍ଣ୍ଣ ହେବ।',
      durationLabel: 'ସମୟ (ମିନିଟ୍):',
      btnApply: 'ଲାଗୁ କରନ୍ତୁ ଓ ନୂଆ ମ୍ୟାଚ୍ ଖେଳନ୍ତୁ',
      btnCancel: 'ବାତିଲ୍ କରନ୍ତୁ',
    },
    tactics: {
      badge: 'ରଣନୈତିକ ବୁଦ୍ଧିମତ୍ତା ସେଟିଂସ୍',
      title: 'ଖେଳାଳି ବୁଦ୍ଧିମତ୍ତା ସ୍ତର (AI Intelligence)',
      subtitle: 'ଖେଳାଳିମାନେ କିପରି ଚାଲିବେ ସ୍ଥିର କରନ୍ତୁ। ନବାଗତ, ଦକ୍ଷ ଏବଂ ମହାରଥୀ ସ୍ତରରେ ବିଭିନ୍ନ ଚତୁର ଚାଲ୍ ଖୋଲିବ।',
      noviceTitle: 'ନବାଗତ (Novice)',
      noviceBadge: 'ସ୍ତର ୧ · ମୌଳିକ ଖେଳ',
      noviceSubtitle: 'ସରଳ ଓ ସିଧାସଳଖ ତାସ୍ ଚାଳନା',
      noviceDesc: 'ସାଧାରଣ ଖେଳ ପାଇଁ ଉପଯୁକ୍ତ। କୌଣସି ଜଟିଳ ତାସ୍ ହିସାବ କିମ୍ବା ଫାନ୍ଦ ବିନା ସହଜ ଖେଳ।',
      noviceUnveiled: [
        'ସିଧାସଳଖ ନିୟମ ପାଳନ: ସମ୍ଭବ ହେଲେ ଡକାଯାଇଥିବା ରଙ୍ଗ ଖେଳିବା',
        'ସାଧାରଣ ତାସ୍ ତ୍ୟାଗ: ଜିତିବା ଅସମ୍ଭବ ହେଲେ ସବୁଠୁ ଛୋଟ ତାସ୍ ଫିଙ୍ଗିବା',
        'ସିଧାସଳଖ ହାତ ବିଜୟ: ଉପଲବ୍ଧ ସବୁଠୁ ଛୋଟ ବିଜୟୀ ତାସ୍ ଖେଳିବା',
        'ମୌଳିକ ଜୋକର୍: ଜରୁରୀ ସମୟ କିମ୍ବା ରଙ୍ଗ ନଥିବା ବେଳେ ଖେଳିବା',
      ],
      noviceLocked: [
        'ତାସ୍ ସ୍ମୃତି କିମ୍ବା ଭଏଡ୍ ଟ୍ରାକିଂ ନାହିଁ',
        'ଯୋଡ଼ିଦାର ସୁରକ୍ଷା ନାହିଁ',
        'ସାହେବ୍ ଉଦ୍ଧାର ଚାଲ୍ ନାହିଁ',
        'ତୁରୁପ୍ ଟିକ୍କା ଛେଦନ ନାହିଁ',
      ],
      masterTitle: 'ଦକ୍ଷ (Master)',
      masterBadge: 'ସ୍ତର ୨ · ଅଭିଜ୍ଞ ଖେଳ',
      masterSubtitle: 'ବଡ଼ ତାସ୍ ସଂରକ୍ଷଣ ଓ ଯୋଡ଼ିଦାରଙ୍କ ସହଯୋଗ',
      masterDesc: 'ଅନୁଶାସିତ ଭାଗିଦାରୀ, ବଡ଼ ତାସ୍ ନଷ୍ଟ ନକରି ସଠିକ୍ ସମୟରେ ତୁରୁପ୍ ଓ ଜୋକର୍ ଖେଳିବା।',
      masterUnveiled: [
        '🛡️ ଯୋଡ଼ିଦାର ସୁରକ୍ଷା: ଯୋଡ଼ିଦାର ଜିତୁଥିବା ହାତ ଉପରେ ବଡ଼ ତାସ୍ ପକାଏ ନାହିଁ',
        '⏰ ୧୨ଶ ହାତ ଜୋକର୍ ନିୟମ: ୧୩ଶ ହାତରେ କଳା ପାନ୍ ଦୁଇ ହେବା ପୂର୍ବରୁ ଜୋକର୍ ବ୍ୟବହାର',
        '🦆 ଦ୍ୱିତୀୟ ବଡ଼ ତାସ୍ ରକ୍ଷା: ଟିକ୍କା ସାମ୍ନାରେ ସାହେବ୍ ଖସାଇବା ପୂର୍ବରୁ ସାବଧାନତା',
        '👑 ଟିକ୍କା ନେତୃତ୍ୱ: ବିପକ୍ଷ କାଟିବା ପୂର୍ବରୁ ବାହାର ଟିକ୍କା ଖେଳି ହାତ ନେବା',
        '⚔️ ତୁରୁପ୍ ପ୍ରତିରକ୍ଷା: ବିପକ୍ଷର ଛୋଟ ତୁରୁପ୍ ଉପରେ ବଡ଼ ତୁରୁପ୍ ପକାଇବା',
      ],
      masterLocked: [
        'ସମ୍ପୂର୍ଣ୍ଣ ୪-ରେଜିଷ୍ଟ୍ରି ତାସ୍ ସ୍ମୃତି ନାହିଁ',
        'ଜୋକର୍ ଦ୍ୱାରା ସାହେବ୍ ଉଦ୍ଧାର ଚାଲ୍ ନାହିଁ',
        'ତୁରୁପ୍ ଟିକ୍କା ଛେଦନ ନାହିଁ',
      ],
      legendTitle: 'ମହାରଥୀ (Legend)',
      legendBadge: 'ସ୍ତର ୩ · ଗ୍ରାଣ୍ଡମାଷ୍ଟର୍ ଇଞ୍ଜିନ୍',
      legendSubtitle: 'ସଠିକ୍ ହିସାବୀ ବିପଦ ଓ ସମ୍ପୂର୍ଣ୍ଣ ୪-ରେଜିଷ୍ଟ୍ରି ତାସ୍ ସ୍ମୃତି',
      legendDesc: 'ସାହସିକ ଡାକ, ମନସ୍ତାତ୍ତ୍ୱିକ ଫାନ୍ଦ, ଟିକ୍କା-ସାହେବ୍-ଜୋକର୍ ଉପଯୋଗ ଓ ଫିଙ୍ଗାଯାଇଥିବା ସମସ୍ତ ତାସ୍ ମନେରଖିବା।',
      legendUnveiled: [
        '🧠 ୪-ରେଜିଷ୍ଟ୍ରି ସ୍ମୃତି ଇଞ୍ଜିନ୍: ଟିକ୍କା, ସାହେବ୍, ବିବି, ଗୋଲାମ ଓ ତୁରୁପ୍ ସମ୍ପୂର୍ଣ୍ଣ ମନେରଖେ',
        '⚔️ ୧୦-ଡାକ ଚୁକ୍ତି ଲକ୍ଷ୍ୟ: ସମ୍ଭାବନା ଦେଖି ୧୦ ଡାକ (+୨୦ ବୋନସ୍ ପଏଣ୍ଟ) ଲକ୍ଷ୍ୟ ରଖେ',
        '🔥 ସାହସିକ ପ୍ରତ୍ୟାବର୍ତ୍ତନ: ପଛୁଆ ଥିଲେ +୧ ଅତିରିକ୍ତ ଡାକି ମ୍ୟାଚ୍ ମୋଡ଼ ବଦଳାଏ',
        '🎲 ଟିକ୍କା-ବିବି ଚତୁର ଫାନ୍ଦ: ବିପକ୍ଷ ସାହେବ୍ ଫସାଇବା ପାଇଁ ଛୋଟ ତାସ୍ ଖେଳେ',
        '⚔️ ତୁରୁପ୍ ନିଷ୍କାସନ: ବିପକ୍ଷ ତୁରୁପ୍ ଶେଷ କରି ନିଜ ବଡ଼ ତାସ୍ ସୁରକ୍ଷିତ କରେ',
        '👑 ସାହେବ୍ ଉଦ୍ଧାର ଚାଲ୍: ବିପକ୍ଷ ଟିକ୍କା ପକାଇଲେ ତୁରନ୍ତ ଜୋକର୍ ମାରି ସାହେବ୍ ରକ୍ଷା କରେ',
        '⚡ ତୁରୁପ୍ ଟିକ୍କା ଛେଦନ: ବିପକ୍ଷର ତୁରୁପ୍ ଟିକ୍କା ଉପରେ ଦାଦାଜୀ ଜୋକର୍ ମାରି ଧ୍ୱଂସ କରେ',
        '💥 ବୋଷ୍ଟନ୍ ସୁଇପ୍ ରୋକିବା: ବିପକ୍ଷର ସମସ୍ତ ୧୩ ହାତ ସ୍ୱପ୍ନ ଧୂଳିସାତ୍ କରେ',
        '🎯 ଯୋଡ଼ିଦାରଙ୍କୁ ତୁରୁପ୍ ଦେବା: ଯୋଡ଼ିଦାରଙ୍କ ପାଖେ ଯେଉଁ ରଙ୍ଗ ନାହିଁ ସେହି ରଙ୍ଗ ଫିଙ୍ଗି କଟାଏ',
      ],
      unveiledTricksHeader: '★ ଉନ୍ମୋଚିତ ରଣନୈତିକ ଚାଲ୍:',
      activeBtn: 'ସକ୍ରିୟ',
      selectBtn: 'ବାଛନ୍ତୁ',
      activeModeLabel: 'ଚାଲୁଥିବା ସ୍ତର:',
      applyBtn: 'ଲାଗୁ କରନ୍ତୁ ଓ ଖେଳନ୍ତୁ',
    },
    trumpInspect: {
      badge: '୧୩ଶ ଶେଷ ବଣ୍ଟାଯାଇଥିବା ତାସ୍',
      title: 'ମୁଖ୍ୟ ତୁରୁପ୍ ରଙ୍ଗ (Ruling Trump Suit)',
      subtitle: (suit) => `ଶେଷରେ ବଣ୍ଟାଯାଇଥିବା ତାସ୍ ଅନୁଯାୟୀ ତୁରୁପ୍: ${suit}`,
      description: (suit) => `ଏହି ରାଉଣ୍ଡରେ ${suit} ରଙ୍ଗର ଯେକୌଣସି ତାସ୍ ଅନ୍ୟ ରଙ୍ଗକୁ କାଟିପାରିବ! (ଯଦିଓ ଦାଦାଜୀ ଜୋକର୍ ସବୁଠୁ ବଳିଷ୍ଠ)।`,
      btnClose: 'ଯାଞ୍ଚ ବନ୍ଦ କରନ୍ତୁ',
    },
    showHand: {
      title: 'ତାସ୍ ଦେଖାଇବା ଓ ସତ୍ୟାପନ (Show Hand)',
      claimBadge: 'ପ୍ରତ୍ୟକ୍ଷ ଦାବି',
      headerDesc: (won, bid, needed) => `ବିପକ୍ଷ ଟିମ୍ ନିଜ ଡାକ ପୂରା କଲେଣି (${won}/${bid})। ନିଜ ତାସ୍ ବାଛି ପ୍ରମାଣ କରନ୍ତୁ ଯେ ବାକି ${needed} ହାତ ଆପଣଙ୍କର!`,
      team1Label: 'ଟିମ୍ ୧ (ଆପଣଙ୍କ ଟିମ୍)',
      team1TricksWon: (won, bid) => `${bid} ମଧ୍ୟରୁ ${won} ହାତ ଜିତିଛନ୍ତି`,
      targetToWin: 'ଜିତିବା ପାଇଁ ଲକ୍ଷ୍ୟ:',
      neededTricks: (n) => `ଆଉ ${n} ହାତ ଆବଶ୍ୟକ`,
      team2Label: 'ଟିମ୍ ୨ (ବିପକ୍ଷ ଟିମ୍)',
      team2TricksWon: (won, bid) => `${bid} ମଧ୍ୟରୁ ${won} ହାତ ଜିତିଛନ୍ତି`,
      team2Status: 'ସ୍ଥିତି:',
      contractMet: 'ଚୁକ୍ତି ସମ୍ପୂର୍ଣ୍ଣ ✓',
      step1Title: 'ପଦକ୍ଷେପ ୧: ନିଜର ବିଜୟୀ ତାସ୍ ବାଛନ୍ତୁ',
      step1Desc: (needed) => `ତଳେ ଥିବା ତାସ୍ ମଧ୍ୟରୁ ଯେଉଁଗୁଡ଼ିକ ବଳରେ ଆପଣ ବାକି ${needed} ହାତ ଜିତିବେ ତାହା ଚୟନ କରନ୍ତୁ।`,
      selectedLabel: 'ଚୟନିତ:',
      readyLabel: '✓ ପ୍ରସ୍ତୁତ',
      tip: 'ସୂଚନା: ଦାଦାଜୀ ଜୋକର୍ ଏବଂ ବଡ଼ ତୁରୁପ୍ ତାସ୍ ସର୍ବଦା ନିଶ୍ଚିତ ବିଜୟ ଦିଏ।',
      btnAutoSelect: 'ଉତ୍ତମ ତାସ୍ ଆପେଆପେ ବାଛନ୍ତୁ',
      btnClear: 'ସଫା କରନ୍ତୁ',
      yourHandTitle: 'ଆପଣଙ୍କ ତାସ୍ (ଦକ୍ଷିଣ) — ବାଛିବା ପାଇଁ କ୍ଲିକ୍ କରନ୍ତୁ',
      remainingCards: (count) => `ଆଉ ${count}ଟି ତାସ୍ ବାକି`,
      partnerHandTitle: 'ଯୋଡ଼ିଦାରଙ୍କ ତାସ୍ (ଉତ୍ତର - ହୃଦୟ)',
      penaltyNoticeTitle: 'କଠୋର ହାତ ଦେଖାଇବା ଜୋରିମାନା ନିୟମ',
      penaltyNoticeDesc: (bid, current, next) => `ଯଦି ଆପଣ ବାଛିଥିବା ତାସ୍ ବିପକ୍ଷ ତାସ୍ ସମ୍ମୁଖରେ ବିଫଳ ହୁଏ, ତେବେ ଜୋରିମାନା ଲାଗିବ: ମୋଟ ସ୍କୋର − ଚଳିତ ଡାକ (-${bid} ପଏଣ୍ଟ: ${current} → ${next})।`,
      verifiedPassedTitle: 'ସତ୍ୟାପନ ସଫଳ — ୧୦୦% ଅଭେଦ୍ୟ ଦାବି',
      verifiedPassedSubtitle: (needed) => `ସମସ୍ତ ${needed}ଟି ହାତ ନିଶ୍ଚିତ ରୂପେ ଆପଣଙ୍କର ବିଜୟ ହେବ।`,
      verifiedFailedTitle: 'ସତ୍ୟାପନ ବିଫଳ — ଦାବିରେ ତ୍ରୁଟି ଅଛି',
      verifiedFailedSubtitle: 'ବିପକ୍ଷ ଖେଳାଳିଙ୍କ ପାଖରେ ଆପଣଙ୍କୁ ପରାସ୍ତ କରିବା ଭଳି ତାସ୍ ରହିଛି।',
      itemizedTitle: 'ପ୍ରତ୍ୟେକ ତାସ୍‌ର ବିସ୍ତୃତ ଯାଞ୍ଚ ରିପୋର୍ଟ:',
      youLabel: 'ଆପଣ',
      hridayLabel: 'ହୃଦୟ',
      guaranteedWin: 'ନିଶ୍ଚିତ ବିଜୟ',
      beatenFlawed: 'ପରାସ୍ତ / ଦୁର୍ବଳ',
      scoreImpactTitle: 'ଦାବି ସମାପ୍ତ ହେଲେ ସ୍କୋର ଉପରେ ପ୍ରଭାବ:',
      contractAwarded: (pts) => `ଚୁକ୍ତି ପଏଣ୍ଟ ପ୍ରଦାନ (+${pts} ପଏଣ୍ଟ):`,
      penaltyApplied: (pts) => `ନିୟମ ଜୋରିମାନା (ମୋଟ ସ୍କୋର − ଚଳିତ ଡାକ ${pts}):`,
      btnCancelNormal: 'ବାତିଲ୍ କରି ସ୍ୱାଭାବିକ ଖେଳନ୍ତୁ',
      btnVerifyCards: (sel, need) => `ବାଛିଥିବା ତାସ୍ ଯାଞ୍ଚ କରନ୍ତୁ (${sel}/${need})`,
      btnAdjustSelection: 'ତାସ୍ ବଦଳାନ୍ତୁ',
      btnClaimHand: (pts) => `ହାତ ଦାବି କରନ୍ତୁ (+${pts} ପଏଣ୍ଟ)`,
      btnAcceptPenalty: (pts) => `ଜୋରିମାନା ଗ୍ରହଣ କରନ୍ତୁ (-${pts} ପଏଣ୍ଟ)`,
    },
    testRunner: {
      badge: 'ଅଫିସିଆଲ୍ ନିୟମାବଳୀ ସତ୍ୟାପନ',
      title: (passed, total) => `ସ୍ୱୟଂକ୍ରିୟ ଗେମ୍ ଇଞ୍ଜିନ୍ ପରୀକ୍ଷା (${passed} / ${total})`,
      subtitle: 'ୟୁନିଭର୍ସାଲ୍ ଜୋକର୍ ନିୟମାବଳୀର ଧାରା ୧୫ ଅନୁସାରେ ପରୀକ୍ଷିତ',
      btnRerun: 'ପୁନଃ ପରୀକ୍ଷା କରନ୍ତୁ',
      allPassedBanner: 'ସମସ୍ତ ସ୍ୱୟଂକ୍ରିୟ ନିୟମ ପରୀକ୍ଷା ସଫଳତାର ସହ ପାସ୍ ହୋଇଛି',
      failedBanner: (f) => `${f}ଟି ପରୀକ୍ଷା ବିଫଳ ହୋଇଛି`,
      percentPassed: (p, t) => `${p} / ${t} ପାସ୍ (୧୦୦%)`,
      passBadge: 'ପାସ୍ (PASS)',
      failBadge: 'ଫେଲ୍ (FAIL)',
      btnClose: 'ପରୀକ୍ଷା ଦର୍ଶକ ବନ୍ଦ କରନ୍ତୁ',
    },
  },
};
