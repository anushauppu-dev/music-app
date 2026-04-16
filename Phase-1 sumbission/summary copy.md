# Music App — Phase 1 Progress Summary

## Overview

Phase 1 (Foundation & Project Setup) is complete. The Expo scaffold has been transformed into a music app shell with navigation, design tokens, shared types, and state stores in place.

---

## What Changed

### Navigation
- **Removed** default Expo placeholder screens: `app/(tabs)/index.tsx`, `app/(tabs)/explore.tsx`
- **Created** `app/(tabs)/songs.tsx` — placeholder Songs tab
- **Created** `app/(tabs)/library.tsx` — placeholder Library tab
- **Created** `app/index.tsx` — redirects root route to `/songs`
- **Updated** `app/(tabs)/_layout.tsx` — two tabs (Songs, Library) with `music.note.list` and `music.note.house` icons, dark theme tab bar
- **Updated** `app/_layout.tsx` — stack routes for `(tabs)` and `modal`

### Design System (`utils/`)
| File | Contents |
|---|---|
| `utils/colors.ts` | Dark-only color tokens: `background`, `text`, `tint`, `icon`, `tabIconDefault`, `tabIconSelected` |
| `utils/typography.ts` | Font size and weight scale |
| `utils/spacing.ts` | Spacing scale |

### Type Definitions (`types/`)
| File | Contents |
|---|---|
| `types/Song.ts` | `Song` type: `id`, `title`, `artist`, `album`, `duration`, `uri`, `artwork?` |
| `types/index.ts` | Barrel export for all types |

### State Management (`stores/`)
| File | Contents |
|---|---|
| `stores/usePlayerStore.ts` | Zustand store — `currentSong`, `isPlaying`, `queue`, `queueIndex`, `position`, `duration`, `repeatMode`, `shuffle` |
| `stores/useLibraryStore.ts` | Zustand store — `likedSongIds`, `albums`, `isLoaded` |

Both stores initialized with empty state; logic added in later phases.

### Dependencies Added (`package.json`)
| Package | Purpose |
|---|---|
| `zustand ^5.0.12` | Global state management |
| `expo-av ^16.0.8` | Audio playback |
| `expo-media-library ^55.0.14` | Media permissions / asset discovery |
| `expo-file-system ^55.0.16` | File persistence |

### Native Config (`app.json`)
- Added `expo-av` plugin with `microphonePermission: false`
- iOS: `NSPhotoLibraryUsageDescription`, `NSAppleMusicUsageDescription`, `UIBackgroundModes: ["audio"]`
- Android: `READ_EXTERNAL_STORAGE`, `READ_MEDIA_AUDIO`, `android.useNextNotificationsApi: true`

---

## New Directories Created

| Directory | Purpose |
|---|---|
| `utils/` | Design tokens and pure helpers |
| `types/` | Shared TypeScript interfaces |
| `stores/` | Zustand store definitions |
| `specs/` | Phase specifications |
| `docs/` | Project documentation |
| `build/` | Build output |

---

## Verification Status

| Criterion | Status |
|---|---|
| Two tabs render (Songs, Library) with placeholder content | Done |
| Both Zustand stores initialized | Done |
| Design token files created | Done |
| `Song` type defined and exported | Done |
| `app.json` updated with permissions and `expo-av` | Done |
| Old placeholder screens removed | Done |

---

## What's Next (Phase 2+)

- Media library integration — scan device for audio files using `expo-media-library`
- Populate the Songs screen with real tracks
- Implement playback using `expo-av`
- Build the Now Playing modal
