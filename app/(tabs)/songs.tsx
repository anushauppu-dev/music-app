import { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePlayerStore } from '@/stores/usePlayerStore';
import { pickSongsFromFiles } from '@/services/discoveryService';
import { colors } from '@/utils/colors';
import type { Song } from '@/types';

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function SongRow({ song }: { song: Song }) {
  return (
    <TouchableOpacity style={styles.songRow} onPress={() => {}}>
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {song.artist}
        </Text>
      </View>
      <Text style={styles.songDuration}>{formatDuration(song.duration)}</Text>
    </TouchableOpacity>
  );
}

export default function SongsScreen() {
  const {
    songs,
    isLoadingSongs,
    songsError,
    setSongs,
    setIsLoadingSongs,
    setSongsError,
  } = usePlayerStore();

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
          <TouchableOpacity style={styles.retryButton} onPress={handlePickFiles}>
            <Text style={styles.retryText}>Try Again</Text>
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
          <TouchableOpacity style={styles.retryButton} onPress={handlePickFiles}>
            <Text style={styles.retryText}>Pick Music Files</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Songs</Text>
        <View style={styles.headerRight}>
          <Text style={styles.headerCount}>{songs.length} songs</Text>
          <TouchableOpacity style={styles.addButton} onPress={handlePickFiles}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SongRow song={item} />}
        contentContainerStyle={styles.list}
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
  list: {
    paddingBottom: 100,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.icon,
  },
  songInfo: {
    flex: 1,
    marginRight: 16,
  },
  songTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  songArtist: {
    fontSize: 13,
    color: colors.icon,
    marginTop: 2,
  },
  songDuration: {
    fontSize: 13,
    color: colors.icon,
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
  retryButton: {
    marginTop: 12,
    backgroundColor: colors.tint,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
});
