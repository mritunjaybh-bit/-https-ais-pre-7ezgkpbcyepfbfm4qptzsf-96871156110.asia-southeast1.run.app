import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface MusicContextType {
  isMuted: boolean;
  isPlaying: boolean;
  volume: number;
  audioError: boolean;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Browsers block autoplay with sound on load: must start muted
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  // Default to continuous low volume (25%)
  const [volume, setVolumeState] = useState<number>(0.25);
  const [audioError, setAudioError] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element configuration on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = true; // explicitly start muted per browser autoplay policy

    // Attempt silent autoplay on load
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Normal browser autoplay policy waiting for user gesture
          setIsPlaying(false);
        });
    }
  }, []);

  // Sync volume state with audio element
  const setVolume = (newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  // Toggle mute / unmute button action
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      // User is unmuting: turn sound on and play
      audio.muted = false;
      audio.volume = volume;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsMuted(false);
            setIsPlaying(true);
            setAudioError(false);
          })
          .catch((err) => {
            console.warn('[Audio] Playback interrupted or user interaction required:', err);
            // Retry unmuting
            setIsMuted(false);
          });
      } else {
        setIsMuted(false);
        setIsPlaying(true);
      }
    } else {
      // User is muting: mute sound
      audio.muted = true;
      setIsMuted(true);
    }
  };

  return (
    <MusicContext.Provider
      value={{
        isMuted,
        isPlaying,
        volume,
        audioError,
        toggleMute,
        setVolume,
        audioRef,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
