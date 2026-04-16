import { Audio, AVPlaybackStatus } from 'expo-av';
import type { Song } from '@/types';

export async function configureAudioMode(): Promise<void> {
  await Audio.setAudioModeAsync({
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
  });
}

export class AudioPlayer {
  private sound: Audio.Sound | null = null;
  private onStatusUpdate: ((status: AVPlaybackStatus) => void) | null = null;

  async load(song: Song): Promise<void> {
    await this.unload();

    const { sound } = await Audio.Sound.createAsync(
      { uri: song.uri },
      { shouldPlay: false },
      this.handleStatusUpdate.bind(this)
    );

    this.sound = sound;
  }

  async play(): Promise<void> {
    if (this.sound) {
      await this.sound.playAsync();
    }
  }

  async pause(): Promise<void> {
    if (this.sound) {
      await this.sound.pauseAsync();
    }
  }

  async seek(positionMs: number): Promise<void> {
    if (this.sound) {
      await this.sound.setPositionAsync(positionMs);
    }
  }

  async unload(): Promise<void> {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }

  setOnStatusUpdate(callback: (status: AVPlaybackStatus) => void): void {
    this.onStatusUpdate = callback;
  }

  private handleStatusUpdate(status: AVPlaybackStatus): void {
    if (this.onStatusUpdate) {
      this.onStatusUpdate(status);
    }
  }
}
