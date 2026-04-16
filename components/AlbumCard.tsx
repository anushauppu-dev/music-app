import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { colors } from '@/utils/colors';

type Props = {
  name: string;
  songCount: number;
  /** System albums (by metadata) look different from user-created albums */
  isSystem?: boolean;
  onPress: () => void;
  onOptionsPress?: () => void;
};

export function AlbumCard({ name, songCount, isSystem, onPress, onOptionsPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.artwork, isSystem && styles.artworkSystem]}>
        <MaterialIcons
          name={isSystem ? 'queue-music' : 'album'}
          size={28}
          color={colors.background}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.count}>
          {songCount} {songCount === 1 ? 'song' : 'songs'}
          {isSystem && ' · Auto'}
        </Text>
      </View>

      {!isSystem && onOptionsPress && (
        <TouchableOpacity
          onPress={onOptionsPress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.moreButton}
        >
          <MaterialIcons name="more-vert" size={20} color={colors.icon} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.icon,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  artworkSystem: {
    backgroundColor: '#3a6ea8',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  count: {
    fontSize: 13,
    color: colors.icon,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
    marginLeft: 8,
  },
});
