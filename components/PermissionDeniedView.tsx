import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/utils/colors';

type Props = {
  status: 'denied' | 'blocked';
  onRequestPermission: () => void;
  onOpenSettings: () => void;
};

export function PermissionDeniedView({ status, onRequestPermission, onOpenSettings }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🎵</Text>
      <Text style={styles.title}>
        {status === 'blocked' ? 'Permission Required' : 'Access Your Music'}
      </Text>
      <Text style={styles.message}>
        {status === 'blocked'
          ? 'You have permanently denied access. Please open settings to grant permission.'
          : 'This app needs access to your music library to display your songs.'}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={status === 'blocked' ? onOpenSettings : onRequestPermission}
      >
        <Text style={styles.buttonText}>
          {status === 'blocked' ? 'Open Settings' : 'Grant Access'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 32,
    gap: 16,
  },
  icon: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.icon,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
    backgroundColor: colors.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
