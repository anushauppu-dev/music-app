import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { usePlayerStore } from '@/stores/usePlayerStore';
import { colors } from '@/utils/colors';
import type { Song } from '@/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTime(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ─── NowPlayingInfo ──────────────────────────────────────────────────────────

function NowPlayingInfo({ song }: { song: Song }) {
  return (
    <View style={infoStyles.container}>
      <View style={infoStyles.artwork}>
        <MaterialIcons name="music-note" size={80} color={colors.background} />
      </View>
      <Text style={infoStyles.title} numberOfLines={2}>
        {song.title}
      </Text>
      <Text style={infoStyles.artist} numberOfLines={1}>
        {song.artist}
      </Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  artwork: {
    width: 240,
    height: 240,
    borderRadius: 16,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  artist: {
    fontSize: 16,
    color: colors.icon,
    textAlign: 'center',
  },
});

// ─── SeekBar ─────────────────────────────────────────────────────────────────

function SeekBar({
  position,
  duration,
  onSeek,
}: {
  position: number;
  duration: number;
  onSeek: (ms: number) => void;
}) {
  const barWidth = useRef(0);
  const isSeeking = useRef(false);
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (!isSeeking.current) {
      setDisplayProgress(duration > 0 ? position / duration : 0);
    }
  }, [position, duration]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        isSeeking.current = true;
        if (barWidth.current > 0) {
          const ratio = Math.max(0, Math.min(1, e.nativeEvent.locationX / barWidth.current));
          setDisplayProgress(ratio);
        }
      },
      onPanResponderMove: (e) => {
        if (barWidth.current > 0) {
          const ratio = Math.max(0, Math.min(1, e.nativeEvent.locationX / barWidth.current));
          setDisplayProgress(ratio);
        }
      },
      onPanResponderRelease: (e) => {
        isSeeking.current = false;
        if (barWidth.current > 0) {
          const ratio = Math.max(0, Math.min(1, e.nativeEvent.locationX / barWidth.current));
          const durationRef = duration;
          onSeek(ratio * durationRef);
          setDisplayProgress(ratio);
        }
      },
    })
  ).current;

  const fillPercent = `${(displayProgress * 100).toFixed(1)}%`;

  return (
    <View style={seekStyles.container}>
      <View
        style={seekStyles.track}
        onLayout={(e) => {
          barWidth.current = e.nativeEvent.layout.width;
        }}
        {...panResponder.panHandlers}
      >
        <View style={[seekStyles.fill, { width: fillPercent as `${number}%` }]} />
        <View
          style={[
            seekStyles.thumb,
            { left: fillPercent as `${number}%` },
          ]}
        />
      </View>
      <View style={seekStyles.labels}>
        <Text style={seekStyles.time}>{formatTime(position)}</Text>
        <Text style={seekStyles.time}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
}

const seekStyles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 32,
    gap: 6,
  },
  track: {
    height: 4,
    backgroundColor: '#3a3d3e',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  fill: {
    height: 4,
    backgroundColor: colors.tint,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.tint,
    marginLeft: -7,
    top: -5,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    fontSize: 12,
    color: colors.icon,
  },
});

// ─── PlaybackControls ─────────────────────────────────────────────────────────

function PlaybackControls() {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);
  const next = usePlayerStore((s) => s.next);
  const previous = usePlayerStore((s) => s.previous);

  return (
    <View style={ctrlStyles.container}>
      <TouchableOpacity onPress={previous} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <MaterialIcons name="skip-previous" size={44} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity
        style={ctrlStyles.playButton}
        onPress={togglePlayPause}
      >
        <MaterialIcons
          name={isPlaying ? 'pause' : 'play-arrow'}
          size={40}
          color={colors.background}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={next} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <MaterialIcons name="skip-next" size={44} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const ctrlStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 32,
  },
  playButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── Modal Screen ─────────────────────────────────────────────────────────────

export default function ModalScreen() {
  const currentSong = usePlayerStore((s) => s.currentSong);
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const setRepeatMode = usePlayerStore((s) => s.setRepeatMode);
  const setShuffle = usePlayerStore((s) => s.setShuffle);
  const seek = usePlayerStore((s) => s.seek);

  const handleSeek = useCallback(
    (ms: number) => {
      seek(ms);
    },
    [seek]
  );

  const cycleRepeat = useCallback(() => {
    const next: Record<typeof repeatMode, typeof repeatMode> = {
      off: 'all',
      all: 'one',
      one: 'off',
    };
    setRepeatMode(next[repeatMode]);
  }, [repeatMode, setRepeatMode]);

  if (!currentSong) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <MaterialIcons name="music-note" size={64} color={colors.icon} />
          <Text style={styles.emptyText}>Nothing playing</Text>
        </View>
      </SafeAreaView>
    );
  }

  const repeatIconName =
    repeatMode === 'one' ? 'repeat-one' : 'repeat';
  const repeatActive = repeatMode !== 'off';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <NowPlayingInfo song={currentSong} />

        <SeekBar position={position} duration={duration} onSeek={handleSeek} />

        <PlaybackControls />

        <View style={styles.extras}>
          <TouchableOpacity onPress={cycleRepeat} style={styles.extraButton}>
            <MaterialIcons
              name={repeatIconName}
              size={26}
              color={repeatActive ? colors.tint : colors.icon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShuffle(!shuffle)}
            style={styles.extraButton}
          >
            <MaterialIcons
              name="shuffle"
              size={26}
              color={shuffle ? colors.tint : colors.icon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 24,
  },
  extras: {
    flexDirection: 'row',
    gap: 48,
    justifyContent: 'center',
  },
  extraButton: {
    padding: 8,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.icon,
  },
});
