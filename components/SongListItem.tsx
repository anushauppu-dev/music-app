import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useLibraryStore } from '@/stores/useLibraryStore';
import { colors } from '@/utils/colors';
import type { Song } from '@/types';

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

type Props = {
  song: Song;
  onPress: () => void;
  onOptionsPress: (song: Song) => void;
};

export function SongListItem({ song, onPress, onOptionsPress }: Props) {
  const isLiked = useLibraryStore((s) => s.isLiked(song.id));
  const toggleLike = useLibraryStore((s) => s.toggleLike);

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {song.artist}
        </Text>
      </View>

      <View style={styles.actions}>
        <Text style={styles.duration}>{formatDuration(song.duration)}</Text>

        <TouchableOpacity
          onPress={() => toggleLike(song.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 4 }}
          style={styles.iconButton}
        >
          <MaterialIcons
            name={isLiked ? 'favorite' : 'favorite-border'}
            size={20}
            color={isLiked ? colors.tint : colors.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onOptionsPress(song)}
          hitSlop={{ top: 10, bottom: 10, left: 4, right: 10 }}
          style={styles.iconButton}
        >
          <MaterialIcons name="more-vert" size={20} color={colors.icon} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.icon,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  artist: {
    fontSize: 13,
    color: colors.icon,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  duration: {
    fontSize: 13,
    color: colors.icon,
    marginRight: 4,
  },
  iconButton: {
    padding: 4,
  },
});
