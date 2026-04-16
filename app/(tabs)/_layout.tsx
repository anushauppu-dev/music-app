import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors } from '@/utils/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.icon,
        },
      }}
    >
      <Tabs.Screen
        name="songs"
        options={{
          title: 'Songs',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="music.note.list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="music.note.house" color={color} />,
        }}
      />
    </Tabs>
  );
}
