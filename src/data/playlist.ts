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
 * 
 * Upload MP3 files to public/audio/ as track1.mp3, track2.mp3, and track3.mp3.
 * You can edit titles, artists, and license credits below.
 * Credits will only appear in the footer if both title and artist are specified.
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
