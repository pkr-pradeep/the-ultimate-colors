import React from 'react';
import { Rank, Suit } from '../../types/game';
import { SuitIcon } from './SuitIcon';

interface CourtArtworkProps {
  rank: Rank;
  suit: Suit;
  className?: string;
}

export const RoyalCourtArtwork: React.FC<CourtArtworkProps> = ({
  rank,
  suit,
  className = '',
}) => {
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const primaryColor = isRed ? '#881337' : '#1E293B'; // Deep Ruby or Deep Slate
  const secondaryColor = isRed ? '#BE123C' : '#334155';
  const gold = '#D4AF37';
  const lightGold = '#FEF08A';

  // ACE (Ekka): Ornate Mughal Medallion
  if (rank === 'A') {
    return (
      <div className={`relative flex items-center justify-center w-full h-full ${className}`}>
        <svg
          viewBox="0 0 160 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Radial Mughal Sunburst */}
          <circle cx="80" cy="100" r="64" stroke="#FDE68A" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
          <circle cx="80" cy="100" r="54" stroke={gold} strokeWidth="1.5" />
          <circle cx="80" cy="100" r="48" fill="#FFFBEB" stroke="#E2D098" strokeWidth="1" />

          {/* 8-Petal Mughal Lotus Medallion */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <g key={i} transform={`rotate(${angle} 80 100)`}>
              <path
                d="M80 52 C74 65, 86 65, 80 52 Z"
                fill={primaryColor}
                opacity="0.85"
              />
              <circle cx="80" cy="50" r="2" fill={gold} />
            </g>
          ))}

          {/* Inner ring */}
          <circle cx="80" cy="100" r="32" fill="#FEF3C7" stroke={gold} strokeWidth="1.5" />
        </svg>

        {/* Central Prominent Regal Suit Icon */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <SuitIcon suit={suit} size={50} showGoldBorder />
          <span className="text-[10px] font-cinzel font-bold text-amber-900 tracking-widest mt-1">
            EKKA
          </span>
        </div>
      </div>
    );
  }

  // KING (Maharaja): Indian Monarch
  if (rank === 'K') {
    return (
      <svg
        viewBox="0 0 160 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${className}`}
      >
        {/* Background Arch */}
        <path
          d="M16 210 V70 C16 35, 48 16, 80 10 C112 16, 144 35, 144 70 V210 Z"
          fill="#FFFDF7"
          stroke={gold}
          strokeWidth="2"
        />

        {/* Royal Robes (Angrakha) */}
        <path
          d="M36 210 L44 125 C46 110, 60 105, 80 105 C100 105, 114 110, 116 125 L124 210 Z"
          fill={primaryColor}
          stroke={gold}
          strokeWidth="1.2"
        />

        {/* Golden Embroidered Collar & Sash */}
        <path d="M68 105 L80 135 L92 105 Z" fill={gold} />
        <path d="M80 135 V210" stroke={gold} strokeWidth="3" />

        {/* Jewel Necklace (Kanthi) */}
        <path
          d="M58 120 C70 132, 90 132, 102 120"
          stroke={lightGold}
          strokeWidth="2.5"
          strokeDasharray="2 2"
          fill="none"
        />

        {/* Maharaja Head & Royal Moustache */}
        <path d="M70 100 H90 V115 H70 Z" fill="#E2B18A" />
        <ellipse cx="80" cy="80" rx="19" ry="22" fill="#F0C7A6" />

        {/* Moustache */}
        <path
          d="M80 87 C74 85, 62 82, 58 88 C62 90, 72 89, 80 91 C88 89, 98 90, 102 88 C98 82, 86 85, 80 87 Z"
          fill="#1C1917"
        />

        {/* Eyes & Eyebrows */}
        <ellipse cx="72" cy="74" rx="3.5" ry="2" fill="#1C1917" />
        <ellipse cx="88" cy="74" rx="3.5" ry="2" fill="#1C1917" />
        <path d="M68 70 C72 67, 76 67, 78 70" stroke="#1C1917" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M82 70 C84 67, 88 67, 92 70" stroke="#1C1917" strokeWidth="1.5" strokeLinecap="round" />

        {/* Maharaja Royal Turban with Sarpech Aigrette */}
        <path
          d="M56 68 C52 50, 65 34, 80 30 C95 34, 108 50, 104 68 C100 60, 60 60, 56 68 Z"
          fill={secondaryColor}
          stroke={gold}
          strokeWidth="1.5"
        />
        {/* Turban Swathes */}
        <path d="M58 58 C68 46, 92 46, 102 58" stroke={gold} strokeWidth="1.5" fill="none" />
        {/* Kalgi Feather */}
        <path d="M78 28 C76 18, 80 12, 82 18 C84 12, 88 18, 84 28 Z" fill={gold} />
        <circle cx="81" cy="34" r="3" fill="#DC2626" stroke={gold} strokeWidth="0.8" />

        {/* Scepter / Talwar in Hand */}
        <rect x="120" y="90" width="4" height="110" fill={gold} rx="2" />
        <circle cx="122" cy="88" r="5" fill="#EF4444" stroke={gold} strokeWidth="1" />

        {/* Bottom Banner */}
        <rect x="25" y="194" width="110" height="18" fill="#1C1917" rx="3" stroke={gold} strokeWidth="1" />
        <text
          x="80"
          y="206"
          textAnchor="middle"
          fill="#FDE68A"
          fontSize="9"
          fontWeight="bold"
          fontFamily="Cinzel, serif"
        >
          MAHARAJA · KING
        </text>
      </svg>
    );
  }

  // QUEEN (Maharani): Indian Queen with Dupatta & Lotus
  if (rank === 'Q') {
    return (
      <svg
        viewBox="0 0 160 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${className}`}
      >
        {/* Background Arch */}
        <path
          d="M16 210 V70 C16 35, 48 16, 80 10 C112 16, 144 35, 144 70 V210 Z"
          fill="#FFFDF7"
          stroke={gold}
          strokeWidth="2"
        />

        {/* Maharani Robe & Odhani */}
        <path
          d="M38 210 L46 130 C48 115, 60 110, 80 110 C100 110, 112 115, 114 130 L122 210 Z"
          fill={primaryColor}
          stroke={gold}
          strokeWidth="1.2"
        />

        {/* Sheer Golden Embroidered Odhani / Veil draped over head */}
        <path
          d="M52 65 C48 90, 44 140, 48 200 C60 190, 64 160, 66 130 Z"
          fill={secondaryColor}
          opacity="0.85"
          stroke={gold}
          strokeWidth="1"
        />
        <path
          d="M108 65 C112 90, 116 140, 112 200 C100 190, 96 160, 94 130 Z"
          fill={secondaryColor}
          opacity="0.85"
          stroke={gold}
          strokeWidth="1"
        />

        {/* Neck & Face */}
        <path d="M72 102 H88 V118 H72 Z" fill="#ECC4A3" />
        <ellipse cx="80" cy="82" rx="18" ry="20" fill="#FCD9BD" />

        {/* Ornate Gold Maang Tikka on Forehead */}
        <circle cx="80" cy="68" r="3.5" fill={gold} stroke="#B45309" strokeWidth="0.8" />
        <circle cx="80" cy="68" r="1.5" fill="#EF4444" />
        <path d="M80 62 V68" stroke={gold} strokeWidth="1.2" />

        {/* Beautiful Eyes & Bindi */}
        <circle cx="80" cy="76" r="1.5" fill="#DC2626" /> {/* Red Bindi */}
        <ellipse cx="73" cy="80" rx="3.5" ry="1.8" fill="#1C1917" />
        <ellipse cx="87" cy="80" rx="3.5" ry="1.8" fill="#1C1917" />
        <path d="M69 76 C72 74, 76 74, 78 76" stroke="#1C1917" strokeWidth="1" strokeLinecap="round" />
        <path d="M82 76 C84 74, 88 74, 91 76" stroke="#1C1917" strokeWidth="1" strokeLinecap="round" />

        {/* Elegant Lips */}
        <path d="M76 92 C78 94, 82 94, 84 92" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />

        {/* Jhumkas (Earrings) */}
        <circle cx="60" cy="86" r="2" fill={gold} />
        <path d="M58 88 L62 88 L60 93 Z" fill={gold} />
        <circle cx="100" cy="86" r="2" fill={gold} />
        <path d="M98 88 L102 88 L100 93 Z" fill={gold} />

        {/* Sacred Indian Pink Lotus (Kamal) held in hand */}
        <g transform="translate(112, 130)">
          <path d="M0 0 C-6 -8, -12 2, 0 10 C12 2, 6 -8, 0 0 Z" fill="#F472B6" stroke="#DB2777" strokeWidth="0.8" />
          <path d="M-4 2 C-8 -4, -12 4, -4 8 Z" fill="#FBCFE8" />
          <path d="M4 2 C8 -4, 12 4, 4 8 Z" fill="#FBCFE8" />
          <path d="M0 10 V24" stroke="#16A34A" strokeWidth="2" />
        </g>

        {/* Bottom Banner */}
        <rect x="25" y="194" width="110" height="18" fill="#1C1917" rx="3" stroke={gold} strokeWidth="1" />
        <text
          x="80"
          y="206"
          textAnchor="middle"
          fill="#FDE68A"
          fontSize="9"
          fontWeight="bold"
          fontFamily="Cinzel, serif"
        >
          MAHARANI · QUEEN
        </text>
      </svg>
    );
  }

  // JACK (Yuvraj / Wazir): Royal Prince / Minister
  return (
    <svg
      viewBox="0 0 160 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full ${className}`}
    >
      {/* Background Arch */}
      <path
        d="M16 210 V70 C16 35, 48 16, 80 10 C112 16, 144 35, 144 70 V210 Z"
        fill="#FFFDF7"
        stroke={gold}
        strokeWidth="2"
      />

      {/* Warrior Prince Tunic */}
      <path
        d="M38 210 L46 125 C48 112, 60 108, 80 108 C100 108, 112 112, 114 125 L122 210 Z"
        fill={primaryColor}
        stroke={gold}
        strokeWidth="1.2"
      />

      {/* Cross-chest Warrior Sash */}
      <path d="M48 120 L110 190 L116 182 L54 112 Z" fill={gold} />

      {/* Neck & Face */}
      <path d="M71 102 H89 V118 H71 Z" fill="#E2B18A" />
      <ellipse cx="80" cy="82" rx="18" ry="20" fill="#F0C7A6" />

      {/* Trim youthful royal moustache */}
      <path d="M72 89 C76 87, 80 88, 84 88 C88 88, 92 87, 96 89" stroke="#1C1917" strokeWidth="1.8" strokeLinecap="round" />

      {/* Eyes */}
      <ellipse cx="73" cy="77" rx="3.5" ry="2" fill="#1C1917" />
      <ellipse cx="87" cy="77" rx="3.5" ry="2" fill="#1C1917" />
      <path d="M69 72 C73 70, 77 70, 79 73" stroke="#1C1917" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M81 73 C83 70, 87 70, 91 72" stroke="#1C1917" strokeWidth="1.3" strokeLinecap="round" />

      {/* Warrior Pagri Turban with Plume */}
      <path
        d="M58 70 C54 52, 66 38, 80 34 C94 38, 106 52, 102 70 C96 62, 64 62, 58 70 Z"
        fill={secondaryColor}
        stroke={gold}
        strokeWidth="1.5"
      />
      {/* Plume feather */}
      <path d="M96 36 C102 24, 114 26, 110 38 Z" fill={gold} />

      {/* Sheathed Talwar (Royal Sword) Hilt */}
      <g transform="translate(116, 115)">
        <path d="M0 0 L12 -12 L16 -8 L4 4 Z" fill={gold} />
        <circle cx="16" cy="-8" r="3.5" fill="#DC2626" />
        <path d="M0 0 L-8 65" stroke={gold} strokeWidth="3" />
      </g>

      {/* Bottom Banner */}
      <rect x="25" y="194" width="110" height="18" fill="#1C1917" rx="3" stroke={gold} strokeWidth="1" />
      <text
        x="80"
        y="206"
        textAnchor="middle"
        fill="#FDE68A"
        fontSize="9"
        fontWeight="bold"
        fontFamily="Cinzel, serif"
      >
        YUVRAJ · WAZIR
      </text>
    </svg>
  );
};
