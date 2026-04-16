import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { colors } from '@/utils/colors';

export default function SongsScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="title">Songs</ThemedText>
      <ThemedText style={styles.placeholder}>Songs list will appear here</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: 8,
  },
  placeholder: {
    color: colors.icon,
  },
});
