import 'react-native-reanimated';
import { useEffect } from 'react';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { configureAudioMode } from '@/services/audioService';
import { MiniPlayer } from '@/components/MiniPlayer';
import { useLibraryStore } from '@/stores/useLibraryStore';
import '@/stores/usePlayerStore';

export default function RootLayout() {
  const pathname = usePathname();
  const isModalOpen = pathname === '/modal';
  const loadFromDisk = useLibraryStore((s) => s.loadFromDisk);

  useEffect(() => {
    void configureAudioMode();
    void loadFromDisk();
  }, [loadFromDisk]);

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Now Playing' }} />
      </Stack>
      {!isModalOpen && <MiniPlayer />}
      <StatusBar style="light" />
    </>
  );
}
