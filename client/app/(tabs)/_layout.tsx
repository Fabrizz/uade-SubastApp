import { CustomTabBar } from '@/components/CustomTabBar';
import { useAuth } from '@/context/auth';
import { Tabs, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';

export default function TabLayout() {
  const { isAuthenticated, hasPaymentMethod, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const isInsidePaymentNew = (segments as string[]).includes('payment') && (segments as string[]).includes('new');

  useEffect(() => {
    if (!isLoading && isAuthenticated && hasPaymentMethod === false && !isInsidePaymentNew) {
      router.replace('/profile/payment/new');
    }
  }, [isLoading, isAuthenticated, hasPaymentMethod, isInsidePaymentNew]);

  if (isLoading) return null;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { position: 'absolute' }
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Notificaciones' }} />
      <Tabs.Screen name="auctions" options={{ title: 'Subastas' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
