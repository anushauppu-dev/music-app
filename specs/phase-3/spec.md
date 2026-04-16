# Phase 3: Core Playback Experience — Specification

## Objective

Deliver the complete music playing experience on both platforms: browse, play, control, search.

---

## 1. Audio Service

### `services/audioService.ts`

```ts
import { Audio, AVPlaybackStatus } from 'expo-av';
import type { Song } from '@/types';

export async function configureAudioMode(): Promise<void> {
  await Audio.setAudioModeAsync({
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
  });
}

export class AudioPlayer {
  private sound: Audio.Sound | null = null;
  private onStatusUpdate: ((status: AVPlaybackStatus) => void) | null = null;

  async load(song: Song): Promise<void> {
    await this.unload();

    const { sound } = await Audio.Sound.createAsync(
      { uri: song.uri },
      { shouldPlay: false },
      this.handleStatusUpdate.bind(this)
    );

    this.sound = sound;
  }

  async play(): Promise<void> {
    if (this.sound) {
      await this.sound.playAsync();
    }
  }

  async pause(): Promise<void> {
    if (this.sound) {
      await this.sound.pauseAsync();
    }
  }

  async seek(positionMs: number): Promise<void> {
    if (this.sound) {
      await this.sound.setPositionAsync(positionMs);
    }
  }

  async unload(): Promise<void> {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }

  setOnStatusUpdate(callback: (status: AVPlaybackStatus) => void): void {
    this.onStatusUpdate = callback;
  }

  private handleStatusUpdate(status: AVPlaybackStatus): void {
    if (this.onStatusUpdate) {
      this.onStatusUpdate(status);
    }
  }
}
```

---

## 2. Update Player Store

### `stores/usePlayerStore.ts`

Add playback actions and state:

```ts
type PlayerState = {
  // Existing fields from Phase 2...
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  queueIndex: number;
  position: number;
  duration: number;
  repeatMode: 'off' | 'all' | 'one';
  shuffle: boolean;
  songs: Song[];
  isLoadingSongs: boolean;
  songsError: string | null;

  // Phase 3 additions
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setQueue: (queue: Song[], startIndex?: number) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setRepeatMode: (mode: 'off' | 'all' | 'one') => void;
  setShuffle: (shuffle: boolean) => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  seek: (position: number) => void;
  togglePlayPause: () => void;
};
```

---

## 3. Songs Screen Enhancements

### `app/(tabs)/songs.tsx`

**File picking (replaces media library scanning):**
- Empty state shows a "Pick Music Files" button
- Tapping it opens the iOS/Android system file picker (`expo-document-picker`) filtered to `audio/*`
- Supports multi-select
- Selected files are appended to the song list; duplicates (by URI) are ignored
- Header shows an "+ Add" button when songs are already loaded, to pick more files
- No OS-level permission prompt — access is granted through the picker UI itself

**Search:**
- Add search input at top of screen
- Filter songs by title and artist (case-insensitive)
- Clear button to reset search

**Sort:**
- Add sort button/menu
- Options: A–Z, Z–A, by Artist, by Duration
- Sort state stored in local component state (not global store)

**Song tap:**
- Tapping a song sets the queue and starts playing from that index

---

## 4. Now Playing Screen

### `app/modal.tsx`

```tsx
// Full-screen modal displaying:
// - Artwork (or placeholder music note icon)
// - Song title
// - Artist name
// - Seek bar with slider
// - Position / Duration labels
// - Previous, Play/Pause, Next buttons
// - Repeat mode button
// - Shuffle button
```

**Components:**
- `SeekBar` — slider that allows seeking, shows current position and duration
- `PlaybackControls` — Previous, Play/Pause, Next buttons
- `NowPlayingInfo` — artwork, title, artist

**Interactions:**
- Play/Pause toggles playback
- Next/Previous advances through queue (respects repeat mode)
- Seek bar allows scrubbing
- Repeat cycles: off → all → one
- Shuffle toggles shuffle mode

---

## 5. Mini Player

### `components/MiniPlayer.tsx`

```tsx
// Rendered in app/_layout.tsx (root layout)
// Fixed at bottom of screen, above tab bar
// Shows: song title, artist, play/pause button
// Tapping opens Now Playing modal
// Hidden when queue is empty or modal is open
```

---

## 6. Update Root Layout

### `app/_layout.tsx`

- Import and render `MiniPlayer` at bottom
- Configure audio mode on app startup

```tsx
useEffect(() => {
  configureAudioMode();
}, []);
```

---

## 7. Dependencies

- `expo-av` — already installed in Phase 1
- `expo-document-picker` — file picker via iOS Files / Android Storage Access Framework; no OS permission prompt required

---

## Verification Criteria

| # | Criterion |
|---|---|
| 1 | `npm run lint` passes |
| 2 | TypeScript compiles without errors |
| 3 | Tapping a song starts playback |
| 4 | Play/Pause button works |
| 5 | Next/Previous buttons work (respects repeat mode) |
| 6 | Seek bar allows scrubbing |
| 7 | Mini player shows at bottom when song is playing |
| 8 | Tapping Mini Player opens Now Playing modal |
| 9 | Search filters songs by title/artist |
| 10 | Sort options reorder the song list |
| 11 | Background audio continues when app is backgrounded |
| 12 | Audio ducking works when other apps play audio (Android) |
