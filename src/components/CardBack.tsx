import React from 'react';

interface CardBackProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const CardBack: React.FC<CardBackProps> = ({
  className = '',
  width = '100%',
  height = '100%',
}) => {
  return (
    <div
      style={{ width, height }}
      className={`relative rounded-lg overflow-hidden shadow-md select-none bg-[#FDFBF7] border border-[#DDD5C7] ${className}`}
    >
      <svg
        viewBox="0 0 140 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Classic Vintage Diamond Mesh Pattern as seen in reference photo */}
          <pattern id="vintageDiamondMesh" width="10" height="10" patternUnits="userSpaceOnUse">
            {/* Background deep charcoal */}
            <rect width="10" height="10" fill="#242B35" />
            {/* Crosshatch diagonal lines */}
            <path
              d="M0 5 L5 0 L10 5 L5 10 Z"
              fill="none"
              stroke="#4A5568"
              strokeWidth="0.8"
            />
            {/* Center diamond dot */}
            <circle cx="5" cy="5" r="1.1" fill="#E2E8F0" />
            <circle cx="0" cy="0" r="0.8" fill="#E2E8F0" />
            <circle cx="10" cy="0" r="0.8" fill="#E2E8F0" />
            <circle cx="0" cy="10" r="0.8" fill="#E2E8F0" />
            <circle cx="10" cy="10" r="0.8" fill="#E2E8F0" />
          </pattern>
        </defs>

        {/* Outer Ivory Margin */}
        <rect width="140" height="200" rx="8" fill="#FAF7EE" />

        {/* Thin Navy Frameline */}
        <rect
          x="6"
          y="6"
          width="128"
          height="188"
          rx="5"
          fill="none"
          stroke="#2D3748"
          strokeWidth="1.2"
        />

        {/* Inner Margin */}
        <rect
          x="9"
          y="9"
          width="122"
          height="182"
          rx="4"
          fill="url(#vintageDiamondMesh)"
        />

        {/* Fine Inner Accent Border */}
        <rect
          x="10"
          y="10"
          width="120"
          height="180"
          rx="3.5"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="0.6"
          strokeOpacity="0.4"
        />
      </svg>
    </div>
  );
};
