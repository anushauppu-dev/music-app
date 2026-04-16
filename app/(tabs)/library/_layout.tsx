import { Stack } from 'expo-router';

import { colors } from '@/utils/colors';

export default function LibraryLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerBackTitle: 'Library',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="liked-songs" options={{ title: 'Liked Songs' }} />
      <Stack.Screen name="album/[id]" options={{ title: '' }} />
    </Stack>
  );
}
