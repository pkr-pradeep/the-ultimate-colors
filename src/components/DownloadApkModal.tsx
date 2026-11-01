import React, { useState, useEffect } from 'react';
import { RulebookLanguage, getSavedRulebookLanguage, saveRulebookLanguage } from '../utils/firstTimeUser';
import { usePWAInstall } from '../utils/usePWAInstall';
import { LanguageSelector } from './LanguageSelector';
import { MODAL_TRANSLATIONS } from '../data/modalTranslations';
import {
  Download,
  Smartphone,
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink,
  Share2,
  WifiOff,
  Maximize2,
  X,
  Layers,
} from 'lucide-react';

interface DownloadApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: RulebookLanguage;
  onLanguageChange?: (lang: RulebookLanguage) => void;
}

export const DownloadApkModal: React.FC<DownloadApkModalProps> = ({
  isOpen,
  onClose,
  language: controlledLang,
  onLanguageChange,
}) => {
  const [localLang, setLocalLang] = useState<RulebookLanguage>(controlledLang || getSavedRulebookLanguage());
  const [copied, setCopied] = useState(false);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  useEffect(() => {
    if (controlledLang) {
      setLocalLang(controlledLang);
    } else {
      setLocalLang(getSavedRulebookLanguage());
    }
  }, [isOpen, controlledLang]);

  if (!isOpen) return null;

  const activeLang = controlledLang || localLang;
  const t = (MODAL_TRANSLATIONS[activeLang] || MODAL_TRANSLATIONS.en).downloadApk;

  const handleLangChange = (lang: RulebookLanguage) => {
    setLocalLang(lang);
    saveRulebookLanguage(lang);
    onLanguageChange?.(lang);
  };

  const appUrl =
    typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
      ? window.location.href.split('?')[0]
      : 'https://ais-pre-l5rhnvopdd4gzn6bvgginp-940395642598.asia-southeast1.run.app';

  const handleCopyUrl = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(appUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Ignored
    }
  };

  const handleOpenPwaBuilder = () => {
    const builderUrl = `https://www.pwabuilder.com/?url=${encodeURIComponent(appUrl)}`;
    window.open(builderUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDirectInstall = async () => {
    if (isInstallable) {
      await install();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-neutral-950/85 backdrop-blur-md animate-fade-in font-outfit select-none">
      <div className="relative w-full max-w-2xl max-h-[92dvh] overflow-y-auto bg-gradient-to-b from-[#2A150D] via-[#1A0C08] to-[#0F0704] border-2 border-amber-600/70 rounded-3xl p-5 sm:p-7 shadow-2xl text-amber-100 flex flex-col">
        {/* Top Controls: Language Toggle & Close Button */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-800/40 gap-2 flex-wrap">
          <LanguageSelector
            currentLanguage={activeLang}
            onSelectLanguage={handleLangChange}
            size="sm"
            showIcon
            showLabel
          />
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-amber-700/60 text-amber-300 hover:text-white flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Header */}
        <div className="text-center my-3.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/50 text-amber-300 font-cinzel text-xs uppercase tracking-widest mb-1.5">
            <Smartphone size={13} className="text-amber-400" />
            <span>{t.badge}</span>
          </div>
          <h2 className="font-cinzel text-2xl sm:text-3xl font-black text-amber-200 tracking-wide">
            {t.title}
          </h2>
          <p className="text-xs sm:text-sm text-amber-300/80 mt-1 max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* App Showcase Banner */}
        <div className="my-2 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-neutral-900/60 to-amber-950/50 border border-amber-600/40 flex items-center gap-3.5">
          <img
            src="/pwa-192x192.png"
            alt="The Universal Joker App Icon"
            className="w-16 h-16 rounded-2xl border-2 border-amber-400 shadow-lg flex-shrink-0 object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-cinzel font-bold text-base text-amber-100 flex items-center gap-1.5 truncate">
              <span>The Universal Joker</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-300">
                PWA / APK
              </span>
            </h3>
            <p className="text-xs text-amber-200/80 mt-0.5 line-clamp-2">
              Official Indian Royal 4-Player Tabletop Game with Dadaji Joker.
            </p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 gap-2 my-2 text-[11px] sm:text-xs">
          <div className="p-2.5 rounded-xl bg-black/40 border border-amber-900/40 flex items-center gap-2 text-amber-200">
            <WifiOff size={15} className="text-emerald-400 flex-shrink-0" />
            <span>{t.benefit1}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-amber-900/40 flex items-center gap-2 text-amber-200">
            <Maximize2 size={15} className="text-amber-400 flex-shrink-0" />
            <span>{t.benefit2}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-amber-900/40 flex items-center gap-2 text-amber-200">
            <Sparkles size={15} className="text-amber-300 flex-shrink-0" />
            <span>{t.benefit3}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-amber-900/40 flex items-center gap-2 text-amber-200">
            <Layers size={15} className="text-teal-400 flex-shrink-0" />
            <span>{t.benefit4}</span>
          </div>
        </div>

        {/* Method 1: Direct Android Installation (WebAPK) */}
        <div className="my-2 p-4 rounded-2xl bg-neutral-900/80 border border-amber-600/50 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-cinzel font-bold text-amber-200 text-sm sm:text-base flex items-center gap-1.5">
                <Smartphone size={16} className="text-emerald-400" />
                <span>{t.directInstallTitle}</span>
              </h4>
              <p className="text-xs text-amber-300/80 mt-0.5">
                {t.directInstallSubtitle}
              </p>
            </div>
            {isInstalled && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-300 font-cinzel text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Installed</span>
              </span>
            )}
          </div>

          {/* Quick Install Button if browser triggered prompt */}
          {isInstallable && !isInstalled && (
            <button
              type="button"
              onClick={handleDirectInstall}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-cinzel font-bold text-xs uppercase rounded-xl border border-emerald-300 shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Download size={15} />
              <span>{t.btnInstallDirect}</span>
            </button>
          )}

          {/* Instructions for Android Chrome */}
          <div className="p-3 rounded-xl bg-black/50 border border-neutral-800 text-xs text-neutral-300 space-y-1.5">
            <div className="font-cinzel text-amber-300 font-bold text-[11px] uppercase tracking-wider">
              {t.method1Title}
            </div>
            <div className="leading-relaxed">{t.method1Step1}</div>
            <div className="leading-relaxed">{t.method1Step2}</div>
            <div className="leading-relaxed text-amber-200 font-medium">{t.method1Step3}</div>
          </div>
        </div>

        {/* Method 2: Standalone .apk Package File via PWABuilder */}
        <div className="my-2 p-4 rounded-2xl bg-neutral-900/80 border border-amber-600/50 space-y-3">
          <div>
            <h4 className="font-cinzel font-bold text-amber-200 text-sm sm:text-base flex items-center gap-1.5">
              <Download size={16} className="text-amber-400" />
              <span>{t.method2Title}</span>
            </h4>
            <p className="text-xs text-amber-300/80 mt-0.5 leading-relaxed">
              {t.method2Desc}
            </p>
          </div>

          {/* App URL Box with Copy Button */}
          <div className="p-3 rounded-xl bg-black/60 border border-amber-900/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="truncate flex-1 min-w-0">
              <span className="text-[10px] font-cinzel text-amber-400 block mb-0.5">
                {t.appUrlLabel}
              </span>
              <span className="font-mono text-xs text-amber-100 truncate block select-all">
                {appUrl}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-700/60 font-cinzel text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all flex-shrink-0"
            >
              {copied ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? t.urlCopied : t.btnCopyUrl}</span>
            </button>
          </div>

          {/* PWABuilder Action Button */}
          <button
            type="button"
            onClick={handleOpenPwaBuilder}
            className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-cinzel font-bold text-xs uppercase rounded-xl border border-amber-200 shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <span>{t.btnOpenPwaBuilder}</span>
            <ExternalLink size={14} />
          </button>
        </div>

        {/* iOS Notice Accordion */}
        <div className="my-1.5 p-3 rounded-xl bg-black/40 border border-neutral-800 text-xs text-neutral-300">
          <div className="font-cinzel text-amber-300 font-bold text-[11px] mb-1 flex items-center gap-1">
            <Share2 size={12} className="text-amber-400" />
            <span>{t.iosTitle}</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            {t.iosDesc}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-amber-800/40 text-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 text-amber-200 font-cinzel text-xs rounded-xl border border-amber-700/50 cursor-pointer transition-colors"
          >
            {t.btnClose}
          </button>
        </div>
      </div>
    </div>
  );
};
