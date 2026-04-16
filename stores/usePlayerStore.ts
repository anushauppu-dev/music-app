import { create } from 'zustand';
import type { Song } from '@/types';
import type { PermissionStatus } from '@/services/permissionService';

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
  permissionStatus: PermissionStatus;
  isLoadingSongs: boolean;
  songsError: string | null;

  setSongs: (songs: Song[]) => void;
  setPermissionStatus: (status: PermissionStatus) => void;
  setIsLoadingSongs: (loading: boolean) => void;
  setSongsError: (error: string | null) => void;
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

  songs: [],
  permissionStatus: 'undetermined',
  isLoadingSongs: false,
  songsError: null,

  setSongs: (songs) => set({ songs }),
  setPermissionStatus: (permissionStatus) => set({ permissionStatus }),
  setIsLoadingSongs: (isLoadingSongs) => set({ isLoadingSongs }),
  setSongsError: (songsError) => set({ songsError }),
}));
