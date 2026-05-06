import { CustomTabBar } from '@/components/CustomTabBar';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { position: 'absolute' }
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="notifications/index" options={{ title: 'Notificaciones' }} />
      <Tabs.Screen name="auctions/index" options={{ title: 'Subastas' }} />
      <Tabs.Screen name="profile/index" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
