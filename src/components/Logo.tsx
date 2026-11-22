import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  onClick,
}) => {
  const heightClass = {
    sm: 'h-11 w-auto',
    md: 'h-12 sm:h-14 w-auto',
    lg: 'h-16 sm:h-20 w-auto',
  }[size];

  const interactiveProps = onClick
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick,
        onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        },
      }
    : {};

  return (
    <div
      id="brand-logo"
      aria-label="Cà Phê"
      {...interactiveProps}
      className={`inline-flex items-center justify-center select-none shrink-0 ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      <img
        src="/brand/logo.svg"
        alt="Cà Phê"
        className={`${heightClass} object-contain block transition-transform duration-300 ${
          onClick ? 'group-hover:scale-105' : ''
        }`}
      />
    </div>
  );
};
