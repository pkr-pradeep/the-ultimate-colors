import React, { useState, useEffect } from 'react';
import {
  RulebookLanguage,
  markWalkthroughSeen,
  saveRulebookLanguage,
  getSavedRulebookLanguage,
} from '../utils/firstTimeUser';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  BookOpen,
  Play,
  CheckCircle2,
  ShieldAlert,
  Crown,
  Layers,
  RotateCcw,
  Zap,
  Trophy,
  Settings,
  Brain,
  Clock,
  Target,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

interface WalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRulebook: (lang?: RulebookLanguage) => void;
  language?: RulebookLanguage;
  onLanguageChange?: (lang: RulebookLanguage) => void;
}

interface WalkthroughStep {
  title: Record<RulebookLanguage, string>;
  subtitle: Record<RulebookLanguage, string>;
  badge: Record<RulebookLanguage, string>;
  icon: React.ReactNode;
  content: Record<RulebookLanguage, React.ReactNode>;
}

export const WalkthroughModal: React.FC<WalkthroughModalProps> = ({
  isOpen,
  onClose,
  onOpenRulebook,
  language: controlledLang,
  onLanguageChange,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [localLang, setLocalLang] = useState<RulebookLanguage>(controlledLang || getSavedRulebookLanguage());

  useEffect(() => {
    if (controlledLang) {
      setLocalLang(controlledLang);
    } else {
      setLocalLang(getSavedRulebookLanguage());
    }
  }, [isOpen, controlledLang]);

  if (!isOpen) return null;

  const language = controlledLang || localLang;

  const handleLanguageChange = (lang: RulebookLanguage) => {
    setLocalLang(lang);
    saveRulebookLanguage(lang);
    onLanguageChange?.(lang);
  };

  const handleFinish = () => {
    markWalkthroughSeen();
    onClose();
  };

  const handleSkip = () => {
    markWalkthroughSeen();
    onClose();
  };

  const handleOpenRulebookFromTour = () => {
    markWalkthroughSeen();
    onClose();
    onOpenRulebook(language);
  };

  const steps: WalkthroughStep[] = [
    // Step 1: Welcome & Deck
    {
      badge: {
        en: 'Step 1 of 7 · Welcome',
        hi: 'चरण 1 / 7 · स्वागत',
        or: 'ପର୍ଯ୍ୟାୟ ୧ / ୭ · ସ୍ୱାଗତ',
      },
      title: {
        en: 'Welcome to The Universal Joker',
        hi: 'द यूनिवर्सल जोकर में आपका स्वागत है',
        or: 'ଦ ୟୁନିଭର୍ସାଲ୍ ଜୋକର୍‌କୁ ସ୍ୱାଗତ',
      },
      subtitle: {
        en: 'A legendary 4-player trick-taking game where Dadaji Joker rules supreme.',
        hi: '4 खिलाड़ियों का अनूठा ताश खेल जहां दादाजी जोकर सर्वोच्च सत्ता हैं।',
        or: '୪ ଜଣିଆ ରାଜକୀୟ ତାସ୍ ଖେଳ, ଯେଉଁଠି ଦାଦାଜୀ ଜୋକର୍ ହିଁ ଏକଚ୍ଛତ୍ର ସମ୍ରାଟ!',
      },
      icon: <Crown className="text-amber-400" size={26} />,
      content: {
        en: (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/40 flex items-center gap-3.5">
              <div className="w-16 h-22 rounded-xl bg-[#FAF6EC] border border-[#6e1423] p-0.5 shadow-md flex-shrink-0 overflow-hidden">
                <img
                  src="/assets/Indian_Playing_Cards/svg/53_Joker.svg"
                  alt="Dadaji Joker"
                  className="w-full h-full object-fill select-none"
                />
              </div>
              <div className="text-xs text-neutral-200 space-y-1">
                <h4 className="font-cinzel font-bold text-amber-200 text-sm">
                  The Imperial 53rd Card (Dadaji)
                </h4>
                <p className="text-neutral-300">
                  Dressed in imperial sherwani and curled moustache, Dadaji sits above the Ace of Trump as the Universal Trump.
                </p>
                <p className="text-amber-300 font-semibold text-[11px]">
                  ★ Two of Spades (2♠) is permanently removed! Suits: Clubs (♣), Hearts (♥), Spades (♠), Diamond (♦), and Joker (★).
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="font-cinzel text-amber-300 font-bold block mb-1">52 Playable Cards</span>
                <span className="text-neutral-400 text-[11px]">Exact 13 cards dealt counter-clockwise to each of the 4 players.</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="font-cinzel text-amber-300 font-bold block mb-1">Partnerships</span>
                <span className="text-neutral-400 text-[11px]">You (South) + Partner Hriday (North) vs East + West.</span>
              </div>
            </div>
          </div>
        ),
        hi: (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/40 flex items-center gap-3.5">
              <div className="w-16 h-22 rounded-xl bg-[#FAF6EC] border border-[#6e1423] p-0.5 shadow-md flex-shrink-0 overflow-hidden">
                <img
                  src="/assets/Indian_Playing_Cards/svg/53_Joker.svg"
                  alt="Dadaji Joker"
                  className="w-full h-full object-fill select-none"
                />
              </div>
              <div className="text-xs text-neutral-200 space-y-1">
                <h4 className="font-cinzel font-bold text-amber-200 text-sm">
                  शाही 53वां पत्ता (दादाजी जोकर)
                </h4>
                <p className="text-neutral-300">
                  शाही शेरवानी और मूंछों वाले दादाजी तुरुप के इक्के से भी ऊपर बैठकर खेल पर राज करते हैं।
                </p>
                <p className="text-amber-300 font-semibold text-[11px]">
                  ★ हुकुम की दुक्की (2♠) डेक से बाहर है! 4 रंग: चिडि (♣), पान (♥), हुकुम (♠), ईट (♦), और जोकर (★)।
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="font-cinzel text-amber-300 font-bold block mb-1">52 खेलने योग्य पत्ते</span>
                <span className="text-neutral-400 text-[11px]">चारों खिलाड़ियों को 13-13 पत्ते वामावर्त (Counter-Clockwise) बांटे जाते हैं।</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="font-cinzel text-amber-300 font-bold block mb-1">साझेदारी टीमें</span>
                <span className="text-neutral-400 text-[11px]">आप (दक्षिण) + साथी हृदय (उत्तर) बनाम पूर्व + पश्चिम।</span>
              </div>
            </div>
          </div>
        ),
        or: (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/40 flex items-center gap-3.5">
              <div className="w-16 h-22 rounded-xl bg-[#FAF6EC] border border-[#6e1423] p-0.5 shadow-md flex-shrink-0 overflow-hidden">
                <img
                  src="/assets/Indian_Playing_Cards/svg/53_Joker.svg"
                  alt="Dadaji Joker"
                  className="w-full h-full object-fill select-none"
                />
              </div>
              <div className="text-xs text-neutral-200 space-y-1">
                <h4 className="font-cinzel font-bold text-amber-200 text-sm">
                  ରାଜକୀୟ ୫୩ତମ ତାସ୍ (ଦାଦାଜୀ ଜୋକର୍)
                </h4>
                <p className="text-neutral-300">
                  ରାଜସିକ ଶେରୱାନୀ ଓ କୁଣ୍ଡଳୀ ନିଶ ସହ ଦାଦାଜୀ ହେଉଛନ୍ତି ତୁରୁପ୍ ଟିକ୍କା ଠାରୁ ବି ବଳିଷ୍ଠ ସର୍ବୋଚ୍ଚ କାର୍ଡ।
                </p>
                <p className="text-amber-300 font-semibold text-[11px]">
                  ★ କଳା ପାନ୍ ଦୁଇ (2♠) ଖେଳରୁ ସବୁଦିନ ପାଇଁ ବାହାର! ୪ ରଙ୍ଗ: ଚିଡ଼ିଆ (♣), ଲାଲ୍ ପାନ୍ (♥), କଳା ପାନ୍ (♠), ଠିକିରି (♦), ଏବଂ ଜୋକର୍ (★)।
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="font-cinzel text-amber-300 font-bold block mb-1">୫୨ ଖଣ୍ଡ ଖେଳ ତାସ୍</span>
                <span className="text-neutral-400 text-[11px]">୪ ଜଣ ଖେଳାଳିଙ୍କୁ ଘଣ୍ଟା କଣ୍ଟାର ଓଲଟା ଦିଗରେ ୧୩ ଖଣ୍ଡ ଲେଖାଏଁ ତାସ୍ ମିଳେ।</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="font-cinzel text-amber-300 font-bold block mb-1">ଦୁଇଟି ସହଭାଗୀ ଦଳ</span>
                <span className="text-neutral-400 text-[11px]">ଆପଣ (ଦକ୍ଷିଣ) + ସାଥୀ ହୃଦୟ (ଉତ୍ତର) ବନାମ ପୂର୍ବ + ପଶ୍ଚିମ।</span>
              </div>
            </div>
          </div>
        ),
      },
    },

    // Step 2: Game Menus & Navigation (Where to See What)
    {
      badge: {
        en: 'Step 2 of 7 · Table Menus',
        hi: 'चरण 2 / 7 · टेबल मेनू एवं नियंत्रण',
        or: 'ପର୍ଯ୍ୟାୟ ୨ / ୭ · ଟେବୁଲ୍ ମେନୁ ଓ ନାଭିଗେସନ୍',
      },
      title: {
        en: 'Table Menus & Controls (Where to See What)',
        hi: 'टेबल मेनू: कहां क्या देखें और कैसे बदलें',
        or: 'ଟେବୁଲ୍ ମେନୁ: କେଉଁଠି କ’ଣ ଦେଖିବେ ଓ ବଦଳାଇବେ',
      },
      subtitle: {
        en: 'Access live scorecards, match settings, AI tactics levels, and trump inspection.',
        hi: 'स्कोरकार्ड देखना, मैच मोड बदलना, एआई स्तर चुनना और तुरुप की जांच करना सीखें।',
        or: 'ସ୍କୋରକାର୍ଡ, ଖେଳ ମୋଡ୍ ପରିବର୍ତ୍ତନ, ଏଆଇ ସ୍ତର ଏବଂ ତୁରୁପ୍ ଯାଞ୍ଚର ସମ୍ପୂର୍ଣ୍ଣ ସୂଚନା।',
      },
      icon: <Trophy className="text-amber-400" size={26} />,
      content: {
        en: (
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-600/40 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center flex-shrink-0 text-amber-300">
                <Trophy size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-cinzel text-amber-200 font-bold block text-xs mb-0.5">
                  Scorecard (Trophy Button 🏆)
                </span>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  Click the <strong>Trophy</strong> button on the header or mobile drawer to view the complete round-by-round history, trick breakdown, and Boston sweeps.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700/60 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-600 flex items-center justify-center flex-shrink-0 text-amber-300">
                <Settings size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-cinzel text-amber-200 font-bold block text-xs mb-0.5">
                  Match Mode Switcher (⚙️ Settings)
                </span>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  Click the <strong>Gear (Settings)</strong> button to toggle between Survival (100 pts), Custom Target (50 / 60 pts), or Time Blitz countdown timer.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700/60 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-600 flex items-center justify-center flex-shrink-0 text-emerald-400">
                <Brain size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-cinzel text-amber-200 font-bold block text-xs mb-0.5">
                  AI Intelligence Modes (🌱 Novice · ⚔️ Master · 👑 Legend)
                </span>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  Click the <strong>Mode</strong> badge to change AI intelligence. Legend mode unlocks calculated King-Rescue strikes, Ace decapitations, and finesses!
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700/60 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-600 flex items-center justify-center flex-shrink-0 text-amber-400">
                <Crown size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-cinzel text-amber-200 font-bold block text-xs mb-0.5">
                  Ruling Trump Inspection (👑) & Rules (📖)
                </span>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  Click the Trump badge to inspect the 13th dealt card in high resolution. Click <strong>Rules (📖)</strong> or <strong>Tour (🧭)</strong> anytime!
                </p>
              </div>
            </div>
          </div>
        ),
        hi: (
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-600/40 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center flex-shrink-0 text-amber-300">
                <Trophy size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-cinzel text-amber-200 font-bold block text-xs mb-0.5">
                  स्कोरकार्ड (🏆 ट्रॉफी बटन)
                </span>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  हेडर या मोबाइल मेनू में <strong>ट्रॉफी बटन</strong> दबाकर प्रत्येक राउंड का स्कोर, हाथ जीतने का इतिहास और बोस्टन स्वीप की पूरी तालिका देखें।
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700/60 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-600 flex items-center justify-center flex-shrink-0 text-amber-300">
                <Settings size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-cinzel text-amber-200 font-bold block text-xs mb-0.5">
                  मैच सेटिंग्स एवं मोड परिवर्तन (⚙️)
                </span>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  <strong>गियर (सेटिंग्स)</strong> आइकन पर क्लिक करके 100-पॉइंट सर्वाइवल, कस्टम पॉइंट (50/60 अंक) या टाइम ब्लिट्ज़ टाइमर मोड में बदलें।
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700/60 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-600 flex items-center justify-center flex-shrink-0 text-emerald-400">
                <Brain size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-cinzel text-amber-200 font-bold block text-xs mb-0.5">
                  एआई बुद्धिमत्ता स्तर (🌱 नॉविस · ⚔️ मास्टर · 👑 लेजेंड)
                </span>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  <strong>मोड बैज</strong> पर क्लिक करके कंप्यूटर की चुनौती बदलें। लेजेंड मोड में बादशाह बचाओ वार, तुरुप इक्का वध और बोस्टन स्वीप सुरक्षा जैसी रणनीतियां खुल जाती हैं!
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700/60 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-600 flex items-center justify-center flex-shrink-0 text-amber-400">
                <Crown size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-cinzel text-amber-200 font-bold block text-xs mb-0.5">
                  सत्तारूढ़ तुरुप जांच (👑) एवं नियमावली (📖)
                </span>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  तुरुप बैज पर क्लिक करके 13वां निर्णायक पत्ता बड़ा करके जांचें। <strong>नियम (📖)</strong> या <strong>टूर (🧭)</strong> किसी भी समय देख सकते हैं।
                </p>
              </div>
            </div>
          </div>
        ),
        or: (
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-600/40 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center flex-shrink-0 text-amber-300">
                <Trophy size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-cinzel text-amber-200 font-bold block text-xs mb-0.5">
                  ସ୍କୋରକାର୍ଡ (🏆 ଟ୍ରଫି ବଟନ୍)
                </span>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  ଉପର ହେଡର୍ କିମ୍ବା ମୋବାଇଲ୍ ମେନୁରେ <strong>ଟ୍ରଫି ଆଇକନ୍</strong> ଦବାଇ ପ୍ରତ୍ୟେକ ହାତର ସ୍କୋର୍ ଇତିହାସ, ଜିତିଥିବା ହାତ ସଂଖ୍ୟା, ବୋଷ୍ଟନ୍ ସୁଇପ୍ ଏବଂ ଲାଇଭ୍ ପଏଣ୍ଟ୍ ଟେବୁଲ୍ ଦେଖନ୍ତୁ।
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700/60 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-600 flex items-center justify-center flex-shrink-0 text-amber-300">
                <Settings size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-cinzel text-amber-200 font-bold block text-xs mb-0.5">
                  ମ୍ୟାଚ୍ ସେଟିଂସ୍ ଓ ମୋଡ୍ ପରିବର୍ତ୍ତନ (⚙️)
                </span>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  <strong>ଗିଅର୍ (ସେଟିଂସ୍)</strong> ଆଇକନ୍ ଦବାଇ ୧୦୦-ପଏଣ୍ଟ୍ ସର୍ଭାଇଭାଲ୍, କଷ୍ଟମ୍ ଲକ୍ଷ୍ୟ (୫୦/୬୦ ପଏଣ୍ଟ୍) କିମ୍ବା ଟାଇମ୍ ବ୍ଲିଟ୍ଜ୍ କାଉଣ୍ଟ୍‌ଡାଉନ୍ ମୋଡ୍ ବଦଳାନ୍ତୁ।
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700/60 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-600 flex items-center justify-center flex-shrink-0 text-emerald-400">
                <Brain size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-cinzel text-amber-200 font-bold block text-xs mb-0.5">
                  ଏଆଇ ବୁଦ୍ଧିମତା ସ୍ତର (🌱 ନଭିସ୍ · ⚔️ ମାଷ୍ଟର୍ · 👑 ଲିଜେଣ୍ଡ୍)
                </span>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  <strong>ମୋଡ୍ ବଟନ୍</strong> ଉପରେ କ୍ଲିକ୍ କରି କମ୍ପ୍ୟୁଟର୍‌ର ଚତୁରତା ନିୟନ୍ତ୍ରଣ କରନ୍ତୁ। ଲିଜେଣ୍ଡ୍ ମୋଡ୍‌ରେ ସାହେବ୍ ବଞ୍ଚାଅ ଚାଲ୍ ଓ ତୁରୁପ୍ ଟିକ୍କା ଶିକାର ଭଳି ଧୁରନ୍ଧର କୌଶଳ ଖୋଲିଯାଏ!
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700/60 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-600 flex items-center justify-center flex-shrink-0 text-amber-400">
                <Crown size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-cinzel text-amber-200 font-bold block text-xs mb-0.5">
                  ତୁରୁପ୍ ଯାଞ୍ଚ ପରଦା (👑) ଓ ନିୟମାବଳୀ (📖)
                </span>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  ହେଡର୍‌ରେ ତୁରୁପ୍ ବ୍ୟାଜ୍ ଉପରେ କ୍ଲିକ୍ କରି ଡିଲର୍‌ଙ୍କ ୫୨ତମ ନିର୍ଣ୍ଣାୟକ ତାସ୍‌କୁ ବଡ଼ ଆକାରରେ ଯାଞ୍ଚ କରନ୍ତୁ। <strong>ନିୟମାବଳୀ (📖)</strong> ଓ <strong>ଟୁର୍ (🧭)</strong> ଯେକୌଣସି ସମୟରେ ଖୋଲିପାରିବେ।
                </p>
              </div>
            </div>
          </div>
        ),
      },
    },

    // Step 3: Match Modes & Mode Rules
    {
      badge: {
        en: 'Step 3 of 7 · Match Modes & Rules',
        hi: 'चरण 3 / 7 · मैच मोड एवं नियम',
        or: 'ପର୍ଯ୍ୟାୟ ୩ / ୭ · ଖେଳ ମୋଡ୍ ଓ ନିୟମ',
      },
      title: {
        en: 'Match Formats & Mode Rules',
        hi: 'सभी मैच मोड एवं उनके नियम',
        or: 'ସମସ୍ତ ଖେଳ ମୋଡ୍ ଓ ସେମାନଙ୍କର ନିୟମ',
      },
      subtitle: {
        en: 'Explore the 3 match targets and 3 AI difficulty intelligence levels.',
        hi: 'तीनों मैच प्रारूपों और तीनों एआई बुद्धिमत्ता स्तरों के नियम जानें।',
        or: 'ତିନୋଟି ମ୍ୟାଚ୍ ଫର୍ମାଟ୍ ଏବଂ ତିନୋଟି ଏଆଇ ବୁଦ୍ଧିମତା ସ୍ତରର ବିସ୍ତୃତ ନିୟମ।',
      },
      icon: <Target className="text-amber-400" size={26} />,
      content: {
        en: (
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-amber-600/40">
              <div className="flex items-center gap-1.5 font-cinzel text-amber-300 font-bold text-xs mb-1">
                <Target size={14} className="text-amber-400" />
                <span>1. Default Point Mode (Survival 100 Pts)</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                The official championship format. Rounds continue until the first team reaches or exceeds 100 match points. No hand limit.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700/60">
              <div className="flex items-center gap-1.5 font-cinzel text-amber-300 font-bold text-xs mb-1">
                <Sliders size={14} className="text-amber-400" />
                <span>2. Custom Point Mode (50 / 60 / Custom Target)</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                Set a customized score target (e.g. 50 or 60 points) for fast games or lunch-break tournament sessions.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700/60">
              <div className="flex items-center gap-1.5 font-cinzel text-amber-300 font-bold text-xs mb-1">
                <Clock size={14} className="text-amber-400" />
                <span>3. Time Blitz Mode (15 / 30 / 45 Minutes)</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                Strict countdown clock. When time expires, players finish the ongoing hand, and the team with the highest match score is declared champion!
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-600/40">
              <div className="flex items-center gap-1.5 font-cinzel text-emerald-300 font-bold text-xs mb-1">
                <Brain size={14} className="text-emerald-400" />
                <span>4. AI Intelligence Levels</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                <strong>Novice</strong> (honest straightforward play), <strong>Master</strong> (honor conservation & partner protection), and <strong>Legend</strong> (high-stakes King-Rescue, Ace-Decapitations, and Boston defense).
              </p>
            </div>
          </div>
        ),
        hi: (
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-amber-600/40">
              <div className="flex items-center gap-1.5 font-cinzel text-amber-300 font-bold text-xs mb-1">
                <Target size={14} className="text-amber-400" />
                <span>1. 100-पॉइंट सर्वाइवल मोड (मुख्य प्रारूप)</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                आधिकारिक चैंपियनशिप मैच। राउंड तब तक चलते रहते हैं जब तक कोई टीम 100 अंक नहीं छू लेती। 100 अंक तक पहुंचने वाली पहली टीम विजेता होती है।
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700/60">
              <div className="flex items-center gap-1.5 font-cinzel text-amber-300 font-bold text-xs mb-1">
                <Sliders size={14} className="text-amber-400" />
                <span>2. कस्टम पॉइंट मोड (50 / 60 अंक)</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                त्वरित खेल के लिए 50 या 60 अंक का लक्ष्य तय करें ताकि कम समय में विजेता का फैसला हो सके।
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700/60">
              <div className="flex items-center gap-1.5 font-cinzel text-amber-300 font-bold text-xs mb-1">
                <Clock size={14} className="text-amber-400" />
                <span>3. टाइम ब्लिट्ज़ मोड (15 / 30 / 45 मिनट)</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                उलटी गिनती वाला टाइमर चलता है। समय समाप्त होने पर चल रहा हाथ पूरा होता है और सर्वाधिक कुल स्कोर वाली टीम जीतती है।
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-600/40">
              <div className="flex items-center gap-1.5 font-cinzel text-emerald-300 font-bold text-xs mb-1">
                <Brain size={14} className="text-emerald-400" />
                <span>4. एआई बुद्धिमत्ता स्तर</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                <strong>नॉविस</strong> (सीधा खेल), <strong>मास्टर</strong> (बड़े पत्तों की बचत व साझेदारी), एवं <strong>लेजेंड</strong> (बादशाह बचाओ वार, तुरुप इक्का वध, और 10+ बोली का जोखिम)।
              </p>
            </div>
          </div>
        ),
        or: (
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-amber-600/40">
              <div className="flex items-center gap-1.5 font-cinzel text-amber-300 font-bold text-xs mb-1">
                <Target size={14} className="text-amber-400" />
                <span>୧. ୧୦୦-ପଏଣ୍ଟ୍ ସର୍ଭାଇଭାଲ୍ ମୋଡ୍ (ମୁଖ୍ୟ ମ୍ୟାଚ୍)</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                ସର୍ବାଧିକ ଲୋକପ୍ରିୟ ଚାମ୍ପିଅନସିପ୍ ଫର୍ମାଟ୍। ଯେପର୍ଯ୍ୟନ୍ତ କୌଣସି ଦଳ ୧୦୦ ପଏଣ୍ଟ୍ ସ୍ପର୍ଶ ନକରିଛନ୍ତି ରାଉଣ୍ଡ୍ ପରେ ରାଉଣ୍ଡ୍ ଚାଲିବ। ୧୦୦ ପଏଣ୍ଟ୍ ଛୁଇଁଥିବା ପ୍ରଥମ ଦଳ ବିଜେତା।
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700/60">
              <div className="flex items-center gap-1.5 font-cinzel text-amber-300 font-bold text-xs mb-1">
                <Sliders size={14} className="text-amber-400" />
                <span>୨. କଷ୍ଟମ୍ ଟାର୍ଗେଟ୍ ମୋଡ୍ (୫୦ / ୬୦ ପଏଣ୍ଟ୍)</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                ସ୍ୱଳ୍ପ ସମୟର ଖେଳ ପାଇଁ ଉଦ୍ଦିଷ୍ଟ। ନିଜ ସୁବିଧା ଅନୁସାରେ ୫୦ ବା ୬୦ ପଏଣ୍ଟ୍‌ର ଲକ୍ଷ୍ୟ ରଖି କମ୍ ରାଉଣ୍ଡ୍‌ରେ ବିଜେତା ନିର୍ଣ୍ଣୟ କରନ୍ତୁ।
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700/60">
              <div className="flex items-center gap-1.5 font-cinzel text-amber-300 font-bold text-xs mb-1">
                <Clock size={14} className="text-amber-400" />
                <span>୩. ଟାଇମ୍ ବ୍ଲିଟ୍ଜ୍ ମୋଡ୍ (୧୫ / ୩୦ / ୪୫ ମିନିଟ୍)</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                ନିର୍ଦ୍ଧାରିତ ଟାଇମର୍ ସହିତ ଖେଳ। ସମୟ ସରିବା କ୍ଷଣି ଚାଲୁଥିବା ହାତଟି ପୂରା ଖେଳାଯାଏ ଏବଂ ଶେଷରେ ଯାହାର ସର୍ବାଧିକ ପଏଣ୍ଟ୍ ଥିବ ସେହି ଦଳ ଚାମ୍ପିଅନ୍ ହୁଅନ୍ତି।
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-600/40">
              <div className="flex items-center gap-1.5 font-cinzel text-emerald-300 font-bold text-xs mb-1">
                <Brain size={14} className="text-emerald-400" />
                <span>୪. ଏଆଇ ବୁଦ୍ଧିମତା ସ୍ତରର ବିଶେଷତା</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                <strong>ନଭିସ୍</strong> (ସରଳ ଖେଳ), <strong>ମାଷ୍ଟର୍</strong> (ସହଭାଗୀ ରକ୍ଷା ଓ ବଡ଼ ତାସ୍ ସାଇତିବା), ଏବଂ <strong>ଲିଜେଣ୍ଡ୍</strong> (ଚତୁର ବିଡ୍, ସାହେବ୍ ବଞ୍ଚାଅ ଚାଲ୍ ଓ ତୁରୁପ୍ ଟିକ୍କା ଶିକାର)।
              </p>
            </div>
          </div>
        ),
      },
    },

    // Step 4: Hand Playability & Minimum 6-Bid
    {
      badge: {
        en: 'Step 4 of 7 · Fairness Rules',
        hi: 'चरण 4 / 7 · निष्पक्षता नियम',
        or: 'ପର୍ଯ୍ୟାୟ ୪ / ୭ · ନ୍ୟାୟସଙ୍ଗତ ନିୟମ',
      },
      title: {
        en: 'Hand Playability & 6-Bid Threshold',
        hi: 'हाथ की खेल-योग्यता एवं 6-बोली नियम',
        or: 'ହାତ ଖେଳ ଯୋଗ୍ୟତା ଏବଂ ୬-ବିଡ୍ ସୀମା',
      },
      subtitle: {
        en: 'Guaranteed exciting hands: No unplayable deals or boring low-bid games.',
        hi: 'रोमांचक खेल की गारंटी: कोई कमजोर हाथ नहीं और न ही उबाऊ कम-बोली वाला खेल।',
        or: 'ରୋମାଞ୍ଚକର ଖେଳ ନିଶ୍ଚିତତା: କୌଣସି ଦୁର୍ବଳ ହାତ ବା ବିରକ୍ତିକର କମ୍ ବିଡ୍ ରହିବ ନାହିଁ।',
      },
      icon: <ShieldAlert className="text-amber-400" size={26} />,
      content: {
        en: (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-amber-600/40">
              <h4 className="font-cinzel font-bold text-amber-300 text-xs mb-1 flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Hand Playability Rule (Mandatory Qualifying Card)</span>
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                If any player holds <strong>no Face card (A, K, Q, J)</strong>, <strong>no Trump card</strong>, and <strong>no Joker</strong>, that hand cannot be played. All four players must hold at least one! If violated, cards automatically reshuffle.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-amber-600/40">
              <h4 className="font-cinzel font-bold text-amber-300 text-xs mb-1 flex items-center gap-1.5">
                <RotateCcw size={15} className="text-amber-400" />
                <span>Minimum 6-Bid Reshuffle Rule</span>
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                If neither team bids <strong>6 or more</strong> (i.e. both Team 1 and Team 2 bids are below 6), play will not happen. The deck is automatically gathered, reshuffled, and dealt by the next dealer without penalties!
              </p>
            </div>
          </div>
        ),
        hi: (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-amber-600/40">
              <h4 className="font-cinzel font-bold text-amber-300 text-xs mb-1 flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>हाथ की खेल-योग्यता नियम (अनिवार्य योग्यता पत्ता)</span>
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                यदि किसी भी खिलाड़ी के पास <strong>कोई फेस कार्ड (A, K, Q, J)</strong>, <strong>कोई तुरुप</strong>, और <strong>कोई जोकर</strong> नहीं है, तो खेल नहीं हो सकता। चारों के पास इनमें से कम से कम एक पत्ता होना अनिवार्य है। उल्लंघन पर स्वतः नए पत्ते बांटे जाएंगे।
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-amber-600/40">
              <h4 className="font-cinzel font-bold text-amber-300 text-xs mb-1 flex items-center gap-1.5">
                <RotateCcw size={15} className="text-amber-400" />
                <span>न्यूनतम 6-बोली रेशफल नियम</span>
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                यदि दोनों में से किसी भी टीम की बोली <strong>6 या उससे अधिक नहीं पहुंचती</strong> (दोनों 6 से कम पर रहती हैं), तो खेल नहीं होगा। पत्ते बिना किसी पेनल्टी के तुरंत दोबारा बांटे जाएंगे!
              </p>
            </div>
          </div>
        ),
        or: (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-amber-600/40">
              <h4 className="font-cinzel font-bold text-amber-300 text-xs mb-1 flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>ହାତ ଖେଳ ଯୋଗ୍ୟତା ନିୟମ (ଅନିବାର୍ଯ୍ୟ ବଡ଼ ତାସ୍)</span>
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                ଯଦି କୌଣସି ଖେଳାଳିଙ୍କ ପାଖରେ <strong>କୌଣସି ବଡ଼ ପତ୍ର (A, K, Q, J)</strong>, <strong>ତୁରୁପ୍ ତାସ୍</strong>, କିମ୍ବା <strong>ଜୋକର୍</strong> ନଥାଏ, ତେବେ ଖେଳ ହୋଇପାରିବ ନାହିଁ। ସମସ୍ତଙ୍କ ପାଖରେ ଅନ୍ତତଃ ଗୋଟିଏ ଥିବା ବାଧ୍ୟତାମୂଳକ। ନଚେତ୍ ଆପେ ଆପେ ପୁଣି ବଣ୍ଟାଯିବ।
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-amber-600/40">
              <h4 className="font-cinzel font-bold text-amber-300 text-xs mb-1 flex items-center gap-1.5">
                <RotateCcw size={15} className="text-amber-400" />
                <span>ସର୍ବନିମ୍ନ ୬-ବିଡ୍ ରିଶଫଲ୍ ନିୟମ</span>
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                ଯଦି କୌଣସି ଦଳର ଡାକ <strong>୬ କିମ୍ବା ତା’ଠାରୁ ଅଧିକ ନହୁଏ</strong>, ତେବେ ସେହି ହାତ ଖେଳାଯିବ ନାହିଁ। ବିନା କୌଣସି ପେନାଲ୍ଟିରେ କାର୍ଡଗୁଡ଼ିକ ତୁରନ୍ତ ପରବର୍ତ୍ତୀ ଡିଲର୍‌ଙ୍କ ଦ୍ୱାରା ପୁଣି ବଣ୍ଟାଯିବ!
              </p>
            </div>
          </div>
        ),
      },
    },

    // Step 5: Bidding & Team Contract
    {
      badge: {
        en: 'Step 5 of 7 · Bidding',
        hi: 'चरण 5 / 7 · बोली प्रणाली',
        or: 'ପର୍ଯ୍ୟାୟ ୫ / ୭ · ବିଡିଂ ନିୟମ',
      },
      title: {
        en: 'Partnership Bidding & Contracts',
        hi: 'साझेदारी बोली एवं कॉन्ट्रैक्ट',
        or: 'ସହଭାଗୀ ଡାକ ଏବଂ କଣ୍ଟ୍ରାକ୍ଟ',
      },
      subtitle: {
        en: 'Combine forces with partner Hriday to win your required trick target.',
        hi: 'अपने साथी हृदय के साथ मिलकर जीतने वाले हाथों का सही लक्ष्य तय करें।',
        or: 'ନିଜ ସାଥୀ ହୃଦୟଙ୍କ ସହ ମିଶି ଜିତିବା ଲକ୍ଷ୍ୟ ସ୍ଥିର କରନ୍ତୁ।',
      },
      icon: <Layers className="text-amber-400" size={26} />,
      content: {
        en: (
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <span className="font-cinzel text-amber-300 font-bold block mb-1">0 to 13 Individual Bids</span>
              <p className="text-neutral-300 leading-relaxed">
                Each player bids their estimated trick count. You can bid 0 (nil), but your team combined total must reach at least 2.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <span className="font-cinzel text-amber-300 font-bold block mb-1">Team Minimum 2 Tricks (0+0 &rarr; 2)</span>
              <p className="text-neutral-300 leading-relaxed">
                If both partners bid 0, the team contract automatically defaults to 2 tricks.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/40">
              <span className="font-cinzel text-emerald-300 font-bold block mb-1">Contract Scoring</span>
              <p className="text-neutral-300 leading-relaxed">
                Make your bid: <strong>+Bid points</strong>. Miss your bid: <strong>-Bid points</strong>. Bids of 10+ award <strong>double points (+20 / +26)</strong>!
              </p>
            </div>
          </div>
        ),
        hi: (
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <span className="font-cinzel text-amber-300 font-bold block mb-1">0 से 13 तक व्यक्तिगत बोली</span>
              <p className="text-neutral-300 leading-relaxed">
                प्रत्येक खिलाड़ी अपने पत्तों के अनुसार बोली लगाता है। आप 0 भी बोल सकते हैं, लेकिन टीम का कुल योग कम से कम 2 होना चाहिए।
              </p>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <span className="font-cinzel text-amber-300 font-bold block mb-1">टीम की न्यूनतम बोली 2 (0+0 पर डिफ़ॉल्ट 2)</span>
              <p className="text-neutral-300 leading-relaxed">
                यदि दोनों साथी 0 बोलते हैं, तो टीम की बोली स्वतः 2 मान ली जाती है।
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/40">
              <span className="font-cinzel text-emerald-300 font-bold block mb-1">कॉन्ट्रैक्ट स्कोरिंग</span>
              <p className="text-neutral-300 leading-relaxed">
                बोली पूरी होने पर <strong>+बोली अंक</strong>। न बनने पर <strong>-बोली अंक</strong>। 10+ बोली पर <strong>दोगुने अंक (+20 / +26)</strong> मिलते हैं!
              </p>
            </div>
          </div>
        ),
        or: (
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <span className="font-cinzel text-amber-300 font-bold block mb-1">୦ ରୁ ୧୩ ବ୍ୟକ୍ତିଗତ ଡାକ</span>
              <p className="text-neutral-300 leading-relaxed">
                ପ୍ରତ୍ୟେକ ଖେଳାଳି ନିଜ ଆକଳନ ଅନୁସାରେ ଡାକିବେ। ଆପଣ ୦ ମଧ୍ୟ ଡାକିପାରିବେ, କିନ୍ତୁ ଟିମ୍‌ର ମୋଟ୍ ଅନ୍ତତଃ ୨ ହେବା ଜରୁରୀ।
              </p>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <span className="font-cinzel text-amber-300 font-bold block mb-1">ଟିମ୍ ସର୍ବନିମ୍ନ ୨ ଟ୍ରିକ୍ (୦+୦ ହେଲେ ୨)</span>
              <p className="text-neutral-300 leading-relaxed">
                ଯଦି ଉଭୟ ସାଥୀ ୦ ଡାକନ୍ତି, ତେବେ ଟିମ୍ ବିଡ୍ ଆପେ ଆପେ ୨ ହୋଇଯିବ।
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/40">
              <span className="font-cinzel text-emerald-300 font-bold block mb-1">କଣ୍ଟ୍ରାକ୍ଟ ସ୍କୋରିଂ</span>
              <p className="text-neutral-300 leading-relaxed">
                ବିଡ୍ ସଫଳ ହେଲେ <strong>+ବିଡ୍ ପଏଣ୍ଟ୍</strong>। ବିଫଳ ହେଲେ <strong>-ବିଡ୍ ପଏଣ୍ଟ୍</strong>। ୧୦+ ବିଡ୍ ଜିତିଲେ <strong>ଦୁଇଗୁଣା ପଏଣ୍ଟ୍ (+୨୦ / +୨୬)</strong>!
              </p>
            </div>
          </div>
        ),
      },
    },

    // Step 6: Dadaji Joker Playing Rules (ଜୋକର୍ ଖେଳିବା ନିୟମ)
    {
      badge: {
        en: 'Step 6 of 7 · Joker Combat',
        hi: 'चरण 6 / 7 · जोकर खेलने के नियम',
        or: 'ପର୍ଯ୍ୟାୟ ୬ / ୭ · ଜୋକର୍ ଖେଳିବା ନିୟମ',
      },
      title: {
        en: 'Dadaji Joker Combat Rules',
        hi: 'दादाजी जोकर खेलने के नियम',
        or: 'ଦାଦାଜୀ ଜୋକର୍ ଖେଳିବା ନିୟମ',
      },
      subtitle: {
        en: 'The supreme power in rounds 2–12, with tactical restrictions.',
        hi: 'राउंड 2 से 12 में सर्वोच्च शक्ति, परंतु कुछ रणनीतिक सीमाओं के साथ।',
        or: 'ରାଉଣ୍ଡ୍ ୨ ରୁ ୧୨ ମଧ୍ୟରେ ଅଖଣ୍ଡ କ୍ଷମତା, କିଛି ରଣନୈତିକ ନିୟମ ସହିତ।',
      },
      icon: <Zap className="text-amber-400" size={26} />,
      content: {
        en: (
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-600/40">
              <span className="font-cinzel text-rose-300 font-bold block mb-1">Trick 1 Ban</span>
              <p className="text-neutral-300 leading-relaxed">
                The Joker is denied ONLY in Trick 1. You cannot lead or play it in the first round.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/40">
              <span className="font-cinzel text-emerald-300 font-bold block mb-1">Free Strike (Tricks 2–13)</span>
              <p className="text-neutral-300 leading-relaxed">
                You can play the Joker anytime during tricks 2–13, even if you hold cards of the led suit!
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/40">
              <span className="font-cinzel text-amber-300 font-bold block mb-1">Leading with Joker & Trick 13</span>
              <p className="text-neutral-300 leading-relaxed">
                Do not lead a round with Joker unless forced. If led, or if played in Trick 13, it counts strictly as <strong>Two of Spades (କଳା ପାନ୍ ଦୁଇ / 2♠)</strong>!
              </p>
            </div>
          </div>
        ),
        hi: (
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-600/40">
              <span className="font-cinzel text-rose-300 font-bold block mb-1">पहले राउंड (Trick 1) में पूर्ण प्रतिबंध</span>
              <p className="text-neutral-300 leading-relaxed">
                पहले राउंड में जोकर चलाना या उससे चाल शुरू करना बिल्कुल मना है।
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/40">
              <span className="font-cinzel text-emerald-300 font-bold block mb-1">राउंड 2 से 13 में स्वतंत्र उपयोग</span>
              <p className="text-neutral-300 leading-relaxed">
                राउंड 2 से 13 में आप किसी भी समय जोकर खेल सकते हैं, चाहे आपके पास चली गई चाल के रंग का पत्ता क्यों न हो!
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/40">
              <span className="font-cinzel text-amber-300 font-bold block mb-1">जोकर से चाल चलना एवं 13वां राउंड</span>
              <p className="text-neutral-300 leading-relaxed">
                जोकर से चाल शुरू न करें। यदि जोकर से चाल शुरू की जाए या 13वें राउंड में खेला जाए, तो वह केवल <strong>हुकुम की दुक्की (2♠)</strong> मानी जाती है!
              </p>
            </div>
          </div>
        ),
        or: (
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-600/40">
              <span className="font-cinzel text-rose-300 font-bold block mb-1">ପ୍ରଥମ ରାଉଣ୍ଡ୍‌ରେ ସମ୍ପୂର୍ଣ୍ଣ ବାରଣ</span>
              <p className="text-neutral-300 leading-relaxed">
                ପ୍ରଥମ ରାଉଣ୍ଡ୍ (Trick 1) ରେ ଜୋକର୍ ଚଳାଇବା କିମ୍ବା ଜୋକର୍ ଦେଇ ଚାଲ୍ ଆରମ୍ଭ କରିବା ସମ୍ପୂର୍ଣ୍ଣ ନିଷେଧ।
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/40">
              <span className="font-cinzel text-emerald-300 font-bold block mb-1">ରାଉଣ୍ଡ୍ ୨ ରୁ ୧୩ ମଧ୍ୟରେ ମୁକ୍ତ ବ୍ୟବହାର</span>
              <p className="text-neutral-300 leading-relaxed">
                ଚାଲୁଥିବା ରଙ୍ଗ ପାଖରେ ଥିଲେ ସୁଦ୍ଧା ଆପଣ ଯେକୌଣସି ସମୟରେ ଜୋକର୍ ପକାଇ ହାତ ଛଡ଼ାଇ ନେଇପାରିବେ!
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/40">
              <span className="font-cinzel text-amber-300 font-bold block mb-1">ଜୋକର୍ ସହ ଚାଲ୍ ଆରମ୍ଭ ଏବଂ ୧୩ତମ ରାଉଣ୍ଡ୍</span>
              <p className="text-neutral-300 leading-relaxed">
                ଜୋକର୍ ଦେଇ ଚାଲ୍ ଆରମ୍ଭ କଲେ କିମ୍ବା ୧୩ତମ ରାଉଣ୍ଡ୍‌ରେ ଖେଳିଲେ ଏହା କେବଳ <strong>କଳା ପାନ୍ ଦୁଇ (2♠)</strong> ଭାବେ ଗଣାଯାଏ!
              </p>
            </div>
          </div>
        ),
      },
    },

    // Step 7: Show Hand Victory & Rulebook Languages
    {
      badge: {
        en: 'Step 7 of 7 · Show Hand Claim',
        hi: 'चरण 7 / 7 · शो हैंड दावा',
        or: 'ପର୍ଯ୍ୟାୟ ୭ / ୭ · ଶୋ’ ହ୍ୟାଣ୍ଡ୍ ଦାବି',
      },
      title: {
        en: 'Show Hand & Accelerated Victory',
        hi: 'शो हैंड एवं तेजी से जीत',
        or: 'ଶୋ’ ହ୍ୟାଣ୍ଡ୍ ଏବଂ ଶୀଘ୍ର ବିଜୟ',
      },
      subtitle: {
        en: 'Claim remaining contract tricks when you are 100% sure of victory.',
        hi: 'जब जीत शत-प्रतिशत तय हो, तो पत्ते दिखाकर हाथ का तुरंत दावा करें।',
        or: 'ଯେତେବେଳେ ଜିତିବା ୧୦୦% ନିଶ୍ଚିତ, ତାସ୍ ଦେଖାଇ ହାତର ତୁରନ୍ତ ଦାବି କରନ୍ତୁ।',
      },
      icon: <Sparkles className="text-amber-400" size={26} />,
      content: {
        en: (
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <span className="font-cinzel text-amber-300 font-bold block mb-1">Interactive Card Selection</span>
              <p className="text-neutral-300 leading-relaxed">
                When opponents make their bid, South can click <strong>"Show Hand"</strong> and interactively select the exact winning cards.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/40">
              <span className="font-cinzel text-emerald-300 font-bold block mb-1">Instant System Verification</span>
              <p className="text-neutral-300 leading-relaxed">
                The game engine mathematically verifies that your cards are unassailable against all opponent cards. If valid, contract is fulfilled immediately!
              </p>
            </div>
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-600/40">
              <span className="font-cinzel text-rose-300 font-bold block mb-1">Penalty on Flawed Claim</span>
              <p className="text-neutral-300 leading-relaxed">
                If opponents hold higher trumps or ruff cards that defeat your claim: <strong>Penalty = Total Score − Current Bid</strong> is deducted from your match score!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-700/50 flex items-center justify-between mt-2">
              <div>
                <span className="font-cinzel text-amber-200 font-bold block text-xs">Complete Rulebook</span>
                <span className="text-neutral-400 text-[11px]">8 chapters covering suits, bidding, and scoring.</span>
              </div>
              <button
                type="button"
                onClick={handleOpenRulebookFromTour}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 text-xs font-cinzel font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <BookOpen size={13} />
                <span>Open Book</span>
              </button>
            </div>
          </div>
        ),
        hi: (
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <span className="font-cinzel text-amber-300 font-bold block mb-1">पत्तों का चयन करके दावा</span>
              <p className="text-neutral-300 leading-relaxed">
                जब विरोधी अपनी बोली जीत चुके हों, तो आप <strong>"शो हैंड"</strong> दबाकर जीतने वाले पत्ते स्वयं चुन सकते हैं।
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/40">
              <span className="font-cinzel text-emerald-300 font-bold block mb-1">सिस्टम द्वारा तत्काल जांच</span>
              <p className="text-neutral-300 leading-relaxed">
                खेल इंजन गणितीय रूप से जाँचेगा कि आपके पत्ते विरोधियों के खिलाफ अजेय हैं। यदि सही हुआ, तो हाथ तुरंत जीत लिया जाएगा!
              </p>
            </div>
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-600/40">
              <span className="font-cinzel text-rose-300 font-bold block mb-1">गलत दावे पर सख्त जुर्माना</span>
              <p className="text-neutral-300 leading-relaxed">
                यदि विरोधियों के पास बड़ा पत्ता निकला: <strong>जुर्माना = कुल स्कोर − वर्तमान बोली</strong>, अर्थात टीम के कुल अंकों में से बोली के बराबर अंक कट जाएंगे!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-700/50 flex items-center justify-between mt-2">
              <div>
                <span className="font-cinzel text-amber-200 font-bold block text-xs">विस्तृत नियम पुस्तिका</span>
                <span className="text-neutral-400 text-[11px]">8 अध्याय: रंग, बोली, जोकर और स्कोरिंग के सारे नियम।</span>
              </div>
              <button
                type="button"
                onClick={handleOpenRulebookFromTour}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 text-xs font-cinzel font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <BookOpen size={13} />
                <span>पुस्तिका खोलें</span>
              </button>
            </div>
          </div>
        ),
        or: (
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <span className="font-cinzel text-amber-300 font-bold block mb-1">ତାସ୍ ବାଛି ଦାବି କରିବା</span>
              <p className="text-neutral-300 leading-relaxed">
                ଯେତେବେଳେ ବିପକ୍ଷ ଟିମ୍ ବିଡ୍ କରିସାରିଛି, ଆପଣ <strong>"ଶୋ’ ହ୍ୟାଣ୍ଡ୍"</strong> ଦବାଇ ଜିତିବା ତାସ୍‌ଗୁଡ଼ିକ ଚୟନ କରିପାରିବେ।
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/40">
              <span className="font-cinzel text-emerald-300 font-bold block mb-1">ସିଷ୍ଟମ୍ ଦ୍ୱାରା ତୁରନ୍ତ ଯାଞ୍ଚ</span>
              <p className="text-neutral-300 leading-relaxed">
                ସିଷ୍ଟମ୍ ଯାଞ୍ଚ କରିବ ଯେ ଆପଣଙ୍କ ତାସ୍ ଅପରାଜେୟ କି ନୁହେଁ। ଯଦି ସଠିକ୍ ହୁଏ, ଖେଳ ତୁରନ୍ତ ଜିତିଯିବେ!
              </p>
            </div>
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-600/40">
              <span className="font-cinzel text-rose-300 font-bold block mb-1">ଭୁଲ୍ ଦାବିରେ କଠୋର ଦଣ୍ଡ</span>
              <p className="text-neutral-300 leading-relaxed">
                ଯଦି ବିପକ୍ଷଙ୍କ ପାଖରେ ବଡ଼ ତାସ୍ ବାହାରେ: <strong>ଦଣ୍ଡ = ସମୁଦାୟ ସ୍କୋର୍ − ବର୍ତ୍ତମାନର ବିଡ୍</strong>, ମୋଟ୍ ସ୍କୋର୍‌ରୁ ପୂରା ବିଡ୍ ପଏଣ୍ଟ୍ କଟିଯିବ!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-700/50 flex items-center justify-between mt-2">
              <div>
                <span className="font-cinzel text-amber-200 font-bold block text-xs">ସମ୍ପୂର୍ଣ୍ଣ ନିୟମ ପୁସ୍ତକ</span>
                <span className="text-neutral-400 text-[11px]">୮ଟି ଅଧ୍ୟାୟ: ରଙ୍ଗ ନାମାବଳୀ, ବିଡିଂ, ଜୋକର୍ ଖେଳିବା ନିୟମ ଓ ସ୍କୋରିଂ।</span>
              </div>
              <button
                type="button"
                onClick={handleOpenRulebookFromTour}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 text-xs font-cinzel font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <BookOpen size={13} />
                <span>ପୁସ୍ତିକା ଖୋଲନ୍ତୁ</span>
              </button>
            </div>
          </div>
        ),
      },
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#2A150D] via-[#1A0C08] to-[#0F0704] border-2 border-amber-600/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-outfit text-neutral-200 max-h-[92dvh]">
        {/* Top Windows Update style progress bar */}
        <div className="h-1.5 w-full bg-neutral-900 overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Header with Step and Language Switcher */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-amber-950/80 via-neutral-900 to-amber-950/80 border-b border-amber-800/40 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 font-cinzel">
              {currentStepData.badge[language]}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSelector
              currentLanguage={language}
              onSelectLanguage={handleLanguageChange}
              size="xs"
              showIcon
            />

            <button
              type="button"
              onClick={handleSkip}
              title="Skip Tour"
              className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center flex-shrink-0 shadow-inner">
                {currentStepData.icon}
              </div>
              <div>
                <h3 className="font-cinzel text-lg sm:text-xl font-bold text-amber-200">
                  {currentStepData.title[language]}
                </h3>
                <p className="text-xs text-amber-300/80">
                  {currentStepData.subtitle[language]}
                </p>
              </div>
            </div>

            <div className="mt-3">
              {currentStepData.content[language]}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 pt-3">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentStep === idx
                    ? 'w-6 bg-amber-400 shadow-sm shadow-amber-500/50'
                    : 'w-2 bg-neutral-700 hover:bg-neutral-600'
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-neutral-950 border-t border-amber-800/40 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs font-cinzel font-semibold flex items-center gap-1 cursor-pointer transition-all"
              >
                <ChevronLeft size={14} />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSkip}
                className="px-3 py-2 text-xs text-neutral-400 hover:text-neutral-200 cursor-pointer font-cinzel"
              >
                Skip Tour
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-cinzel text-xs font-bold uppercase shadow-lg border border-amber-300 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-cinzel text-xs font-bold uppercase shadow-lg border border-emerald-400 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Play size={14} />
                <span>Play Now</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
