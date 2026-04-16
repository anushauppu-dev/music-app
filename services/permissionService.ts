import * as MediaLibrary from 'expo-media-library';
import * as Linking from 'expo-linking';

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'undetermined';

export async function requestMediaPermission(): Promise<PermissionStatus> {
  const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();

  if (status === 'granted') return 'granted';
  if (status === 'denied' && !canAskAgain) return 'blocked';
  return 'denied';
}

export async function getMediaPermission(): Promise<PermissionStatus> {
  const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();

  if (status === 'granted') return 'granted';
  if (status === 'denied' && !canAskAgain) return 'blocked';
  return status === 'undetermined' ? 'undetermined' : 'denied';
}

export async function openSettings(): Promise<void> {
  await Linking.openSettings();
}
