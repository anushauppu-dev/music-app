import { create } from 'zustand';
import * as FileSystem from 'expo-file-system/legacy';

const STORE_PATH = FileSystem.documentDirectory + 'library-store.json';
const SCHEMA_VERSION = 1;

export type Album = {
  id: string;
  name: string;
  songIds: string[];
  createdAt: string;
};

type PersistedData = {
  likedSongIds: string[];
  albums: Album[];
  version: number;
};

type LibraryState = {
  likedSongIds: string[];
  albums: Album[];
  isLoaded: boolean;

  loadFromDisk: () => Promise<void>;
  toggleLike: (songId: string) => void;
  isLiked: (songId: string) => boolean;
  createAlbum: (name: string) => void;
  renameAlbum: (id: string, name: string) => void;
  deleteAlbum: (id: string) => void;
  addSongToAlbum: (albumId: string, songId: string) => void;
  removeSongFromAlbum: (albumId: string, songId: string) => void;
};

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function saveToDisk(
  data: Pick<LibraryState, 'likedSongIds' | 'albums'>,
): Promise<void> {
  const payload: PersistedData = {
    likedSongIds: data.likedSongIds,
    albums: data.albums,
    version: SCHEMA_VERSION,
  };
  try {
    await FileSystem.writeAsStringAsync(STORE_PATH, JSON.stringify(payload));
  } catch (err) {
    console.error('[library-store] write error (unknown):', err);
  }
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  likedSongIds: [],
  albums: [],
  isLoaded: false,

  loadFromDisk: async () => {
    try {
      const json = await FileSystem.readAsStringAsync(STORE_PATH);
      const data = JSON.parse(json) as PersistedData;
      set({
        likedSongIds: data.likedSongIds ?? [],
        albums: data.albums ?? [],
        isLoaded: true,
      });
    } catch (err: unknown) {
      const isNotFound =
        err instanceof Error &&
        (err.message.includes('No such file') ||
          err.message.includes('could not be read') ||
          err.message.includes('ENOENT'));
      if (!isNotFound) {
        // store_corrupt — reset to defaults, do not crash
        console.error('[library-store] load error (store_corrupt):', err);
      }
      set({ likedSongIds: [], albums: [], isLoaded: true });
    }
  },

  toggleLike: (songId) => {
    const { likedSongIds, albums } = get();
    const next = likedSongIds.includes(songId)
      ? likedSongIds.filter((id) => id !== songId)
      : [...likedSongIds, songId];
    set({ likedSongIds: next });
    void saveToDisk({ likedSongIds: next, albums });
  },

  isLiked: (songId) => get().likedSongIds.includes(songId),

  createAlbum: (name) => {
    const { albums, likedSongIds } = get();
    const newAlbum: Album = {
      id: generateId(),
      name,
      songIds: [],
      createdAt: new Date().toISOString(),
    };
    const next = [...albums, newAlbum];
    set({ albums: next });
    void saveToDisk({ likedSongIds, albums: next });
  },

  renameAlbum: (id, name) => {
    const { albums, likedSongIds } = get();
    const next = albums.map((a) => (a.id === id ? { ...a, name } : a));
    set({ albums: next });
    void saveToDisk({ likedSongIds, albums: next });
  },

  deleteAlbum: (id) => {
    const { albums, likedSongIds } = get();
    const next = albums.filter((a) => a.id !== id);
    set({ albums: next });
    void saveToDisk({ likedSongIds, albums: next });
  },

  addSongToAlbum: (albumId, songId) => {
    const { albums, likedSongIds } = get();
    const next = albums.map((a) =>
      a.id === albumId && !a.songIds.includes(songId)
        ? { ...a, songIds: [...a.songIds, songId] }
        : a,
    );
    set({ albums: next });
    void saveToDisk({ likedSongIds, albums: next });
  },

  removeSongFromAlbum: (albumId, songId) => {
    const { albums, likedSongIds } = get();
    const next = albums.map((a) =>
      a.id === albumId
        ? { ...a, songIds: a.songIds.filter((id) => id !== songId) }
        : a,
    );
    set({ albums: next });
    void saveToDisk({ likedSongIds, albums: next });
  },
}));
