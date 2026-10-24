import React from 'react';

interface DadajiArtworkProps {
  className?: string;
  isDetailed?: boolean;
}

export const DadajiArtwork: React.FC<DadajiArtworkProps> = ({
  className = '',
  isDetailed = true,
}) => {
  return (
    <svg
      viewBox="0 0 200 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full select-none ${className}`}
    >
      <defs>
        {/* Background Gradients */}
        <radialGradient id="dadajiHalo" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#FDE68A" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
        </radialGradient>

        <linearGradient id="maroonSherwani" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#801524" />
          <stop offset="50%" stopColor="#5A0E19" />
          <stop offset="100%" stopColor="#3D0810" />
        </linearGradient>

        <linearGradient id="goldZari" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        <linearGradient id="royalTurban" x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#831843" />
          <stop offset="35%" stopColor="#9D174D" />
          <stop offset="70%" stopColor="#701A75" />
          <stop offset="100%" stopColor="#4C0519" />
        </linearGradient>

        <linearGradient id="caneGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Mughal Mihrab Arch Background Frame */}
      <path
        d="M20 270 V90 C20 45, 60 20, 100 12 C140 20, 180 45, 180 90 V270 H20 Z"
        fill="#FFFBEB"
        stroke="url(#goldZari)"
        strokeWidth="2.5"
      />

      {/* Delicate Inner Arch Jaali Pattern Line */}
      <path
        d="M26 268 V92 C26 50, 63 26, 100 18 C137 26, 174 50, 174 92 V268"
        fill="none"
        stroke="#E5D5A5"
        strokeWidth="1"
        strokeDasharray="3 3"
      />

      {/* Golden Halo radiating behind Dadaji */}
      <circle cx="100" cy="90" r="62" fill="url(#dadajiHalo)" />

      {/* Mughal Trefoil Crest Finial at top */}
      <circle cx="100" cy="12" r="3.5" fill="url(#goldZari)" />
      <path d="M96 16 C98 13, 102 13, 104 16 C102 18, 98 18, 96 16 Z" fill="url(#goldZari)" />

      {/* ================= DADAJI BODY & CLOTHING ================= */}
      {/* Maroon Sherwani Torso */}
      <path
        d="M50 280 L56 160 C58 142, 75 136, 100 136 C125 136, 142 142, 144 160 L150 280 Z"
        fill="url(#maroonSherwani)"
        stroke="#4A0B13"
        strokeWidth="1.5"
      />

      {/* Golden Zari Shoulder Epaulettes & Brocade */}
      <path
        d="M56 160 C62 152, 78 148, 88 152 L84 166 C74 162, 60 166, 56 160 Z"
        fill="url(#goldZari)"
      />
      <path
        d="M144 160 C138 152, 122 148, 112 152 L116 166 C126 162, 140 166, 144 160 Z"
        fill="url(#goldZari)"
      />

      {/* Mandarin Collar in Maroon & Gold */}
      <path
        d="M86 136 C86 128, 114 128, 114 136 L112 148 C106 150, 94 150, 88 148 Z"
        fill="url(#goldZari)"
      />

      {/* Center Placket with Gold Zari Border */}
      <rect x="96" y="146" width="8" height="134" fill="url(#goldZari)" />

      {/* Polished Gold Spherical Sherwani Buttons */}
      <circle cx="100" cy="160" r="2.5" fill="#FFFBEB" stroke="#B45309" strokeWidth="0.8" />
      <circle cx="100" cy="180" r="2.5" fill="#FFFBEB" stroke="#B45309" strokeWidth="0.8" />
      <circle cx="100" cy="200" r="2.5" fill="#FFFBEB" stroke="#B45309" strokeWidth="0.8" />
      <circle cx="100" cy="220" r="2.5" fill="#FFFBEB" stroke="#B45309" strokeWidth="0.8" />
      <circle cx="100" cy="240" r="2.5" fill="#FFFBEB" stroke="#B45309" strokeWidth="0.8" />
      <circle cx="100" cy="260" r="2.5" fill="#FFFBEB" stroke="#B45309" strokeWidth="0.8" />

      {/* ================= ROYAL WALKING STICK (CHHARI) ================= */}
      {/* Polished Rosewood Cane Shaft */}
      <path
        d="M152 140 L162 280 H155 L146 140 Z"
        fill="#291209"
        stroke="#451A03"
        strokeWidth="1"
      />
      {/* Gold Ring Band on Cane */}
      <rect x="147" y="162" width="7" height="4" fill="url(#caneGold)" rx="1" />
      <rect x="151" y="210" width="8" height="3" fill="url(#caneGold)" rx="0.5" />

      {/* Ornate Gold Knob / Animal Finial Cane Handle */}
      <path
        d="M142 136 C136 125, 146 112, 158 116 C168 120, 166 134, 154 138 C148 140, 145 142, 144 148 L151 146 C152 142, 155 140, 158 136 C166 130, 160 122, 154 122 C148 122, 144 127, 147 134 Z"
        fill="url(#caneGold)"
        filter="url(#softGlow)"
      />
      <circle cx="156" cy="123" r="2" fill="#DC2626" /> {/* Small Ruby in Cane */}

      {/* Dadaji's Dignified Hand Holding the Cane */}
      <path
        d="M138 148 C138 142, 152 142, 152 148 C152 154, 140 156, 138 148 Z"
        fill="#F5D0B5"
        stroke="#D97706"
        strokeWidth="0.8"
      />

      {/* ================= DADAJI HEAD & NOBLE FACE ================= */}
      {/* Neck */}
      <path d="M88 126 H112 V142 H88 Z" fill="#E6BA95" />

      {/* Face (Wise Elderly Features) */}
      <path
        d="M80 84 C80 68, 120 68, 120 84 C120 106, 114 116, 100 118 C86 116, 80 106, 80 84 Z"
        fill="#F6D6BD"
      />

      {/* Soft Wrinkles of Wisdom */}
      <path d="M90 76 C95 74, 105 74, 110 76" stroke="#D4A373" strokeWidth="1" strokeLinecap="round" />
      <path d="M92 72 C96 70, 104 70, 108 72" stroke="#D4A373" strokeWidth="0.8" strokeLinecap="round" />
      {/* Eye laugh lines */}
      <path d="M82 86 L85 88" stroke="#D4A373" strokeWidth="0.8" />
      <path d="M118 86 L115 88" stroke="#D4A373" strokeWidth="0.8" />

      {/* Kind, Wise Eyes */}
      <ellipse cx="91" cy="86" rx="4.5" ry="3" fill="#FFFFFF" />
      <circle cx="91.5" cy="86" r="2" fill="#3E2723" />
      <circle cx="92.2" cy="85.3" r="0.7" fill="#FFFFFF" />
      <path d="M86 83 C88 81, 94 81, 96 83" stroke="#4A3728" strokeWidth="1.2" strokeLinecap="round" />

      <ellipse cx="109" cy="86" rx="4.5" ry="3" fill="#FFFFFF" />
      <circle cx="108.5" cy="86" r="2" fill="#3E2723" />
      <circle cx="109.2" cy="85.3" r="0.7" fill="#FFFFFF" />
      <path d="M104 83 C106 81, 112 81, 114 83" stroke="#4A3728" strokeWidth="1.2" strokeLinecap="round" />

      {/* Distinguished White Eyebrows */}
      <path
        d="M84 80 C88 77, 95 78, 98 81"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M102 81 C105 78, 112 77, 116 80"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Noble Nose */}
      <path
        d="M100 82 V94 C97 94, 96 96, 98 97 C100 97, 102 96, 104 94"
        fill="none"
        stroke="#C58F68"
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      {/* ================= WHITE MOUSTACHE & BEARD ================= */}
      {/* Imperial Aristocratic Curled White Moustache */}
      {/* Left Moustache curling upward gracefully */}
      <path
        d="M100 97 C94 95, 84 94, 76 97 C70 99, 66 104, 68 108 C70 110, 75 108, 77 104 C82 99, 92 100, 100 102 Z"
        fill="#FFFFFF"
        stroke="#E2E8F0"
        strokeWidth="0.8"
      />
      {/* Right Moustache curling upward gracefully */}
      <path
        d="M100 97 C106 95, 116 94, 124 97 C130 99, 134 104, 132 108 C130 110, 125 108, 123 104 C118 99, 108 100, 100 102 Z"
        fill="#FFFFFF"
        stroke="#E2E8F0"
        strokeWidth="0.8"
      />

      {/* Dignified Snow-White Flowing Beard */}
      <path
        d="M78 98 C72 110, 74 134, 84 150 C90 158, 96 166, 100 170 C104 166, 110 158, 116 150 C126 134, 128 110, 122 98 C116 114, 112 124, 100 126 C88 124, 84 114, 78 98 Z"
        fill="#FFFFFF"
        stroke="#E2E8F0"
        strokeWidth="0.8"
      />
      {/* Beard texture lines */}
      <path d="M92 120 C92 135, 96 148, 100 162" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M108 120 C108 135, 104 148, 100 162" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M86 112 C88 125, 94 138, 98 152" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M114 112 C112 125, 106 138, 102 152" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" />

      {/* ================= ROYAL INDIAN TURBAN (PAGRI) ================= */}
      {/* Base wrapped folds of the Turban */}
      <path
        d="M72 74 C66 60, 76 44, 94 38 C110 34, 132 40, 136 56 C140 70, 134 78, 124 82 C120 70, 80 70, 76 82 C73 78, 72 76, 72 74 Z"
        fill="url(#royalTurban)"
        stroke="#4C0519"
        strokeWidth="1.2"
      />
      {/* Overlapping Pleated Swathes */}
      <path
        d="M74 66 C86 52, 118 48, 134 60 C126 70, 88 66, 74 66 Z"
        fill="#9D174D"
        opacity="0.9"
      />
      <path
        d="M78 54 C92 42, 116 42, 130 52 C122 58, 90 54, 78 54 Z"
        fill="#831843"
      />
      {/* Gold Zari Border on Turban fold */}
      <path
        d="M74 72 C88 62, 116 62, 130 72"
        fill="none"
        stroke="url(#goldZari)"
        strokeWidth="1.8"
      />

      {/* Jewelled Sarpech (Royal Golden Kalgi Brooch) with Ruby & Emerald */}
      <path
        d="M98 32 C96 24, 100 18, 102 24 C104 18, 108 24, 106 32 Z"
        fill="url(#goldZari)"
      />
      <circle cx="102" cy="38" r="4.5" fill="url(#goldZari)" stroke="#B45309" strokeWidth="0.8" />
      <circle cx="102" cy="38" r="2.5" fill="#DC2626" /> {/* Ruby Centerpiece */}
      {/* Pearl drop hanging from Sarpech */}
      <circle cx="102" cy="46" r="1.8" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="0.5" />

      {/* Golden Name Ribbon at bottom */}
      <g transform="translate(18, 244)">
        <path
          d="M6 0 H158 L164 12 L158 24 H6 L0 12 L6 0 Z"
          fill="#450A0A"
          stroke="url(#goldZari)"
          strokeWidth="1.5"
        />
        <text
          x="82"
          y="15"
          textAnchor="middle"
          fill="#FDE68A"
          fontSize="9.5"
          fontWeight="bold"
          fontFamily="Cinzel, serif"
          letterSpacing="1"
        >
          DADAJI · JOKER
        </text>
      </g>

      {/* Decorative Golden Corner Flourishes */}
      <path d="M26 28 C34 28, 40 34, 40 42" stroke="url(#goldZari)" strokeWidth="1.5" fill="none" />
      <circle cx="26" cy="28" r="1.5" fill="url(#goldZari)" />
      <path d="M174 28 C166 28, 160 34, 160 42" stroke="url(#goldZari)" strokeWidth="1.5" fill="none" />
      <circle cx="174" cy="28" r="1.5" fill="url(#goldZari)" />
    </svg>
  );
};
