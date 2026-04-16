import * as DocumentPicker from 'expo-document-picker';
import type { Song } from '@/types';

function getFilenameWithoutExtension(name: string): string {
  return decodeURIComponent(name.replace(/\.[^/.]+$/, ''));
}

export async function pickSongsFromFiles(): Promise<Song[] | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'audio/*',
    multiple: true,
    copyToCacheDirectory: true,
  });

  if (result.canceled) return null;

  return result.assets.map((asset) => ({
    id: asset.uri,
    title: asset.name ? getFilenameWithoutExtension(asset.name) : asset.uri.split('/').pop() ?? 'Unknown',
    artist: 'Unknown Artist',
    album: 'Unknown Album',
    duration: 0,
    uri: asset.uri,
    artwork: undefined,
  }));
}
