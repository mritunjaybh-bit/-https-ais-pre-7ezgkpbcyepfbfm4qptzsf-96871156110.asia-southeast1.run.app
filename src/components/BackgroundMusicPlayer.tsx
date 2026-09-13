import React, { useState } from 'react';
import { useMusic } from '../context/MusicContext';
import { Volume2, VolumeX, Volume1, Music2, Info, Sparkles } from 'lucide-react';

export const BackgroundMusicPlayer: React.FC = () => {
  const { isMuted, isPlaying, volume, audioError, toggleMute, setVolume, audioRef } = useMusic();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <>
      {/* 
        Native HTML5 Audio element configured per browser autoplay specifications:
        - Starts muted on load (autoplay blocked by browsers if unmuted)
        - Loops continuously
        - Low default volume
        - Placeholder path: /assets/background-music.mp3
      */}
      <audio
        ref={audioRef}
        id="vietnamese-ambient-audio"
        src="/assets/background-music.mp3"
        loop
        autoPlay
        muted
        preload="auto"
        aria-label="Traditional Vietnamese Instrumental Background Music"
      />

      {/* Floating Bottom-Left Audio Control Widget */}
      <div
        id="ambient-music-floating-widget"
        className="fixed bottom-4 left-4 z-40 flex items-center select-none max-w-[calc(100vw-2rem)]"
      >
        <div className="bg-[#271310]/95 text-[#f4eceb] backdrop-blur-md border border-[#d3c3c0]/30 shadow-xl rounded-full px-3 py-2 flex items-center gap-2.5 transition-all duration-300 hover:border-[#feca4d]/60">
          {/* Main Mute / Unmute Speaker Toggle Button */}
          <button
            id="music-toggle-speaker-btn"
            type="button"
            onClick={toggleMute}
            className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#feca4d] ${
              !isMuted
                ? 'bg-[#feca4d] text-[#271310] shadow-md hover:bg-[#ffc02e] active:scale-95'
                : 'bg-white/10 text-white/80 hover:text-white hover:bg-white/20 active:scale-95'
            }`}
            title={!isMuted ? 'Click to Mute Background Music' : 'Click to Play Traditional Vietnamese Music'}
            aria-label={!isMuted ? 'Mute Background Music' : 'Play Background Music'}
          >
            {!isMuted ? (
              <Volume2 className="w-4 h-4 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Label and Soundwave Indicator */}
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex flex-col cursor-pointer pr-1"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide">
              <span className="text-[#feca4d] flex items-center gap-1">
                <Music2 className="w-3 h-3" />
                {!isMuted ? 'Vietnamese Ambient' : 'Background Music'}
              </span>

              {/* Animated Soundwave EQ Bars when Unmuted */}
              {!isMuted && isPlaying && (
                <div className="flex items-end gap-0.5 h-3 ml-1" aria-hidden="true">
                  <span className="w-0.5 bg-[#feca4d] rounded-full animate-[bounce_0.8s_ease-in-out_infinite] h-2" />
                  <span className="w-0.5 bg-[#feca4d] rounded-full animate-[bounce_1.1s_ease-in-out_infinite] h-3" />
                  <span className="w-0.5 bg-[#feca4d] rounded-full animate-[bounce_0.6s_ease-in-out_infinite] h-1.5" />
                  <span className="w-0.5 bg-[#feca4d] rounded-full animate-[bounce_0.9s_ease-in-out_infinite] h-2.5" />
                </div>
              )}
            </div>

            <span className="text-[10px] text-[#ae8d87] truncate max-w-[140px] sm:max-w-[170px]">
              {!isMuted ? 'Đàn Tranh & Đàn Bầu (Playing)' : 'Muted • Click speaker to listen'}
            </span>
          </div>

          {/* Quick Volume Slider Button */}
          {!isMuted && (
            <div className="hidden sm:flex items-center gap-1.5 pl-1 border-l border-white/10">
              <Volume1 className="w-3 h-3 text-[#ae8d87]" />
              <input
                id="music-volume-slider"
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-14 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#feca4d]"
                title={`Volume: ${Math.round(volume * 100)}%`}
                aria-label="Music Volume"
              />
              <span className="text-[10px] text-[#ae8d87] min-w-[24px]">
                {Math.round(volume * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
