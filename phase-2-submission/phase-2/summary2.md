# Phase 2 Summary: Device Access & Music Discovery

## What Was Built

Phase 2 wires the app to the device's media library. Users can now see their actual music collection in the Songs tab, with proper permission handling across all states.

---

## Files Changed

### New Files

| File | Purpose |
|------|---------|
| `services/permissionService.ts` | Abstracts `expo-media-library` permission checks into a typed `PermissionStatus` (`granted` / `denied` / `blocked` / `undetermined`) |
| `services/discoveryService.ts` | Paginates through the device audio library (100 assets at a time), filters clips under 30 seconds, deduplicates by URI, and returns a `Song[]` array |
| `components/PermissionDeniedView.tsx` | Full-screen UI rendered when the user has denied or blocked permission — shows a "Grant Access" or "Open Settings" CTA depending on the state |

### Modified Files

| File | Change |
|------|--------|
| `stores/usePlayerStore.ts` | Added `songs`, `permissionStatus`, `isLoadingSongs`, and `songsError` state fields plus their setters |
| `app/(tabs)/songs.tsx` | Fully replaced placeholder screen with a live Songs screen — permission checking, song fetching, all UI states, and a `FlatList` of song rows |

---

## Key Design Decisions

- **Permission checked on mount, not prompted immediately.** `getMediaPermission` is called first; `requestMediaPermission` is only triggered when the user taps "Grant Access". This avoids showing the system dialog without user intent.

- **Short clips filtered out.** Audio assets shorter than 30 seconds (notification sounds, voice memos, etc.) are excluded via `MIN_SONG_DURATION_MS = 30_000`.

- **Pagination is fully consumed.** `fetchAllSongs` loops until `hasNextPage` is false, so the full library is scanned even if it exceeds 100 tracks.

- **URI-based deduplication.** After collecting all assets, a `Set<string>` on `uri` removes any duplicates that may appear across pages.

- **State lives in the global store.** `songs`, `permissionStatus`, and loading/error flags are stored in `usePlayerStore` so they persist across tab navigation and are ready for Phase 3 to consume.

---

## UI States Handled

| State | What the user sees |
|-------|--------------------|
| `loading` | `ActivityIndicator` centered on screen |
| `permission_denied` | `PermissionDeniedView` with "Grant Access" button |
| `permission_blocked` | `PermissionDeniedView` with "Open Settings" button |
| `empty` | "No songs found" message with guidance text |
| `error` | Error message with a "Retry" button |
| `loaded` | `FlatList` of song rows — title, artist, and formatted duration |

Pull-to-refresh re-runs the full fetch flow from the top.

---

## Verification Criteria — Status

| # | Criterion | Status |
|---|-----------|--------|
| 1 | `npm run lint` passes | Passed |
| 2 | TypeScript compiles without errors | Passed |
| 3 | App shows permission request on first launch | Implemented |
| 4 | Permission denied → "Grant Access" shown | Implemented |
| 5 | Permission blocked → "Open Settings" shown | Implemented |
| 6 | Permission granted → songs fetched and displayed | Implemented |
| 7 | Songs under 30 seconds are filtered out | Implemented (`MIN_SONG_DURATION_MS`) |
| 8 | Pull-to-refresh re-fetches songs | Implemented (`onRefresh={loadSongs}`) |
