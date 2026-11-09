import React, { useState } from 'react';
import { Play, BookOpen, Volume2, VolumeX, Sparkles, Crown } from 'lucide-react';
import { RulesModal } from './RulesModal';
import { LanguageSelector } from './LanguageSelector';
import { getSavedRulebookLanguage, RulebookLanguage, saveRulebookLanguage } from '../utils/firstTimeUser';
import { sounds } from '../utils/audio';

interface StartPageProps {
  onStartGame: () => void;
}

export const StartPage: React.FC<StartPageProps> = ({ onStartGame }) => {
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [language, setLanguage] = useState<RulebookLanguage>(() => getSavedRulebookLanguage());
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => sounds.getMuted());
  const [isStarting, setIsStarting] = useState(false);
  const [hoveredCardIdx, setHoveredCardIdx] = useState<number | null>(null);

  const handleLanguageChange = (newLang: RulebookLanguage) => {
    setLanguage(newLang);
    saveRulebookLanguage(newLang);
  };

  const handleToggleSound = () => {
    const next = !isSoundMuted;
    sounds.setMuted(next);
    setIsSoundMuted(next);
    if (!next) {
      sounds.playClick();
    }
  };

  const handleStart = () => {
    if (isStarting) return;
    setIsStarting(true);
    sounds.playShuffleSound();
    // Brief cinematic delay for audio/transition feel
    setTimeout(() => {
      onStartGame();
    }, 280);
  };

  // 5 iconic cards representing the 4 kingdoms + the Dadaji Supreme Joker
  const showcaseCards = [
    {
      id: 'spades_A',
      title: 'Spades',
      sub: 'Hukam',
      src: '/assets/Indian_Playing_Cards/png/01_A_of_spades.png',
      rot: -18,
      tx: -48,
      ty: 8,
    },
    {
      id: 'hearts_A',
      title: 'Hearts',
      sub: 'Pan',
      src: '/assets/Indian_Playing_Cards/png/14_A_of_hearts.png',
      rot: -9,
      tx: -24,
      ty: 2,
    },
    {
      id: 'dadaji_joker',
      title: 'Dadaji Joker',
      sub: 'Supreme Trump',
      src: '/assets/Indian_Playing_Cards/png/53_Joker.png',
      rot: 0,
      tx: 0,
      ty: -12,
      isHero: true,
    },
    {
      id: 'diamonds_A',
      title: 'Diamonds',
      sub: 'Eent',
      src: '/assets/Indian_Playing_Cards/png/40_A_of_diamonds.png',
      rot: 9,
      tx: 24,
      ty: 2,
    },
    {
      id: 'clubs_A',
      title: 'Clubs',
      sub: 'Chidi',
      src: '/assets/Indian_Playing_Cards/png/27_A_of_clubs.png',
      rot: 18,
      tx: 48,
      ty: 8,
    },
  ];

  return (
    <div
      className={`relative w-full h-[100dvh] max-h-[100dvh] overflow-hidden select-none flex flex-col justify-between items-center px-4 py-4 sm:py-6 transition-opacity duration-300 ${
        isStarting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background:
          'radial-gradient(ellipse at 50% 40%, rgba(55, 22, 12, 0.95) 0%, rgba(22, 9, 5, 0.98) 60%, rgba(10, 4, 2, 1) 100%)',
      }}
    >
      {/* Subtle royal felt pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(245, 158, 11, 0.25) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Elegant golden corner filigree accents */}
      <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-500/50 rounded-tl-lg pointer-events-none" />
      <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-500/50 rounded-tr-lg pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-500/50 rounded-bl-lg pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-500/50 rounded-br-lg pointer-events-none" />

      {/* TOP HEADER: Clean Brand Identity */}
      <header className="relative z-10 flex flex-col items-center text-center mt-1 sm:mt-3">
        {/* Decorative Royal Eyebrow with Suit Sigils */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-700/40 text-[10px] sm:text-xs font-cinzel tracking-[0.25em] text-amber-300/90 uppercase mb-2 shadow-inner">
          <span className="text-amber-400">♠</span>
          <span className="text-rose-400">♥</span>
          <span>ROYAL INDIAN COURT</span>
          <span className="text-amber-400">♦</span>
          <span className="text-emerald-400">♣</span>
        </div>

        {/* Majestic Main Title */}
        <h1 className="font-cinzel text-3xl sm:text-5xl md:text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] uppercase">
          The Ultimate Colors
        </h1>

        {/* Elegant Subtitle */}
        <p className="font-script text-lg sm:text-2xl text-amber-200/90 font-medium tracking-wide mt-1">
          52 Cards · 4 Kingdoms · The Supreme Dadaji Joker
        </p>
      </header>

      {/* CENTERPIECE: 60FPS Low-Memory Card Fan Animation */}
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center justify-center my-auto py-2">
        {/* Soft Golden Ambient Halo (Pure GPU compositor) */}
        <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-amber-600/25 via-amber-500/15 to-transparent blur-3xl pointer-events-none animate-royal-pulse" />

        {/* Floating Card Fan Container */}
        <div
          className="relative flex items-center justify-center w-72 sm:w-96 h-44 sm:h-60 my-auto animate-royal-float cursor-pointer group select-none"
          onClick={handleStart}
          title="Click to Enter Game Table"
        >
          {showcaseCards.map((card, idx) => {
            const isHero = card.isHero;
            const isHovered = hoveredCardIdx === idx;
            // Expand slightly on hover
            const multiplier = isHovered ? 1.25 : 1;
            const currentRot = card.rot * multiplier;
            const currentTx = card.tx * multiplier;
            const currentTy = isHovered ? card.ty - 14 : card.ty;
            const zIndex = isHero ? 30 : idx === 1 || idx === 3 ? 20 : 10;

            return (
              <div
                key={card.id}
                onMouseEnter={() => setHoveredCardIdx(idx)}
                onMouseLeave={() => setHoveredCardIdx(null)}
                className="absolute left-1/2 top-1/2 transition-all duration-300 ease-out select-none"
                style={{
                  zIndex,
                  transform: `translate3d(calc(-50% + ${currentTx}px), calc(-50% + ${currentTy}px), 0) rotate(${currentRot}deg) scale(${
                    isHero ? (isHovered ? 1.18 : 1.1) : isHovered ? 1.06 : 0.98
                  })`,
                  willChange: 'transform',
                }}
              >
                <div
                  className={`relative rounded-xl overflow-hidden shadow-2xl transition-all duration-200 ${
                    isHero
                      ? 'w-24 sm:w-32 md:w-36 aspect-[2.5/3.5] ring-2 ring-amber-400 shadow-[0_16px_36px_rgba(245,158,11,0.45)]'
                      : 'w-20 sm:w-28 md:w-32 aspect-[2.5/3.5] border border-amber-800/60 shadow-[0_10px_22px_rgba(0,0,0,0.75)]'
                  }`}
                >
                  <img
                    src={card.src}
                    alt={card.title}
                    className="w-full h-full object-cover rounded-xl pointer-events-none"
                    loading="eager"
                  />
                  {/* Hero card badge */}
                  {isHero && (
                    <div className="absolute bottom-1 inset-x-1 py-0.5 rounded bg-black/85 backdrop-blur-sm border border-amber-400/90 text-center">
                      <span className="text-[9px] sm:text-[10px] font-cinzel font-bold text-amber-300 flex items-center justify-center gap-1">
                        <Crown size={10} className="text-amber-400 fill-amber-400" />
                        JOKER
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Four Suit Highlights Beneath Fan */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-3 text-xs font-cinzel">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-base text-slate-200">♠</span>
            <span className="text-[11px] font-bold tracking-wider">SPADES</span>
          </div>
          <span className="text-amber-700/60 font-bold">•</span>
          <div className="flex items-center gap-1.5 text-rose-300">
            <span className="text-base text-rose-400">♥</span>
            <span className="text-[11px] font-bold tracking-wider">HEARTS</span>
          </div>
          <span className="text-amber-700/60 font-bold">•</span>
          <div className="flex items-center gap-1.5 text-amber-300">
            <span className="text-base text-amber-400">♦</span>
            <span className="text-[11px] font-bold tracking-wider">DIAMONDS</span>
          </div>
          <span className="text-amber-700/60 font-bold">•</span>
          <div className="flex items-center gap-1.5 text-emerald-300">
            <span className="text-base text-emerald-400">♣</span>
            <span className="text-[11px] font-bold tracking-wider">CLUBS</span>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION SECTION: Ultra Minimal, Zero Clutter */}
      <footer className="relative z-10 w-full max-w-md flex flex-col items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
        {/* Primary Call to Action Button */}
        <button
          type="button"
          onClick={handleStart}
          disabled={isStarting}
          className="group relative w-full sm:w-80 py-3.5 sm:py-4 px-8 rounded-2xl bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 text-neutral-950 font-cinzel font-black text-base sm:text-lg tracking-widest uppercase shadow-[0_8px_24px_rgba(217,119,6,0.45)] hover:shadow-[0_12px_32px_rgba(245,158,11,0.6)] active:scale-98 hover:scale-[1.02] transition-all cursor-pointer border border-amber-300 flex items-center justify-center gap-3"
        >
          {/* Subtle inner highlight */}
          <div className="absolute inset-x-2 top-0.5 h-[1px] bg-white/60 rounded-full" />
          <Play size={20} className="fill-neutral-950 transition-transform group-hover:scale-110" />
          <span>PLAY NOW</span>
          <Sparkles size={18} className="text-amber-900 group-hover:rotate-12 transition-transform" />
        </button>

        {/* Minimal Secondary Navigation & Preferences */}
        <div className="flex items-center justify-between w-full sm:w-80 px-2 gap-2">
          {/* How to play / Rules button */}
          <button
            type="button"
            onClick={() => setIsRulesOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-amber-700/50 hover:border-amber-400 text-amber-200/90 hover:text-white transition-all text-xs font-cinzel font-semibold cursor-pointer"
          >
            <BookOpen size={14} className="text-amber-400" />
            <span>Rules</span>
          </button>

          {/* Clean Language Selector */}
          <LanguageSelector
            currentLanguage={language}
            onSelectLanguage={handleLanguageChange}
            size="xs"
            showIcon
            showLabel={false}
          />

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            title={isSoundMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-amber-700/50 hover:border-amber-400 text-amber-300 hover:text-white transition-all cursor-pointer"
          >
            {isSoundMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>

        {/* Subtle partnership note */}
        <p className="text-[10px] sm:text-[11px] font-outfit text-amber-500/70 tracking-wide text-center">
          Team 1 (You & Hriday) vs Team 2 (Mainaa & Shilaa) · Target 100 Points
        </p>
      </footer>

      {/* Rules Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        initialLanguage={language}
        onLanguageChange={handleLanguageChange}
      />
    </div>
  );
};
