import { create } from 'zustand';
import { AVPlaybackStatus } from 'expo-av';
import { AudioPlayer } from '@/services/audioService';
import type { Song } from '@/types';

type PlayerState = {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  queueIndex: number;
  position: number;
  duration: number;
  repeatMode: 'off' | 'all' | 'one';
  shuffle: boolean;

  songs: Song[];
  isLoadingSongs: boolean;
  songsError: string | null;

  setSongs: (songs: Song[]) => void;
  setIsLoadingSongs: (loading: boolean) => void;
  setSongsError: (error: string | null) => void;

  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setQueue: (queue: Song[], startIndex?: number) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setRepeatMode: (mode: 'off' | 'all' | 'one') => void;
  setShuffle: (shuffle: boolean) => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  seek: (position: number) => void;
  togglePlayPause: () => void;
};

const audioPlayer = new AudioPlayer();

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  queue: [],
  queueIndex: 0,
  position: 0,
  duration: 0,
  repeatMode: 'off',
  shuffle: false,

  songs: [],
  isLoadingSongs: false,
  songsError: null,

  setSongs: (songs) => set({ songs }),
  setIsLoadingSongs: (isLoadingSongs) => set({ isLoadingSongs }),
  setSongsError: (songsError) => set({ songsError }),

  setCurrentSong: (currentSong) => set({ currentSong }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),
  setRepeatMode: (repeatMode) => set({ repeatMode }),
  setShuffle: (shuffle) => set({ shuffle }),

  setQueue: (queue, startIndex = 0) => {
    const song = queue[startIndex];
    if (!song) return;
    set({ queue, queueIndex: startIndex, currentSong: song, isPlaying: false, position: 0, duration: 0 });
    void audioPlayer.load(song).then(() => {
      void audioPlayer.play();
      set({ isPlaying: true });
    });
  },

  play: () => {
    void audioPlayer.play();
    set({ isPlaying: true });
  },

  pause: () => {
    void audioPlayer.pause();
    set({ isPlaying: false });
  },

  togglePlayPause: () => {
    const { isPlaying } = get();
    if (isPlaying) {
      get().pause();
    } else {
      get().play();
    }
  },

  next: () => {
    const { queue, queueIndex, repeatMode, shuffle } = get();
    if (queue.length === 0) return;

    if (repeatMode === 'one') {
      void audioPlayer.seek(0).then(() => audioPlayer.play());
      set({ isPlaying: true, position: 0 });
      return;
    }

    let nextIndex: number;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          set({ isPlaying: false });
          return;
        }
      }
    }

    const song = queue[nextIndex];
    set({ queueIndex: nextIndex, currentSong: song, isPlaying: false, position: 0, duration: 0 });
    void audioPlayer.load(song).then(() => {
      void audioPlayer.play();
      set({ isPlaying: true });
    });
  },

  previous: () => {
    const { queue, queueIndex, position } = get();
    if (queue.length === 0) return;

    if (position > 3000) {
      void audioPlayer.seek(0);
      set({ position: 0 });
      return;
    }

    const prevIndex = queueIndex > 0 ? queueIndex - 1 : queue.length - 1;
    const song = queue[prevIndex];
    set({ queueIndex: prevIndex, currentSong: song, isPlaying: false, position: 0, duration: 0 });
    void audioPlayer.load(song).then(() => {
      void audioPlayer.play();
      set({ isPlaying: true });
    });
  },

  seek: (position) => {
    void audioPlayer.seek(position);
  },
}));

audioPlayer.setOnStatusUpdate((status: AVPlaybackStatus) => {
  if (status.isLoaded) {
    usePlayerStore.setState({
      position: status.positionMillis,
      duration: status.durationMillis ?? 0,
      isPlaying: status.isPlaying,
    });
    if (status.didJustFinish) {
      usePlayerStore.getState().next();
    }
  }
});
