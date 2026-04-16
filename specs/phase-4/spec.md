# Phase 4 Spec: Personalization & Advanced Features

## Objective

Enhance user experience with persistence, likes, albums, and advanced playback controls — consistent across both iOS and Android platforms.

---

## Scope

This phase builds on the playback engine and song list from Phase 3. It adds:

- Full persistence for user data (liked songs, albums)
- A likes system across multiple entry points
- User-created and system-generated albums
- Repeat and shuffle playback modes
- Queue manipulation actions from the song options menu
- Performance and stability hardening

---

## 1. Library Store (Persistence)

### Requirements

- Implement full load/save logic in `useLibraryStore` using `expo-file-system`
- Persistence file path: `FileSystem.documentDirectory + 'library-store.json'`
- No platform branching needed — `FileSystem.documentDirectory` resolves correctly on both iOS and Android

### Schema

```json
{
  "likedSongIds": ["string"],
  "albums": [
    {
      "id": "string",
      "name": "string",
      "songIds": ["string"],
      "createdAt": "ISO string"
    }
  ],
  "version": 1
}
```

### Behaviour

| Scenario | Behaviour |
|---|---|
| File missing (first launch) | Initialise with empty defaults — not an error |
| File corrupt (invalid JSON) | Log error, reset to empty defaults, do not crash |
| Load timing | Load once on app startup; block Library tab render until complete (show loading state, not empty state) |
| Save timing | Write on every mutation (like toggle, album CRUD) using `FileSystem.writeAsStringAsync` |

### Read / Write API

- Read: `FileSystem.readAsStringAsync(path)`
- Write: `FileSystem.writeAsStringAsync(path, JSON.stringify(state))`
- Both wrapped in `try/catch` with error categorisation per the Global Decisions error philosophy

---

## 2. Likes System

### Requirements

- Like/unlike toggle available in three locations:
  1. Song list rows (main list)
  2. Now Playing screen
  3. Song options menu
- Liked state derived from `useLibraryStore.likedSongIds` (an array of `song.id` strings)
- A **Liked Songs** screen lives under the Library tab
  - Uses the same `SongListItem` component as the main song list
  - Shows a dedicated empty state when no songs are liked
- Liked state persists across app restarts on both platforms

### Store Actions

```ts
toggleLike(songId: string): void   // adds if not present, removes if present
isLiked(songId: string): boolean   // derived selector
```

---

## 3. Albums Feature (User-Created)

### Create Album

- Entry point: "New Album" button in the Library tab
- Flow: name input (text field) → generate UUID as `id` → set `createdAt` to current ISO timestamp → save to store
- Empty name is not allowed — show inline validation

### Rename Album

- Accessible via the album options menu (long-press or three-dot menu on album card)
- Opens an inline edit field or a modal with a text input pre-filled with the current name
- Validates: name must not be empty

### Delete Album

- Accessible via the album options menu
- Show a confirmation dialog before deleting
- On confirm: remove the album record from the store (does not delete the songs themselves)

### Album Detail Screen

- Lists all songs in the album using `FlatList` and `SongListItem`
- Each row has a "Remove from album" action in its options menu
- Shows an empty state when the album has no songs

### Add Song to Album

- Accessible from the song options menu on any song (in list or Now Playing)
- Opens a sheet or modal listing all user-created albums
- Tapping an album adds the song's `id` to that album's `songIds` array
- If the song is already in the album, the option is disabled or shows "Already added"

---

## 4. System Albums

System albums are auto-generated from song metadata — they are read-only and not user-created.

### Types

| Type | Grouping key | Fallback |
|---|---|---|
| Albums | `song.album` | `"Unknown Album"` (guaranteed by Phase 2 normalisation) |
| Artists | `song.artist` | `"Unknown Artist"` (guaranteed by Phase 2 normalisation) |

### Display

- Shown in the Library tab alongside user-created albums
- Visually distinguished from user albums (e.g., different icon, label, or section header)
- Tapping a system album opens a detail screen listing its songs (same `SongListItem` layout)
- System albums are derived in-memory from the song list in `usePlayerStore` — they are not stored in `useLibraryStore`

