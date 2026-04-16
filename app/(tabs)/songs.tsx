import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePlayerStore } from '@/stores/usePlayerStore';
import { pickSongsFromFiles } from '@/services/discoveryService';
import { SongListItem } from '@/components/SongListItem';
import { SongOptionsMenu } from '@/components/SongOptionsMenu';
import { colors } from '@/utils/colors';
import type { Song } from '@/types';

type SortMode = 'az' | 'za' | 'artist' | 'duration';

const SORT_LABELS: Record<SortMode, string> = {
  az: 'A – Z',
  za: 'Z – A',
  artist: 'By Artist',
  duration: 'By Duration',
};

export default function SongsScreen() {
  const {
    songs,
    isLoadingSongs,
    songsError,
    setSongs,
    setIsLoadingSongs,
    setSongsError,
    setQueue,
  } = usePlayerStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('az');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [optionsSong, setOptionsSong] = useState<Song | null>(null);

  const handlePickFiles = useCallback(async () => {
    setIsLoadingSongs(true);
    setSongsError(null);

    try {
      const picked = await pickSongsFromFiles();
      if (picked !== null) {
        const existingUris = new Set(songs.map((s) => s.uri));
        const newSongs = picked.filter((s) => !existingUris.has(s.uri));
        setSongs([...songs, ...newSongs]);
      }
    } catch (err) {
      setSongsError(err instanceof Error ? err.message : 'Failed to load songs');
    } finally {
      setIsLoadingSongs(false);
    }
  }, [songs, setSongs, setIsLoadingSongs, setSongsError]);

  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? songs.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.artist.toLowerCase().includes(q),
        )
      : songs;

    return [...filtered].sort((a, b) => {
      switch (sortMode) {
        case 'az':
          return a.title.localeCompare(b.title);
        case 'za':
          return b.title.localeCompare(a.title);
        case 'artist':
          return a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title);
        case 'duration':
          return a.duration - b.duration;
      }
    });
  }, [songs, searchQuery, sortMode]);

  const handleSongPress = useCallback(
    (index: number) => {
      setQueue(filteredAndSorted, index);
    },
    [filteredAndSorted, setQueue],
  );

  if (isLoadingSongs) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.tint} />
      </SafeAreaView>
    );
  }

  if (songsError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{songsError}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handlePickFiles}>
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (songs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🎵</Text>
          <Text style={styles.emptyText}>No songs yet</Text>
          <Text style={styles.emptySubtext}>
            Tap below to pick music files from your device
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handlePickFiles}>
            <Text style={styles.primaryButtonText}>Pick Music Files</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Songs</Text>
        <View style={styles.headerRight}>
          <Text style={styles.headerCount}>{songs.length} songs</Text>
          <TouchableOpacity style={styles.addButton} onPress={handlePickFiles}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search + Sort toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs…"
            placeholderTextColor={colors.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="never"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortMenu((v) => !v)}
        >
          <Text style={styles.sortButtonText}>⇅ {SORT_LABELS[sortMode]}</Text>
        </TouchableOpacity>
      </View>

      {/* Sort dropdown */}
      {showSortMenu && (
        <View style={styles.sortMenu}>
          {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.sortMenuItem, sortMode === mode && styles.sortMenuItemActive]}
              onPress={() => {
                setSortMode(mode);
                setShowSortMenu(false);
              }}
            >
              <Text
                style={[
                  styles.sortMenuItemText,
                  sortMode === mode && styles.sortMenuItemTextActive,
                ]}
              >
                {SORT_LABELS[mode]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={filteredAndSorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <SongListItem
            song={item}
            onPress={() => handleSongPress(index)}
            onOptionsPress={setOptionsSong}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No results</Text>
          </View>
        }
      />

      <SongOptionsMenu
        song={optionsSong}
        visible={!!optionsSong}
        onClose={() => setOptionsSong(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.icon,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  headerCount: {
    fontSize: 14,
    color: colors.icon,
  },
  addButton: {
    backgroundColor: colors.tint,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addButtonText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '600',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.icon,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2d2e',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    color: colors.icon,
    fontSize: 12,
  },
  sortButton: {
    backgroundColor: '#2a2d2e',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sortButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  sortMenu: {
    position: 'absolute',
    right: 12,
    top: 120,
    backgroundColor: '#2a2d2e',
    borderRadius: 10,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 140,
  },
  sortMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortMenuItemActive: {
    backgroundColor: '#3a3d3e',
  },
  sortMenuItemText: {
    color: colors.text,
    fontSize: 14,
  },
  sortMenuItemTextActive: {
    color: colors.tint,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 160,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.icon,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: colors.tint,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
});
