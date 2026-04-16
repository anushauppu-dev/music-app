import 'react-native-reanimated';
import { useEffect } from 'react';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { configureAudioMode } from '@/services/audioService';
import { MiniPlayer } from '@/components/MiniPlayer';
import '@/stores/usePlayerStore';
import '@/stores/useLibraryStore';

export default function RootLayout() {
  const pathname = usePathname();
  const isModalOpen = pathname === '/modal';

  useEffect(() => {
    void configureAudioMode();
  }, []);

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
