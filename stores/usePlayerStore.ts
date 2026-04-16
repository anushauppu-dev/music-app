import { create } from 'zustand';
import { AVPlaybackStatus } from 'expo-av';
import { AudioPlayer } from '@/services/audioService';
import type { Song } from '@/types';

type RepeatMode = 'off' | 'all' | 'one';

type PlayerState = {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  queueIndex: number;
  originalQueue: Song[]; // saved when shuffle is enabled, for restore
  position: number;
  duration: number;
  repeatMode: RepeatMode;
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
  setRepeatMode: (mode: RepeatMode) => void;
  cycleRepeatMode: () => void;
  setShuffle: (shuffle: boolean) => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  seek: (position: number) => void;
  togglePlayPause: () => void;
  playNow: (song: Song) => void;
  playNext: (song: Song) => void;
  addToQueue: (song: Song) => void;
};

const audioPlayer = new AudioPlayer();

// Debounce timers — module-level to survive re-renders
let nextDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let prevDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  queue: [],
  queueIndex: 0,
  originalQueue: [],
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

  cycleRepeatMode: () => {
    const map: Record<RepeatMode, RepeatMode> = { off: 'all', all: 'one', one: 'off' };
    set((s) => ({ repeatMode: map[s.repeatMode] }));
  },

  setShuffle: (shuffle) => {
    const { queue, queueIndex, currentSong, originalQueue } = get();
    if (shuffle) {
      // Save current order; shuffle tracks after current to front
      const current = queue[queueIndex];
      const remaining = queue.filter((_, i) => i !== queueIndex);
      const shuffledRemaining = shuffleArray(remaining);
      const newQueue = current ? [current, ...shuffledRemaining] : shuffledRemaining;
      set({ shuffle: true, originalQueue: [...queue], queue: newQueue, queueIndex: 0 });
    } else {
      // Restore original order, preserve current track position
      const source = originalQueue.length > 0 ? originalQueue : queue;
      const newIndex = currentSong
        ? source.findIndex((s) => s.id === currentSong.id)
        : 0;
      set({
        shuffle: false,
        queue: source,
        queueIndex: Math.max(0, newIndex),
        originalQueue: [],
      });
    }
  },

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
    if (isPlaying) get().pause();
    else get().play();
  },

  next: () => {
    // Debounce rapid taps
    if (nextDebounceTimer) return;
    nextDebounceTimer = setTimeout(() => { nextDebounceTimer = null; }, 300);

    const { queue, queueIndex, repeatMode, shuffle } = get();
    if (queue.length === 0) return;

    if (repeatMode === 'one') {
      void audioPlayer.seek(0).then(() => audioPlayer.play());
      set({ isPlaying: true, position: 0 });
      return;
    }

    let nextIndex: number;
    let newQueue = queue;

    if (shuffle) {
      const remaining = queue.slice(queueIndex + 1);
      if (remaining.length === 0) {
        if (repeatMode === 'all') {
          newQueue = shuffleArray(queue);
          nextIndex = 0;
        } else {
          set({ isPlaying: false });
          return;
        }
      } else {
        // Shuffle remaining in place on each advance
        const shuffledRemaining = shuffleArray(remaining);
        newQueue = [...queue.slice(0, queueIndex + 1), ...shuffledRemaining];
        nextIndex = queueIndex + 1;
      }
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

    const song = newQueue[nextIndex];
    set({ queue: newQueue, queueIndex: nextIndex, currentSong: song, isPlaying: false, position: 0, duration: 0 });
    void audioPlayer.load(song).then(() => {
      void audioPlayer.play();
      set({ isPlaying: true });
    });
  },

  previous: () => {
    // Debounce rapid taps
    if (prevDebounceTimer) return;
    prevDebounceTimer = setTimeout(() => { prevDebounceTimer = null; }, 300);

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

  // Replaces current queue with [song, ...remaining after current]; plays immediately
  playNow: (song) => {
    const { queue, queueIndex } = get();
    const remaining = queue.slice(queueIndex + 1);
    const newQueue = [song, ...remaining];
    set({ queue: newQueue, queueIndex: 0, currentSong: song, isPlaying: false, position: 0, duration: 0 });
    void audioPlayer.load(song).then(() => {
      void audioPlayer.play();
      set({ isPlaying: true });
    });
  },

  // Inserts song immediately after the current track
  playNext: (song) => {
    const { queue, queueIndex } = get();
    const newQueue = [
      ...queue.slice(0, queueIndex + 1),
      song,
      ...queue.slice(queueIndex + 1),
    ];
    set({ queue: newQueue });
  },

  // Appends song to end of queue
  addToQueue: (song) => {
    const { queue } = get();
    set({ queue: [...queue, song] });
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
