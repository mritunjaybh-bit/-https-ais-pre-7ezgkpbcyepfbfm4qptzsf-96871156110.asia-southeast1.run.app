import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
  onClick
}) => {
  const iconDimensions = {
    sm: { width: 36, height: 42, iconScale: 'w-9 h-11' },
    md: { width: 54, height: 62, iconScale: 'w-14 h-16' },
    lg: { width: 84, height: 96, iconScale: 'w-20 h-24' }
  }[size];

  const titleSizes = {
    sm: 'text-lg font-bold tracking-tight',
    md: 'text-2xl font-bold tracking-normal',
    lg: 'text-4xl md:text-5xl font-bold tracking-tight'
  }[size];

  const taglineSizes = {
    sm: 'text-[10px] tracking-wider',
    md: 'text-xs tracking-wider',
    lg: 'text-sm md:text-base tracking-widest'
  }[size];

  return (
    <div
      id="brand-logo"
      onClick={onClick}
      className={`inline-flex flex-col items-center select-none text-center ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Phin Cup SVG Icon with Heart Steam */}
      <svg
        viewBox="0 0 100 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconDimensions.iconScale} transition-transform duration-300 group-hover:scale-105`}
        aria-label="Cà Phê Vietnam Phin Logo"
      >
        {/* Heart shaped steam rising */}
        <path
          d="M50 35 C50 35, 45 28, 38 28 C30 28, 26 34, 28 42 C30 49, 44 58, 50 63 C56 58, 70 49, 72 42 C74 34, 70 28, 62 28 C55 28, 50 35, 50 35 Z"
          fill="none"
          stroke="#C59B27"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
          transform="translate(0, -18) scale(0.9) translate(5, 5)"
        />

        {/* Phin Lid Top Rim */}
        <path
          d="M26 40 C34 37, 66 37, 74 40 L78 41 C83 41.5, 83 44, 78 44.5 L22 44.5 C17 44, 17 41.5, 22 41 Z"
          fill="#271310"
        />

        {/* Main Chamber Cup Body */}
        <rect
          x="28"
          y="45"
          width="44"
          height="38"
          rx="2"
          stroke="#271310"
          strokeWidth="4"
          fill="#FFF8F6"
        />

        {/* Golden Chamber Accent Lines (from logo) */}
        <line
          x1="35"
          y1="49"
          x2="35"
          y2="76"
          stroke="#C59B27"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="65"
          y1="52"
          x2="65"
          y2="76"
          stroke="#C59B27"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="59"
          y1="60"
          x2="59"
          y2="76"
          stroke="#C59B27"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Cup Handle */}
        <path
          d="M72 48 C83 48, 88 56, 88 64 C88 73, 80 77, 72 77"
          fill="none"
          stroke="#271310"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Base Saucer Plate (Phin Plate) */}
        <line
          x1="18"
          y1="85"
          x2="82"
          y2="85"
          stroke="#271310"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Lower Dripper Base Rim */}
        <path
          d="M30 87 L33 93 C34 95, 36 96, 40 96 L60 96 C64 96, 66 95, 67 93 L70 87"
          fill="none"
          stroke="#271310"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Brand Name with Vietnamese Diacritics */}
      <h1
        className={`font-serif text-[#271310] font-bold ${titleSizes} mt-1`}
        style={{ fontFamily: 'Playfair Display, serif' }}
      >
        Cà Phê
      </h1>

      {/* Subtitle / Tagline */}
      {showTagline && (
        <p
          className={`font-sans text-[#504442] italic font-medium ${taglineSizes} mt-0.5 tracking-wide`}
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          From Vietnam, with love.
        </p>
      )}
    </div>
  );
};
