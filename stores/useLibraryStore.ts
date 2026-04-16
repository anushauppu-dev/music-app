import { create } from 'zustand';

type Album = {
  id: string;
  name: string;
  songIds: string[];
  createdAt: string;
};

type LibraryState = {
  likedSongIds: string[];
  albums: Album[];
  isLoaded: boolean;
};

export const useLibraryStore = create<LibraryState>((set) => ({
  likedSongIds: [],
  albums: [],
  isLoaded: false,
}));
