import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePlayerStore } from '@/stores/usePlayerStore';
import { colors } from '@/utils/colors';

const MINI_PLAYER_HEIGHT = 64;
const TAB_BAR_HEIGHT = 49;

export function MiniPlayer() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const currentSong = usePlayerStore((s) => s.currentSong);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);

  if (!currentSong) return null;

  const bottomOffset = TAB_BAR_HEIGHT + insets.bottom;

  return (
    <TouchableOpacity
      style={[styles.container, { bottom: bottomOffset }]}
      onPress={() => router.push('/modal')}
      activeOpacity={0.95}
    >
      <View style={styles.info}>
        <View style={styles.iconPlaceholder}>
          <MaterialIcons name="music-note" size={20} color={colors.background} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.playButton}
        onPress={(e) => {
          e.stopPropagation();
          togglePlayPause();
        }}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <MaterialIcons
          name={isPlaying ? 'pause' : 'play-arrow'}
          size={28}
          color={colors.text}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: MINI_PLAYER_HEIGHT,
    backgroundColor: '#1e2122',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.icon,
  },
  info: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 8,
  },
  iconPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 6,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  artist: {
    fontSize: 12,
    color: colors.icon,
    marginTop: 2,
  },
  playButton: {
    padding: 4,
  },
});
