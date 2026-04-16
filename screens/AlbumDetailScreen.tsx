import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useLibraryStore } from '@/stores/useLibraryStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { SongListItem } from '@/components/SongListItem';
import { SongOptionsMenu } from '@/components/SongOptionsMenu';
import { colors } from '@/utils/colors';
import type { Song } from '@/types';

export default function AlbumDetailScreen() {
  const params = useLocalSearchParams<{
    id: string;
    type: 'user' | 'system';
    name: string;
    groupBy?: 'album' | 'artist';
  }>();

  const { id, type, name, groupBy } = params;

  const allSongs = usePlayerStore((s) => s.songs);
  const setQueue = usePlayerStore((s) => s.setQueue);

  const albums = useLibraryStore((s) => s.albums);

  const [optionsSong, setOptionsSong] = useState<Song | null>(null);

  // Resolve songs for this album/artist view
  const songs = useMemo<Song[]>(() => {
    if (type === 'user') {
      const album = albums.find((a) => a.id === id);
      if (!album) return [];
      return allSongs.filter((s) => album.songIds.includes(s.id));
    }
    // System album: filter by metadata
    if (groupBy === 'album') {
      return allSongs.filter((s) => s.album === name);
    }
    if (groupBy === 'artist') {
      return allSongs.filter((s) => s.artist === name);
    }
    return [];
  }, [type, id, name, groupBy, allSongs, albums]);

  const handlePress = useCallback(
    (index: number) => {
      setQueue(songs, index);
    },
    [songs, setQueue],
  );

  const isUserAlbum = type === 'user';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {songs.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="queue-music" size={56} color={colors.icon} />
          <Text style={styles.emptyText}>No songs in this album</Text>
          {isUserAlbum && (
            <Text style={styles.emptySubtext}>
              Use the options menu on any song to add it here.
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <SongListItem
              song={item}
              onPress={() => handlePress(index)}
              onOptionsPress={setOptionsSong}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <SongOptionsMenu
        song={optionsSong}
        visible={!!optionsSong}
        onClose={() => setOptionsSong(null)}
        contextAlbumId={isUserAlbum ? id : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 32,
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
  listContent: {
    paddingBottom: 120,
  },
});
