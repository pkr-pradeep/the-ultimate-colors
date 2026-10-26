import React from 'react';
import { getCardBackAssetUrl } from '../utils/cardAssets';

interface CardBackProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
}

export const CardBack = React.memo<CardBackProps>(({
  className = '',
  width = '100%',
  height = '100%',
  style,
}) => {
  return (
    <div
      style={{ width, height, ...style }}
      className={`relative rounded-sm sm:rounded-md overflow-hidden shadow-xs select-none bg-[#f6e3b5] border border-[#6e1423]/40 flex items-center justify-center will-change-transform ${className}`}
    >
      <img
        src={getCardBackAssetUrl('png')}
        alt="Indian Playing Card Back"
        className="w-full h-full object-fill pointer-events-none select-none block"
        loading="eager"
        decoding="async"
        draggable={false}
      />
    </div>
  );
});

CardBack.displayName = 'CardBack';
