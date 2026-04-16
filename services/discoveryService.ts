import * as MediaLibrary from 'expo-media-library';
import type { Song } from '@/types';

const MIN_SONG_DURATION_MS = 30_000;

function getFilenameFromUri(uri: string): string {
  const parts = uri.split('/');
  const filename = parts[parts.length - 1] ?? '';
  return filename.replace(/\.[^/.]+$/, '');
}

export async function fetchAllSongs(): Promise<Song[]> {
  const songs: Song[] = [];
  let page = await MediaLibrary.getAssetsAsync({
    mediaType: MediaLibrary.MediaType.audio,
    first: 100,
  });

  while (true) {
    for (const asset of page.assets) {
      if ((asset.duration ?? 0) < MIN_SONG_DURATION_MS) continue;

      const info = await MediaLibrary.getAssetInfoAsync(asset);

      const song: Song = {
        id: asset.id,
        title: asset.filename ?? getFilenameFromUri(info.uri ?? asset.uri ?? ''),
        artist: (info as any).artist || 'Unknown Artist',
        album: (info as any).album || 'Unknown Album',
        duration: (asset.duration ?? 0) * 1000,
        uri: info.uri ?? '',
        artwork: (info as any).thumbnail ?? undefined,
      };

      songs.push(song);
    }

    if (!page.hasNextPage) break;
    page = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 100,
      after: page.endCursor,
    });
  }

  const seen = new Set<string>();
  return songs.filter((song) => {
    if (seen.has(song.uri)) return false;
    seen.add(song.uri);
    return true;
  });
}
