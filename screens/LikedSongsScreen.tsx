import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useLibraryStore } from '@/stores/useLibraryStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { SongListItem } from '@/components/SongListItem';
import { SongOptionsMenu } from '@/components/SongOptionsMenu';
import { colors } from '@/utils/colors';
import type { Song } from '@/types';

export default function LikedSongsScreen() {
  const likedSongIds = useLibraryStore((s) => s.likedSongIds);
  const songs = usePlayerStore((s) => s.songs);
  const setQueue = usePlayerStore((s) => s.setQueue);

  const [optionsSong, setOptionsSong] = useState<Song | null>(null);

  const likedSongs = songs.filter((s) => likedSongIds.includes(s.id));

  const handlePress = useCallback(
    (index: number) => {
      setQueue(likedSongs, index);
    },
    [likedSongs, setQueue],
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {likedSongs.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="favorite-border" size={56} color={colors.icon} />
          <Text style={styles.emptyText}>No liked songs yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the heart icon on any song to like it.
          </Text>
        </View>
      ) : (
        <FlatList
          data={likedSongs}
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
