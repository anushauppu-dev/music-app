# Phase 2: Device Access & Music Discovery — Specification

## Objective

Request media permissions and build the music dataset using `expo-media-library` consistently on both platforms.

---

## 1. Permission Service

### `services/permissionService.ts`

```ts
import * as MediaLibrary from 'expo-media-library';
import * as Linking from 'expo-linking';

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'undetermined';

export async function requestMediaPermission(): Promise<PermissionStatus> {
  const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();

  if (status === 'granted') return 'granted';
  if (status === 'denied' && !canAskAgain) return 'blocked';
  return 'denied';
}

export async function getMediaPermission(): Promise<PermissionStatus> {
  const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();

  if (status === 'granted') return 'granted';
  if (status === 'denied' && !canAskAgain) return 'blocked';
  return 'denied';
}

export async function openSettings(): Promise<void> {
  await Linking.openSettings();
}
```

---

## 2. Music Discovery Service

### `services/discoveryService.ts`

```ts
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
```

---

## 3. Update Player Store

### `stores/usePlayerStore.ts`

Add permission state and songs list to the existing store:

```ts
import { create } from 'zustand';
import type { Song } from '@/types';
import type { PermissionStatus } from '@/services/permissionService';

type PlayerState = {
  // Existing fields...
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  queueIndex: number;
  position: number;
  duration: number;
  repeatMode: 'off' | 'all' | 'one';
  shuffle: boolean;

  // Phase 2 additions
  songs: Song[];
  permissionStatus: PermissionStatus;
  isLoadingSongs: boolean;
  songsError: string | null;
};
```

---

## 4. Songs Screen

### `app/(tabs)/songs.tsx`

Implement the full Songs screen with all states:

**States to handle:**
- `loading` — show loading indicator while fetching songs
- `permission_denied` — show permission request UI
- `permission_blocked` — show "Open Settings" button
- `empty` — show empty state when no songs found
- `error` — show error message
- `loaded` — show song list

**UI requirements:**
- Use `FlatList` with `keyExtractor` on `song.id`
- Pull-to-refresh re-triggers song fetch
- Each song row shows: title, artist, duration
- Tap on song row: placeholder action (plays in Phase 3)

---

## 5. Permission Denied Component

### `components/PermissionDeniedView.tsx`

```tsx
type Props = {
  status: 'denied' | 'blocked';
  onRequestPermission: () => void;
  onOpenSettings: () => void;
};
```

- Full-screen view with icon, message, and CTA button
- `denied`: "Grant Access" button → calls `requestMediaPermission`
- `blocked`: "Open Settings" button → calls `openSettings`

---

## 6. Dependency

- `expo-media-library` — already installed in Phase 1

---

## Verification Criteria

| # | Criterion |
|---|---|
| 1 | `npm run lint` passes |
| 2 | TypeScript compiles without errors |
| 3 | App shows permission request on first launch (or when permission not granted) |
| 4 | When permission denied → "Grant Access" button shown |
| 5 | When permission blocked → "Open Settings" button shown |
| 6 | When permission granted → songs are fetched and displayed |
| 7 | Songs under 30 seconds are filtered out |
| 8 | Pull-to-refresh re-fetches songs |
