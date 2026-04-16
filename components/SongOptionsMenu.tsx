import { useCallback, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useLibraryStore } from '@/stores/useLibraryStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { colors } from '@/utils/colors';
import type { Song } from '@/types';

type Props = {
  song: Song | null;
  visible: boolean;
  onClose: () => void;
  /** When set, shows "Remove from album" instead of "Add to album" */
  contextAlbumId?: string;
};

type View = 'main' | 'add-to-album';

export function SongOptionsMenu({ song, visible, onClose, contextAlbumId }: Props) {
  const [view, setView] = useState<View>('main');

  const toggleLike = useLibraryStore((s) => s.toggleLike);
  const isLiked = useLibraryStore((s) => (song ? s.isLiked(song.id) : false));
  const albums = useLibraryStore((s) => s.albums);
  const addSongToAlbum = useLibraryStore((s) => s.addSongToAlbum);
  const removeSongFromAlbum = useLibraryStore((s) => s.removeSongFromAlbum);

  const playNow = usePlayerStore((s) => s.playNow);
  const playNext = usePlayerStore((s) => s.playNext);
  const addToQueue = usePlayerStore((s) => s.addToQueue);

  const handleClose = useCallback(() => {
    setView('main');
    onClose();
  }, [onClose]);

  const handleAction = useCallback(
    (action: () => void) => {
      action();
      handleClose();
    },
    [handleClose],
  );

  if (!song) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose} />

      <View style={styles.sheet}>
        {view === 'main' ? (
          <>
            {/* Song info header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <MaterialIcons name="music-note" size={20} color={colors.background} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {song.title}
                </Text>
                <Text style={styles.headerArtist} numberOfLines={1}>
                  {song.artist}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <OptionRow
              icon="favorite"
              label={isLiked ? 'Unlike' : 'Like'}
              color={isLiked ? colors.tint : colors.text}
              onPress={() => handleAction(() => toggleLike(song.id))}
            />
            <OptionRow
              icon="play-arrow"
              label="Play Now"
              onPress={() => handleAction(() => playNow(song))}
            />
            <OptionRow
              icon="queue-play-next"
              label="Play Next"
              onPress={() => handleAction(() => playNext(song))}
            />
            <OptionRow
              icon="add-to-queue"
              label="Add to Queue"
              onPress={() => handleAction(() => addToQueue(song))}
            />

            {contextAlbumId ? (
              <OptionRow
                icon="remove-circle-outline"
                label="Remove from Album"
                color="#ff6b6b"
                onPress={() =>
                  handleAction(() => removeSongFromAlbum(contextAlbumId, song.id))
                }
              />
            ) : (
              <OptionRow
                icon="library-add"
                label="Add to Album"
                onPress={() => setView('add-to-album')}
                showChevron
              />
            )}
          </>
        ) : (
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setView('main')} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={22} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.sheetTitle}>Add to Album</Text>
            </View>

            <View style={styles.divider} />

            {albums.length === 0 ? (
              <View style={styles.emptyAlbums}>
                <Text style={styles.emptyAlbumsText}>No albums yet. Create one in the Library tab.</Text>
              </View>
            ) : (
              <FlatList
                data={albums}
                keyExtractor={(a) => a.id}
                renderItem={({ item }) => {
                  const alreadyAdded = item.songIds.includes(song.id);
                  return (
                    <TouchableOpacity
                      style={[styles.albumRow, alreadyAdded && styles.albumRowDisabled]}
                      onPress={() => {
                        if (!alreadyAdded) {
                          handleAction(() => addSongToAlbum(item.id, song.id));
                        }
                      }}
                      disabled={alreadyAdded}
                    >
                      <MaterialIcons name="album" size={22} color={alreadyAdded ? colors.icon : colors.text} />
                      <Text
                        style={[styles.albumRowName, alreadyAdded && styles.albumRowNameDisabled]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      {alreadyAdded && (
                        <Text style={styles.alreadyAdded}>Already added</Text>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </>
        )}
      </View>
    </Modal>
  );
}

function OptionRow({
  icon,
  label,
  onPress,
  color,
  showChevron,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  onPress: () => void;
  color?: string;
  showChevron?: boolean;
}) {
  const textColor = color ?? colors.text;
  return (
    <TouchableOpacity style={styles.optionRow} onPress={onPress}>
      <MaterialIcons name={icon} size={22} color={textColor} />
      <Text style={[styles.optionLabel, { color: textColor }]}>{label}</Text>
      {showChevron && (
        <MaterialIcons name="chevron-right" size={22} color={colors.icon} style={styles.chevron} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#1e2122',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  headerArtist: {
    fontSize: 13,
    color: colors.icon,
    marginTop: 2,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  backButton: {
    padding: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.icon,
    marginHorizontal: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 16,
  },
  optionLabel: {
    fontSize: 16,
    flex: 1,
  },
  chevron: {
    marginLeft: 'auto',
  },
  emptyAlbums: {
    padding: 24,
    alignItems: 'center',
  },
  emptyAlbumsText: {
    fontSize: 14,
    color: colors.icon,
    textAlign: 'center',
  },
  albumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  albumRowDisabled: {
    opacity: 0.5,
  },
  albumRowName: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  albumRowNameDisabled: {
    color: colors.icon,
  },
  alreadyAdded: {
    fontSize: 12,
    color: colors.icon,
  },
});
