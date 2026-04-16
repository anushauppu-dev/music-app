# Phase 1: Foundation & Project Setup — Specification

## Objective

Establish the base structure, environment, and shared foundations that all future phases build on — for both iOS and Android.

---

## 1. Folder Structure

Create the following directories at the project root:

| Directory | Purpose |
|---|---|
| `services/` | Business logic |
| `utils/` | Pure helpers (colors, typography, spacing, formatters) |
| `types/` | Shared TypeScript interfaces |
| `stores/` | Zustand store definitions |
| `hooks/` | Custom React hooks |

**Note:** `components/` and `app/` already exist from the Expo scaffold and remain in place.

---

## 2. Design System Foundation

All colour, spacing, and typography values must be defined as tokens. No hardcoded values elsewhere.

### `utils/colors.ts`
- Dark theme only
- Tokens: `background`, `text`, `tint`, `icon`, `tabIconDefault`, `tabIconSelected`
- Replaces the existing `constants/theme.ts` (migration path: copy the dark palette tokens to `utils/colors.ts`, update imports)

### `utils/typography.ts`
- Font size scale (e.g., `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `title`)
- Font weight scale (e.g., `regular`, `medium`, `semibold`, `bold`)

### `utils/spacing.ts`
- Spacing scale (e.g., `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`)

---

## 3. Type Definitions

### `types/Song.ts`
```ts
export type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  uri: string;
  artwork?: string;
};
```

### `types/index.ts`
Barrel export for all types (e.g., `export { Song } from './Song'`).

---

## 4. Navigation Shell

### Update `app/(tabs)/_layout.tsx`
- Two tabs: **Songs** and **Library**
- Tab icons: `music.note.list` for Songs, `music.note.house` for Library
- Use existing `HapticTab` pattern for tab buttons
- Use `Colors` from `utils/colors.ts` (dark theme only)

### Update `app/_layout.tsx`
- Import `react-native-reanimated` at the top (already present)
- Stack includes `(tabs)` and `modal` routes
- Modal route configured for Now Playing screen (future)

### Create placeholder screens
- `app/(tabs)/songs.tsx` — placeholder content for Songs tab
- `app/(tabs)/library.tsx` — placeholder content for Library tab

Remove or archive existing placeholder screens (`index.tsx`, `explore.tsx`) since they are not part of the music app.

---

## 5. Store Scaffolding

Both stores are initialized with empty state. Logic is added in later phases.

### `stores/usePlayerStore.ts`
```ts
type PlayerState = {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  queueIndex: number;
  position: number;
  duration: number;
  repeatMode: 'off' | 'all' | 'one';
  shuffle: boolean;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  currentSong: null,
  isPlaying: false,
  queue: [],
  queueIndex: 0,
  position: 0,
  duration: 0,
  repeatMode: 'off',
  shuffle: false,
}));
```

### `stores/useLibraryStore.ts`
```ts
type LibraryState = {
  likedSongIds: string[];
  albums: Album[];
  isLoaded: boolean;
};

type Album = {
  id: string;
  name: string;
  songIds: string[];
  createdAt: string;
};

export const useLibraryStore = create<LibraryState>((set) => ({
  likedSongIds: [],
  albums: [],
  isLoaded: false,
}));
```

Both stores are imported in `app/_layout.tsx` (initialization only — no rendering logic yet).

---

## 6. Native Platform Configuration

All configuration lives in `app.json`. No manual edits to `AndroidManifest.xml` or `Info.plist`.

### Install `zustand`
```bash
npm install zustand
```

### Update `app.json`

**Add `expo-av` plugin (both platforms):**
```json
["expo-av", { "microphonePermission": false }]
```

**iOS (`infoPlist`):**
- `NSPhotoLibraryUsageDescription`: "This app needs access to your photo library to find music files."
- `NSAppleMusicUsageDescription`: "This app needs access to Apple Music to play your songs."
- `UIBackgroundModes`: `["audio"]`

**Android (`permissions` via `expo-media-library` plugin):**
- `READ_EXTERNAL_STORAGE`
- `READ_MEDIA_AUDIO`
- `android.useNextNotificationsApi`: `true`

---

## 7. Post-Configuration

After updating `app.json`, run:
```bash
npx expo prebuild
```
This regenerates the `ios/` and `android/` folders with the new native configuration.

---

## Verification Criteria

| # | Criterion |
|---|---|
| 1 | `npm run lint` passes |
| 2 | TypeScript compiles without errors (`npx tsc --noEmit`) |
| 3 | App renders two tabs (Songs, Library) with placeholder content |
| 4 | Both Zustand stores initialize without errors |
| 5 | `app.json` contains `expo-av` plugin and all required permissions |
| 6 | After `npx expo prebuild`, `ios/` and `android/` folders are generated successfully |

---

## Dependencies Added in This Phase

| Package | Purpose | When Needed |
|---|---|---|
| `zustand` | Global state management | Phase 1+ |
| `expo-av` | Audio playback | Phase 1+ |
| `expo-media-library` | Media permissions and asset discovery | Phase 2+ |
| `expo-file-system` | File persistence | Phase 4+ |
