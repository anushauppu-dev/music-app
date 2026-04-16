import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useLibraryStore } from '@/stores/useLibraryStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { AlbumCard } from '@/components/AlbumCard';
import { colors } from '@/utils/colors';

// ─── New Album Modal ──────────────────────────────────────────────────────────

function NewAlbumModal({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Album name cannot be empty.');
      return;
    }
    onCreate(trimmed);
    setName('');
    setError('');
    onClose();
  }, [name, onCreate, onClose]);

  const handleClose = useCallback(() => {
    setName('');
    setError('');
    onClose();
  }, [onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={modalStyles.backdrop} onPress={handleClose} />
      <View style={modalStyles.box}>
        <Text style={modalStyles.title}>New Album</Text>
        <TextInput
          style={[modalStyles.input, error ? modalStyles.inputError : null]}
          placeholder="Album name"
          placeholderTextColor={colors.icon}
          value={name}
          onChangeText={(t) => { setName(t); setError(''); }}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleCreate}
        />
        {error ? <Text style={modalStyles.errorText}>{error}</Text> : null}
        <View style={modalStyles.buttons}>
          <TouchableOpacity style={modalStyles.cancelButton} onPress={handleClose}>
            <Text style={modalStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={modalStyles.createButton} onPress={handleCreate}>
            <Text style={modalStyles.createText}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Album Options Modal ──────────────────────────────────────────────────────

function AlbumOptionsModal({
  albumId,
  albumName,
  visible,
  onClose,
  onRename,
  onDelete,
}: {
  albumId: string;
  albumName: string;
  visible: boolean;
  onClose: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(albumName);
  const [error, setError] = useState('');

  const handleRenameConfirm = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed) { setError('Name cannot be empty.'); return; }
    onRename(albumId, trimmed);
    setRenaming(false);
    setError('');
    onClose();
  }, [albumId, newName, onRename, onClose]);

  const handleDelete = useCallback(() => {
    onClose();
    Alert.alert(
      'Delete Album',
      `Delete "${albumName}"? The songs won't be removed from your library.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(albumId) },
      ],
    );
  }, [albumId, albumName, onClose, onDelete]);

  const handleClose = useCallback(() => {
    setRenaming(false);
    setNewName(albumName);
    setError('');
    onClose();
  }, [albumName, onClose]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={modalStyles.backdrop} onPress={handleClose} />
      <View style={modalStyles.sheet}>
        {renaming ? (
          <>
            <Text style={modalStyles.title}>Rename Album</Text>
            <TextInput
              style={[modalStyles.input, error ? modalStyles.inputError : null]}
              value={newName}
              onChangeText={(t) => { setNewName(t); setError(''); }}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleRenameConfirm}
            />
            {error ? <Text style={modalStyles.errorText}>{error}</Text> : null}
            <View style={modalStyles.buttons}>
              <TouchableOpacity style={modalStyles.cancelButton} onPress={() => setRenaming(false)}>
                <Text style={modalStyles.cancelText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.createButton} onPress={handleRenameConfirm}>
                <Text style={modalStyles.createText}>Save</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={modalStyles.sheetAlbumName} numberOfLines={1}>{albumName}</Text>
            <TouchableOpacity style={modalStyles.sheetOption} onPress={() => setRenaming(true)}>
              <MaterialIcons name="edit" size={20} color={colors.text} />
              <Text style={modalStyles.sheetOptionText}>Rename</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.sheetOption} onPress={handleDelete}>
              <MaterialIcons name="delete-outline" size={20} color="#ff6b6b" />
              <Text style={[modalStyles.sheetOptionText, { color: '#ff6b6b' }]}>Delete Album</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  );
}

// ─── LibraryScreen ────────────────────────────────────────────────────────────

type SystemAlbumGroup = {
  id: string; // encoded name
  name: string;
  groupBy: 'album' | 'artist';
  songCount: number;
};

export default function LibraryScreen() {
  const router = useRouter();

  const isLoaded = useLibraryStore((s) => s.isLoaded);
  const likedSongIds = useLibraryStore((s) => s.likedSongIds);
  const albums = useLibraryStore((s) => s.albums);
  const createAlbum = useLibraryStore((s) => s.createAlbum);
  const renameAlbum = useLibraryStore((s) => s.renameAlbum);
  const deleteAlbum = useLibraryStore((s) => s.deleteAlbum);

  const songs = usePlayerStore((s) => s.songs);

  const [showNewAlbum, setShowNewAlbum] = useState(false);
  const [albumOptions, setAlbumOptions] = useState<{ id: string; name: string } | null>(null);

  // Derive system albums from song metadata
  const systemAlbums = useMemo<SystemAlbumGroup[]>(() => {
    const byAlbum = new Map<string, number>();
    const byArtist = new Map<string, number>();
    for (const s of songs) {
      byAlbum.set(s.album, (byAlbum.get(s.album) ?? 0) + 1);
      byArtist.set(s.artist, (byArtist.get(s.artist) ?? 0) + 1);
    }
    const albumGroups: SystemAlbumGroup[] = [...byAlbum.entries()].map(([name, count]) => ({
      id: `album:${name}`,
      name,
      groupBy: 'album',
      songCount: count,
    }));
    const artistGroups: SystemAlbumGroup[] = [...byArtist.entries()].map(([name, count]) => ({
      id: `artist:${name}`,
      name,
      groupBy: 'artist',
      songCount: count,
    }));
    return [...albumGroups, ...artistGroups];
  }, [songs]);

  const navigateToAlbum = useCallback(
    (id: string, type: 'user' | 'system', name: string, groupBy?: 'album' | 'artist') => {
      router.push({
        pathname: '/(tabs)/library/album/[id]',
        params: { id, type, name, groupBy: groupBy ?? '' },
      });
    },
    [router],
  );

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.tint} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
        <TouchableOpacity
          style={styles.newAlbumButton}
          onPress={() => setShowNewAlbum(true)}
        >
          <MaterialIcons name="add" size={18} color={colors.background} />
          <Text style={styles.newAlbumText}>New Album</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[]}
        keyExtractor={() => ''}
        renderItem={null}
        ListHeaderComponent={
          <>
            {/* Liked Songs entry */}
            <TouchableOpacity
              style={styles.likedRow}
              onPress={() => router.push('/(tabs)/library/liked-songs')}
            >
              <View style={styles.likedIcon}>
                <MaterialIcons name="favorite" size={24} color={colors.background} />
              </View>
              <View style={styles.likedInfo}>
                <Text style={styles.likedTitle}>Liked Songs</Text>
                <Text style={styles.likedCount}>
                  {likedSongIds.length} {likedSongIds.length === 1 ? 'song' : 'songs'}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={colors.icon} />
            </TouchableOpacity>

            {/* User Albums */}
            {albums.length > 0 && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Albums</Text>
              </View>
            )}
            {albums.map((album) => (
              <AlbumCard
                key={album.id}
                name={album.name}
                songCount={album.songIds.length}
                onPress={() => navigateToAlbum(album.id, 'user', album.name)}
                onOptionsPress={() => setAlbumOptions({ id: album.id, name: album.name })}
              />
            ))}

            {/* System Albums */}
            {systemAlbums.length > 0 && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>By Album &amp; Artist</Text>
              </View>
            )}
            {systemAlbums.map((sa) => (
              <AlbumCard
                key={sa.id}
                name={sa.name}
                songCount={sa.songCount}
                isSystem
                onPress={() => navigateToAlbum(sa.id, 'system', sa.name, sa.groupBy)}
              />
            ))}

            {songs.length === 0 && (
              <View style={styles.empty}>
                <MaterialIcons name="library-music" size={56} color={colors.icon} />
                <Text style={styles.emptyText}>No songs in your library yet.</Text>
                <Text style={styles.emptySubtext}>Add songs in the Songs tab to get started.</Text>
              </View>
            )}
          </>
        }
        contentContainerStyle={styles.listContent}
      />

      <NewAlbumModal
        visible={showNewAlbum}
        onClose={() => setShowNewAlbum(false)}
        onCreate={createAlbum}
      />

      {albumOptions && (
        <AlbumOptionsModal
          albumId={albumOptions.id}
          albumName={albumOptions.name}
          visible={!!albumOptions}
          onClose={() => setAlbumOptions(null)}
          onRename={renameAlbum}
          onDelete={deleteAlbum}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  newAlbumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  newAlbumText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  likedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.icon,
    gap: 14,
  },
  likedIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#c0392b',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  likedInfo: {
    flex: 1,
  },
  likedTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  likedCount: {
    fontSize: 13,
    color: colors.icon,
    marginTop: 2,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.icon,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  empty: {
    paddingTop: 60,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.icon,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 160,
  },
});

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  box: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: '40%',
    backgroundColor: '#1e2122',
    borderRadius: 14,
    padding: 20,
    gap: 12,
  },
  sheet: {
    backgroundColor: '#1e2122',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    gap: 4,
    paddingBottom: 36,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#2a2d2e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  errorText: {
    fontSize: 13,
    color: '#ff6b6b',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 4,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelText: {
    color: colors.icon,
    fontSize: 15,
  },
  createButton: {
    backgroundColor: colors.tint,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '600',
  },
  sheetAlbumName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.icon,
    marginBottom: 4,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  sheetOptionText: {
    fontSize: 16,
    color: colors.text,
  },
});
