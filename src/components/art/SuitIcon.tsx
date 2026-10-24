import React from 'react';
import { Suit } from '../../types/game';

interface SuitIconProps {
  suit: Suit;
  className?: string;
  size?: number;
  showGoldBorder?: boolean;
}

export const SuitIcon: React.FC<SuitIconProps> = ({
  suit,
  className = '',
  size = 18,
  showGoldBorder = false,
}) => {
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const fillColor = isRed ? '#B91C1C' : '#1C1917'; // Rich crimson or deep obsidian
  const strokeColor = showGoldBorder ? '#D4AF37' : 'none';

  switch (suit) {
    case 'spades':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          {/* Mughal pointed Hukum Spade */}
          <path
            d="M12 2C9.5 5.5 4.5 9.5 4.5 13.5C4.5 16.5 7 18.5 9.5 18.5C10.6 18.5 11.4 18 12 17.2C12.6 18 13.4 18.5 14.5 18.5C17 18.5 19.5 16.5 19.5 13.5C19.5 9.5 14.5 5.5 12 2Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={showGoldBorder ? 1 : 0}
          />
          <path
            d="M10.5 18.5H13.5L14.5 22H9.5L10.5 18.5Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={showGoldBorder ? 1 : 0}
          />
        </svg>
      );

    case 'hearts':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          {/* Regal Indian Paan Heart with elegant tapered tip */}
          <path
            d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={showGoldBorder ? 1 : 0}
          />
        </svg>
      );

    case 'diamonds':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          {/* Ornate Eent Diamond with curved inward Mughal facets */}
          <path
            d="M12 2L20.5 12L12 22L3.5 12L12 2Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={showGoldBorder ? 1 : 0}
          />
        </svg>
      );

    case 'clubs':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          {/* Traditional Chidi Club clover */}
          <circle cx="12" cy="7" r="4.2" fill={fillColor} />
          <circle cx="7" cy="14" r="4.2" fill={fillColor} />
          <circle cx="17" cy="14" r="4.2" fill={fillColor} />
          <path
            d="M10.8 14H13.2L14.8 22H9.2L10.8 14Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={showGoldBorder ? 1 : 0}
          />
        </svg>
      );
  }
};
