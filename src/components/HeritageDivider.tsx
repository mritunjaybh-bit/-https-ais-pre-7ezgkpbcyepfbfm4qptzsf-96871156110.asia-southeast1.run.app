import React from 'react';

interface HeritageDividerProps {
  className?: string;
  variant?: 'lotus' | 'coffee-bean' | 'heart-phin';
}

export const HeritageDivider: React.FC<HeritageDividerProps> = ({
  className = '',
  variant = 'lotus'
}) => {
  return (
    <div className={`relative flex items-center justify-center my-12 ${className}`} id="heritage-divider">
      <div className="flex-grow border-t border-[#d3c3c0]/60 max-w-xs md:max-w-md"></div>

      <div className="mx-4 flex items-center justify-center text-[#785a00]">
        {variant === 'lotus' && (
          <svg className="w-6 h-6 fill-[#785a00]/80" viewBox="0 0 24 24">
            <path d="M12 2C12 2 9 6 9 10C9 14 12 18 12 18C12 18 15 14 15 10C15 6 12 2 12 2ZM5.5 12C5.5 12 3 14 3 17C3 20 6.5 21 8.5 20C10.5 19 11 17 11 17C11 17 8 16 7 14C6 12 5.5 12 5.5 12ZM18.5 12C18.5 12 21 14 21 17C21 20 17.5 21 15.5 20C13.5 19 13 17 13 17C13 17 16 16 17 14C18 12 18.5 12 18.5 12Z" />
          </svg>
        )}
        {variant === 'coffee-bean' && (
          <svg className="w-5 h-5 fill-[#785a00]" viewBox="0 0 24 24">
            <path d="M18.8 5.2C15.1 1.5 9.1 1.5 5.4 5.2C1.7 8.9 1.7 14.9 5.4 18.6C9.1 22.3 15.1 22.3 18.8 18.6C22.5 14.9 22.5 8.9 18.8 5.2ZM12 19.5C10.5 19.5 9 18.5 8.5 17C7.5 14 10.5 11.5 11.5 9C12.5 6.5 11.5 4.5 12 4.5C12.5 4.5 13.5 6.5 12.5 9C11.5 11.5 14.5 14 13.5 17C13 18.5 12.5 19.5 12 19.5Z" />
          </svg>
        )}
        {variant === 'heart-phin' && (
          <span className="font-serif italic text-xs tracking-widest text-[#785a00] uppercase px-2 font-semibold">
            Cà Phê Việt Nam
          </span>
        )}
      </div>

      <div className="flex-grow border-t border-[#d3c3c0]/60 max-w-xs md:max-w-md"></div>
    </div>
  );
};