---

## 5. Advanced Queue & Playback Modes

### Repeat Modes

- Three states, cycling on button tap: `off` → `repeat-all` → `repeat-one`
- `off`: queue ends after last track, playback stops
- `repeat-all`: after last track, wrap back to first
- `repeat-one`: current track loops indefinitely
- Active mode stored in `usePlayerStore`
- Button icon reflects current mode

### Shuffle

- Toggle on/off
- When enabled: on each track advance, the remaining queue is shuffled in place
- When disabled: restore the original (pre-shuffle) queue order, preserving the current track position
- Shuffle state stored in `usePlayerStore`

### Queue Actions (Song Options Menu)

Available from any song's options menu:

| Action | Behaviour |
|---|---|
| Play Now | Replaces current queue with this song + remaining list; begins playback immediately |
| Play Next | Inserts song immediately after the currently playing track |
| Add to Queue | Appends song to the end of the current queue |

All queue mutations happen in `usePlayerStore`.

---

## 6. Performance & Stability

| Requirement | Detail |
|---|---|
| Virtualised lists | All song and album lists use `FlatList`, never `ScrollView` |
| Paginated asset fetching | `getAssetsAsync` uses cursor pagination; no single-call full load |
| Batched `getAssetInfoAsync` | Fetch `localUri` values in parallel batches, not sequentially in a loop |
| Rapid tap debounce | Debounce next/previous track changes by 300ms to prevent race conditions |
| Sound cleanup | Always call `sound.unloadAsync()` before loading a new track |
| Error surfaces | All five error categories (`permission_denied`, `asset_unavailable`, `playback_failed`, `store_corrupt`, `unknown`) handled and shown in UI |
| Physical device testing | Must be tested on physical iOS and Android devices — simulator/emulator does not accurately represent media library behaviour |

---

## Component & File Checklist

### New Files

- `stores/libraryStore.ts` — full load/save implementation
- `screens/LibraryScreen.tsx` — Library tab root with user albums, system albums, liked songs entry
- `screens/LikedSongsScreen.tsx` — liked songs list
- `screens/AlbumDetailScreen.tsx` — user-created and system album detail
- `components/AlbumCard.tsx` — album grid/list card
- `components/SongOptionsMenu.tsx` — bottom sheet or popover with all song actions

### Modified Files

- `stores/playerStore.ts` — add `repeatMode`, `shuffleEnabled`, queue manipulation actions
- `screens/SongListScreen.tsx` — add like button to song rows
- `screens/NowPlayingScreen.tsx` — add like button, repeat/shuffle controls
- `app/(tabs)/library/_layout.tsx` — wire up stack for Library tab screens

---

## Acceptance Criteria

- [ ] Library store loads on startup; Library tab shows a loading state (not empty) while loading
- [ ] Missing store file on first launch initialises clean — no crash, no error shown to user
- [ ] Corrupt store file resets to empty defaults and logs the error — app does not crash
- [ ] Liked songs persist across full app restarts on both iOS and Android
- [ ] Like toggle is functional from song list, Now Playing, and song options menu
- [ ] Liked Songs screen shows all liked songs; empty state shown when none are liked
- [ ] User can create, rename, and delete albums with validation and confirmation
- [ ] User can add/remove individual songs to/from albums
- [ ] System Albums (by album name, by artist) are visible in the Library tab and are visually distinct from user albums
- [ ] Repeat mode cycles through `off` → `repeat-all` → `repeat-one` correctly
- [ ] Shuffle randomises the remaining queue and restores original order when toggled off
- [ ] Play Now, Play Next, and Add to Queue all function correctly from the song options menu
- [ ] All song/album lists use `FlatList` (no `ScrollView` for long lists)
- [ ] Rapid next/previous taps do not cause race conditions (debounce is active)
- [ ] All error categories are handled and surface meaningful UI messages
