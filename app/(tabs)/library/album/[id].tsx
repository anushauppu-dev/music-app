import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect } from 'react';

import AlbumDetailScreen from '@/screens/AlbumDetailScreen';

// Sets the header title dynamically to the album/artist name
function HeaderTitle() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const navigation = useNavigation();

  useEffect(() => {
    if (name) {
      navigation.setOptions({ title: name });
    }
  }, [name, navigation]);

  return null;
}

export default function AlbumDetailRoute() {
  return (
    <>
      <HeaderTitle />
      <AlbumDetailScreen />
    </>
  );
}
