import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import '@/stores/usePlayerStore';
import '@/stores/useLibraryStore';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Now Playing' }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
