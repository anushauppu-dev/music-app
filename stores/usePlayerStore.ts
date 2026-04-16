import { create } from 'zustand';
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
};

export const usePlayerStore = create<PlayerState>((set) => ({
  currentSong: null,
  isPlaying: false,
  queue: [],
  queueIndex: 0,
  position: 0,
  duration: 0,
  repeatMode: 'off',
  shuffle: false,
}));
