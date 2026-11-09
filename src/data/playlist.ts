export interface AudioTrack {
  id: string;
  src: string;
  fallbackSrc?: string;
  title: string;
  artist: string;
  license?: string;
}

/**
 * Background Music Playlist Configuration
 * Browser-generated ambient soundscapes.
 */
export const PLAYLIST: AudioTrack[] = [
  {
    id: 'track1',
    src: '/audio/track1.mp3',
    fallbackSrc: '/assets/background-music.mp3',
    title: 'Ambient 1',
    artist: '',
  },
  {
    id: 'track2',
    src: '/audio/track2.mp3',
    title: 'Ambient 2',
    artist: '',
  },
  {
    id: 'track3',
    src: '/audio/track3.mp3',
    title: 'Ambient 3',
    artist: '',
  },
];
