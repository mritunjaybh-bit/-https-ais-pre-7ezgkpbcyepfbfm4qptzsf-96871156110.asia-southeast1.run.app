import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { PLAYLIST, AudioTrack } from '../data/playlist';

interface MusicContextType {
  isPlaying: boolean;
  isMuted: boolean;
  volumePercent: number; // 0 to 100
  currentTrack: AudioTrack | null;
  currentTrackIndex: number;
  playlist: AudioTrack[];
  hasPlayableTracks: boolean;
  hasInteracted: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (percent: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  audioRef?: React.RefObject<HTMLAudioElement | null>; // legacy backwards compatibility
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

// Safe LocalStorage helpers per Rule 3
const getStorageItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setStorageItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage quota or access errors
  }
};

// Check if current route is an admin or staff route
const isAdminRoute = (): boolean => {
  try {
    const path = window.location.pathname.toLowerCase();
    return (
      path.startsWith('/admin') ||
      path.startsWith('/mritunjay-admin-orders') ||
      path.startsWith('/login') ||
      path.startsWith('/setup')
    );
  } catch {
    return false;
  }
};

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read initial stored preferences (Default: volume 80%, not muted, not paused for first-time visitors)
  const initialVolume = (() => {
    const stored = getStorageItem('caphe_music_volume');
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      return !isNaN(parsed) && parsed >= 0 && parsed <= 100 ? parsed : 80;
    }
    return 80;
  })();

  const initialMuted = (() => {
    return getStorageItem('caphe_music_muted') === 'true';
  })();

  const initialUserPaused = (() => {
    return getStorageItem('caphe_music_user_paused') === 'true';
  })();

  const initialInteracted = (() => {
    return getStorageItem('caphe_music_has_interacted') === 'true';
  })();

  // State
  const [volumePercent, setVolumePercentState] = useState<number>(initialVolume);
  const [isMuted, setIsMutedState] = useState<boolean>(initialMuted);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(initialInteracted);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [hasPlayableTracks, setHasPlayableTracks] = useState<boolean>(true);

  // References to Web Audio Nodes & HTML Audio Elements
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const audioARef = useRef<HTMLAudioElement | null>(null);
  const audioBRef = useRef<HTMLAudioElement | null>(null);
  const gainARef = useRef<GainNode | null>(null);
  const gainBRef = useRef<GainNode | null>(null);
  const activeChannelRef = useRef<'A' | 'B'>('A');

  // Track attempt counts to detect if all tracks fail
  const failedTracksCountRef = useRef<number>(0);
  const isTransitioningRef = useRef<boolean>(false);
  const userPausedRef = useRef<boolean>(initialUserPaused);
  const wasPlayingBeforeBackgroundRef = useRef<boolean>(false);
  const fadeTimeoutRef = useRef<number | null>(null);

  // Initialize Web Audio graph
  const initAudioGraph = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return null;

      const ctx = new AudioContextClass();
      const masterGain = ctx.createGain();

      // Master volume matches stored setting (normalized 0.0 to 1.0)
      const targetGain = initialMuted ? 0.0001 : (initialVolume / 100);
      masterGain.gain.setValueAtTime(targetGain, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Create Audio Element A
      const elA = new Audio();
      elA.crossOrigin = 'anonymous';
      elA.preload = 'metadata'; // Only load metadata for first track
      const sourceA = ctx.createMediaElementSource(elA);
      const gainA = ctx.createGain();
      gainA.gain.setValueAtTime(1.0, ctx.currentTime);
      sourceA.connect(gainA);
      gainA.connect(masterGain);

      // Create Audio Element B (for 3s crossfading)
      const elB = new Audio();
      elB.crossOrigin = 'anonymous';
      elB.preload = 'none';
      const sourceB = ctx.createMediaElementSource(elB);
      const gainB = ctx.createGain();
      gainB.gain.setValueAtTime(0.0001, ctx.currentTime);
      sourceB.connect(gainB);
      gainB.connect(masterGain);

      audioContextRef.current = ctx;
      masterGainRef.current = masterGain;
      audioARef.current = elA;
      audioBRef.current = elB;
      gainARef.current = gainA;
      gainBRef.current = gainB;

      // Initialize first track source on Channel A
      if (PLAYLIST.length > 0) {
        elA.src = PLAYLIST[0].src;
      }

      return ctx;
    } catch (e) {
      console.warn('[Audio] Web Audio initialization deferred:', e);
      return null;
    }
  }, [initialMuted, initialVolume]);

  // Master Gain Volume Ramp Helper (works reliably on iOS Safari)
  const rampMasterGain = useCallback(
    (targetVal: number, durationSeconds: number) => {
      const ctx = audioContextRef.current;
      const master = masterGainRef.current;
      if (!ctx || !master) return;

      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      // Exponential or linear ramp to value
      master.gain.linearRampToValueAtTime(Math.max(0.0001, targetVal), now + durationSeconds);
    },
    []
  );

  // Play Active Channel with 2-second Fade-In
  const playActiveChannel = useCallback(
    async (fadeIn = true) => {
      if (isAdminRoute()) return; // Never play on admin pages (Rule 2)

      const ctx = initAudioGraph();
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch {
          // Will resume on next user interaction
        }
      }

      const activeEl = activeChannelRef.current === 'A' ? audioARef.current : audioBRef.current;
      if (!activeEl) return;

      try {
        if (fadeIn) {
          // Start quiet and fade in over 2s
          rampMasterGain(0.0001, 0.01);
          await activeEl.play();
          setIsPlaying(true);
          const targetVol = isMuted ? 0.0001 : volumePercent / 100;
          rampMasterGain(targetVol, 2.0);
        } else {
          await activeEl.play();
          setIsPlaying(true);
        }
      } catch (err) {
        console.debug('[Audio] Autoplay waiting for interaction:', err);
      }
    },
    [initAudioGraph, isMuted, rampMasterGain, volumePercent]
  );

  // Pause Active Channel with 1.5-second Fade-Out
  const pauseActiveChannel = useCallback(
    (fadeOut = true) => {
      if (fadeTimeoutRef.current) {
        window.clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }

      if (fadeOut && audioContextRef.current && isPlaying) {
        // Smooth 1.5s fade-out
        rampMasterGain(0.0001, 1.5);
        fadeTimeoutRef.current = window.setTimeout(() => {
          const activeEl = activeChannelRef.current === 'A' ? audioARef.current : audioBRef.current;
          if (activeEl) {
            activeEl.pause();
          }
          setIsPlaying(false);
        }, 1500);
      } else {
        const activeEl = activeChannelRef.current === 'A' ? audioARef.current : audioBRef.current;
        if (activeEl) {
          activeEl.pause();
        }
        setIsPlaying(false);
      }
    },
    [isPlaying, rampMasterGain]
  );

  // Crossfade to Track (3-second crossfade)
  const crossfadeToTrack = useCallback(
    async (nextIndex: number) => {
      if (isTransitioningRef.current || PLAYLIST.length === 0) return;
      isTransitioningRef.current = true;

      const ctx = initAudioGraph();
      if (!ctx) {
        isTransitioningRef.current = false;
        return;
      }

      const nextTrack = PLAYLIST[nextIndex];
      const isChannelA = activeChannelRef.current === 'A';
      const outgoingEl = isChannelA ? audioARef.current : audioBRef.current;
      const outgoingGain = isChannelA ? gainARef.current : gainBRef.current;
      const incomingEl = isChannelA ? audioBRef.current : audioARef.current;
      const incomingGain = isChannelA ? gainBRef.current : gainARef.current;

      if (!incomingEl || !outgoingEl || !incomingGain || !outgoingGain) {
        isTransitioningRef.current = false;
        return;
      }

      // Configure next track on incoming audio element
      incomingEl.src = nextTrack.src;
      incomingEl.currentTime = 0;

      // Handle fallback source if track fails to load
      const handleIncomingError = () => {
        if (nextTrack.fallbackSrc && incomingEl.src !== nextTrack.fallbackSrc) {
          incomingEl.src = nextTrack.fallbackSrc;
          incomingEl.play().catch(() => {});
        } else {
          // Skip silently to next track
          failedTracksCountRef.current += 1;
          if (failedTracksCountRef.current >= PLAYLIST.length) {
            setHasPlayableTracks(false);
            pauseActiveChannel(false);
          }
        }
      };

      incomingEl.onerror = handleIncomingError;

      try {
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        // Ramp incoming gain from 0 to 1 over 3.0s
        const now = ctx.currentTime;
        incomingGain.gain.cancelScheduledValues(now);
        incomingGain.gain.setValueAtTime(0.0001, now);
        incomingGain.gain.linearRampToValueAtTime(1.0, now + 3.0);

        // Ramp outgoing gain from current to 0 over 3.0s
        outgoingGain.gain.cancelScheduledValues(now);
        outgoingGain.gain.setValueAtTime(outgoingGain.gain.value, now);
        outgoingGain.gain.linearRampToValueAtTime(0.0001, now + 3.0);

        await incomingEl.play();
        activeChannelRef.current = isChannelA ? 'B' : 'A';
        setCurrentTrackIndex(nextIndex);
        setIsPlaying(true);
        failedTracksCountRef.current = 0; // Reset fail counter on successful play

        // Clean up outgoing track after 3s crossfade
        setTimeout(() => {
          outgoingEl.pause();
          outgoingEl.currentTime = 0;
          isTransitioningRef.current = false;
        }, 3100);
      } catch {
        isTransitioningRef.current = false;
      }
    },
    [initAudioGraph, pauseActiveChannel]
  );

  // Next Track
  const nextTrack = useCallback(() => {
    if (PLAYLIST.length === 0) return;
    const nextIdx = (currentTrackIndex + 1) % PLAYLIST.length;
    crossfadeToTrack(nextIdx);
  }, [crossfadeToTrack, currentTrackIndex]);

  // Previous Track
  const prevTrack = useCallback(() => {
    if (PLAYLIST.length === 0) return;
    const prevIdx = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    crossfadeToTrack(prevIdx);
  }, [crossfadeToTrack, currentTrackIndex]);

  // Toggle Play / Pause
  const togglePlay = useCallback(() => {
    setHasInteracted(true);
    setStorageItem('caphe_music_has_interacted', 'true');

    if (isPlaying) {
      userPausedRef.current = true;
      setStorageItem('caphe_music_user_paused', 'true');
      pauseActiveChannel(true);
    } else {
      userPausedRef.current = false;
      setStorageItem('caphe_music_user_paused', 'false');
      playActiveChannel(true);
    }
  }, [isPlaying, pauseActiveChannel, playActiveChannel]);

  // Toggle Mute / Unmute
  const toggleMute = useCallback(() => {
    setHasInteracted(true);
    setStorageItem('caphe_music_has_interacted', 'true');

    const nextMuted = !isMuted;
    setIsMutedState(nextMuted);
    setStorageItem('caphe_music_muted', String(nextMuted));

    if (nextMuted) {
      // 1.5s fade-out to silent
      rampMasterGain(0.0001, 1.5);
    } else {
      // 2s fade-in to current volume
      if (!isPlaying && !userPausedRef.current) {
        playActiveChannel(true);
      } else {
        rampMasterGain(volumePercent / 100, 2.0);
      }
    }
  }, [isMuted, isPlaying, playActiveChannel, rampMasterGain, volumePercent]);

  // Set Volume (0 to 100) - controls Web Audio GainNode directly
  const setVolume = useCallback(
    (newPercent: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(newPercent)));
      setVolumePercentState(clamped);
      setStorageItem('caphe_music_volume', String(clamped));

      if (isMuted) {
        setIsMutedState(false);
        setStorageItem('caphe_music_muted', 'false');
      }

      // Directly update master gain node
      const ctx = audioContextRef.current;
      const master = masterGainRef.current;
      if (ctx && master) {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(clamped / 100, ctx.currentTime);
      }
    },
    [isMuted]
  );

  // Set up Track Ended and Error listeners on audio elements
  useEffect(() => {
    const elA = audioARef.current;
    const elB = audioBRef.current;

    const onEnded = () => {
      nextTrack();
    };

    const onErrorA = () => {
      const currentTrack = PLAYLIST[currentTrackIndex];
      if (currentTrack?.fallbackSrc && elA && elA.src !== currentTrack.fallbackSrc) {
        elA.src = currentTrack.fallbackSrc;
        elA.play().catch(() => {});
      } else {
        failedTracksCountRef.current += 1;
        if (failedTracksCountRef.current >= PLAYLIST.length) {
          setHasPlayableTracks(false);
          setIsPlaying(false);
        } else {
          nextTrack();
        }
      }
    };

    const onErrorB = () => {
      const currentTrack = PLAYLIST[currentTrackIndex];
      if (currentTrack?.fallbackSrc && elB && elB.src !== currentTrack.fallbackSrc) {
        elB.src = currentTrack.fallbackSrc;
        elB.play().catch(() => {});
      } else {
        failedTracksCountRef.current += 1;
        if (failedTracksCountRef.current >= PLAYLIST.length) {
          setHasPlayableTracks(false);
          setIsPlaying(false);
        } else {
          nextTrack();
        }
      }
    };

    if (elA) {
      elA.addEventListener('ended', onEnded);
      elA.addEventListener('error', onErrorA);
    }
    if (elB) {
      elB.addEventListener('ended', onEnded);
      elB.addEventListener('error', onErrorB);
    }

    return () => {
      if (elA) {
        elA.removeEventListener('ended', onEnded);
        elA.removeEventListener('error', onErrorA);
      }
      if (elB) {
        elB.removeEventListener('ended', onEnded);
        elB.removeEventListener('error', onErrorB);
      }
    };
  }, [currentTrackIndex, nextTrack]);

  // First Interaction Autoplay Listener (tap, click, keydown, scroll)
  useEffect(() => {
    // If visitor previously paused or muted, do NOT auto-start
    if (initialUserPaused || initialMuted || isAdminRoute()) {
      return;
    }

    const handleFirstInteraction = () => {
      setHasInteracted(true);
      setStorageItem('caphe_music_has_interacted', 'true');

      if (!userPausedRef.current && !isAdminRoute()) {
        playActiveChannel(true);
      }

      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    window.addEventListener('click', handleFirstInteraction, { passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { passive: true });
    window.addEventListener('scroll', handleFirstInteraction, { passive: true });

    return () => {
      cleanupListeners();
    };
  }, [initialMuted, initialUserPaused, playActiveChannel]);

  // Tab Backgrounding & Visibility Change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isPlaying) {
          wasPlayingBeforeBackgroundRef.current = true;
          pauseActiveChannel(false);
        }
      } else {
        if (wasPlayingBeforeBackgroundRef.current && !userPausedRef.current && !isAdminRoute()) {
          wasPlayingBeforeBackgroundRef.current = false;
          playActiveChannel(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, pauseActiveChannel, playActiveChannel]);

  // Check URL changes to enforce Rule 2: Never play on admin pages
  useEffect(() => {
    const checkRoute = () => {
      if (isAdminRoute()) {
        pauseActiveChannel(false);
      }
    };

    window.addEventListener('popstate', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
    };
  }, [pauseActiveChannel]);

  const currentTrack = PLAYLIST[currentTrackIndex] || null;

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        isMuted,
        volumePercent,
        currentTrack,
        currentTrackIndex,
        playlist: PLAYLIST,
        hasPlayableTracks,
        hasInteracted,
        togglePlay,
        toggleMute,
        setVolume,
        nextTrack,
        prevTrack,
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
