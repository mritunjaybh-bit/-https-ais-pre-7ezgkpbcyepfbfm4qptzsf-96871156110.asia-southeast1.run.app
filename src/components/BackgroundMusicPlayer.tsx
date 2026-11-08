import React, { useState, useEffect, useRef } from 'react';
import { useMusic } from '../context/MusicContext';
import { Play, Pause, Volume2, VolumeX, SkipForward, X, Music2 } from 'lucide-react';

export const BackgroundMusicPlayer: React.FC = () => {
  const {
    isPlaying,
    isMuted,
    volumePercent,
    currentTrack,
    currentTrackIndex,
    playlist,
    hasPlayableTracks,
    hasInteracted,
    togglePlay,
    toggleMute,
    setVolume,
    nextTrack,
  } = useMusic();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Close panel on click outside
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsExpanded(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

  // If no playable tracks load, hide the player completely per rule
  if (!hasPlayableTracks) {
    return null;
  }

  return (
    <aside
      aria-label="Background Ambient Music Player"
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-[calc(1rem+env(safe-area-inset-left,0px))] z-40 select-none"
    >
      {/* Floating Collapsed 48px Round Button */}
      <div className="relative">
        {/* "Tap to play" hint badge before first user interaction */}
        {!hasInteracted && !isPlaying && (
          <div
            className="absolute -top-8 left-0 pointer-events-none whitespace-nowrap bg-[#1c120c] text-[#c5a880] border border-[#c5a880]/50 text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-none shadow-xl animate-pulse"
            aria-hidden="true"
          >
            Tap to play
          </div>
        )}

        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label={
            isExpanded
              ? 'Close background music controls'
              : isPlaying && !isMuted
              ? 'Background music playing - Open controls'
              : 'Background music paused - Open controls'
          }
          className={`w-12 h-12 rounded-full border shadow-2xl transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#c5a880] ${
            isPlaying && !isMuted
              ? 'bg-[#140d09] text-[#c5a880] border-[#c5a880]'
              : 'bg-[#140d09] text-[#a3978f] border-[#c5a880]/40 hover:border-[#c5a880] hover:text-[#c5a880]'
          }`}
        >
          {/* Animated EQ Bars when Playing */}
          {isPlaying && !isMuted ? (
            <div className="flex items-end gap-[3px] h-4" aria-hidden="true">
              <span className="w-[2.5px] bg-[#c5a880] animate-[bounce_0.7s_ease-in-out_infinite] h-2 rounded-xs" />
              <span className="w-[2.5px] bg-[#c5a880] animate-[bounce_1.1s_ease-in-out_infinite] h-4 rounded-xs" />
              <span className="w-[2.5px] bg-[#c5a880] animate-[bounce_0.6s_ease-in-out_infinite] h-2.5 rounded-xs" />
              <span className="w-[2.5px] bg-[#c5a880] animate-[bounce_0.9s_ease-in-out_infinite] h-3.5 rounded-xs" />
            </div>
          ) : (
            <Music2 className="w-5 h-5" />
          )}
        </button>

        {/* Upward Expanded Compact Luxury Audio Panel */}
        {isExpanded && (
          <div
            ref={panelRef}
            role="region"
            aria-label="Ambient Music Controls"
            className="absolute bottom-[calc(100%+12px)] left-0 w-[285px] max-w-[calc(100vw-32px)] bg-[#140d09]/95 backdrop-blur-md text-[#fcfbf7] border border-[#c5a880]/40 shadow-2xl p-4 space-y-3.5 rounded-none font-sans animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            {/* Header: Track Details & Close Button */}
            <div className="flex items-start justify-between gap-2 border-b border-[#c5a880]/20 pb-2.5">
              <div className="min-w-0 flex-1">
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#c5a880] block font-medium">
                  {isPlaying && !isMuted ? 'Now Playing' : 'Ambient Music'}
                </span>
                <p className="text-xs font-serif text-[#fcfbf7] truncate mt-0.5">
                  {currentTrack?.title || 'Ambient 1'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                aria-label="Close music panel"
                className="w-11 h-11 -mr-2 -mt-2 flex items-center justify-center text-[#a3978f] hover:text-[#fcfbf7] transition-colors cursor-pointer rounded-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Controls: Play/Pause, Next Track, Mute/Unmute */}
            <div className="flex items-center justify-between gap-2 pt-1">
              {/* Play / Pause Button (44px min target) */}
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
                className="min-w-[44px] min-h-[44px] px-3.5 py-2 bg-[#c5a880] hover:bg-[#d8be98] text-[#140d09] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95 focus:outline-none focus:ring-1 focus:ring-[#fcfbf7]"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>Play</span>
                  </>
                )}
              </button>

              {/* Next Track Button (44px min target) */}
              <button
                type="button"
                onClick={nextTrack}
                aria-label="Skip to next track"
                title="Next track (smooth 3s crossfade)"
                className="min-w-[44px] min-h-[44px] px-2.5 py-2 border border-[#c5a880]/30 hover:border-[#c5a880] text-[#fcfbf7] hover:text-[#c5a880] text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer active:scale-95 focus:outline-none focus:ring-1 focus:ring-[#c5a880]"
              >
                <SkipForward className="w-4 h-4" />
                <span className="text-[11px] hidden sm:inline">Next</span>
              </button>

              {/* Mute / Unmute Button (44px min target) */}
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute music' : 'Mute music'}
                title={isMuted ? 'Unmute' : 'Mute'}
                className={`min-w-[44px] min-h-[44px] px-2.5 py-2 border transition-colors flex items-center justify-center cursor-pointer active:scale-95 focus:outline-none focus:ring-1 focus:ring-[#c5a880] ${
                  isMuted
                    ? 'border-red-500/50 text-red-300 bg-red-950/20'
                    : 'border-[#c5a880]/30 hover:border-[#c5a880] text-[#fcfbf7] hover:text-[#c5a880]'
                }`}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#c5a880]" />
                )}
              </button>
            </div>

            {/* Volume Slider Section */}
            <div className="space-y-1.5 pt-1 border-t border-[#c5a880]/15">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#a3978f] uppercase tracking-wider text-[9px] flex items-center gap-1">
                  Volume
                </span>
                <span className="font-mono text-[#c5a880] text-[11px]">
                  {isMuted ? '0%' : `${volumePercent}%`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="ambient-music-volume-slider"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={isMuted ? 0 : volumePercent}
                  onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                  aria-label="Background music volume percentage"
                  className="w-full h-1.5 bg-white/10 rounded-none appearance-none cursor-pointer accent-[#c5a880] focus:outline-none focus:ring-1 focus:ring-[#c5a880]"
                />
              </div>
            </div>

            {/* Track Carousel Status Tag */}
            <div className="pt-1 flex items-center justify-between text-[9px] text-[#8c827a] tracking-wider uppercase font-light">
              <span>Track {currentTrackIndex + 1} of {playlist.length}</span>
              <span>Smooth 3s Crossfade</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
