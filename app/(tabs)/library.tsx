import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { colors } from '@/utils/colors';

export default function LibraryScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="title">Library</ThemedText>
      <ThemedText style={styles.placeholder}>Your library will appear here</ThemedText>
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
