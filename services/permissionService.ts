import * as Linking from 'expo-linking';

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'undetermined';

export async function openSettings(): Promise<void> {
  await Linking.openSettings();
}
