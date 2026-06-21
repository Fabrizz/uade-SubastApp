import { LoginRequired } from '@/components/LoginRequired';
import { useAuth } from '@/context/auth';
import { Stack, useSegments } from 'expo-router';

// Anchors "index" as the root of this nested stack so that navigating straight into
// a child route (e.g. pushing /auctions/[id] from the Home tab) inserts "index"
// underneath it — otherwise that child has no local history and back navigation
// (header back / hardware back) has nothing to pop to.
export const unstable_settings = {
  anchor: 'index',
};

export default function AuctionsLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments() as string[];

  // Auction preview ([id]) and item detail (item/[itemId]) are viewable by anyone;
  // everything else under /auctions (mis artículos, history, new) requires login.
  const isAuctionDetail = segments.includes('[id]');
  const isItemDetail = segments.includes('item') && segments.includes('[itemId]');
  const isPublicPreview = isAuctionDetail || isItemDetail;

  if (isLoading) return null;

  if (!isAuthenticated && !isPublicPreview) {
    return (
      <LoginRequired message="Necesitás iniciar sesión para participar en las subastas." />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="item/[itemId]" />
      <Stack.Screen name="history/[itemId]" />
      <Stack.Screen name="new/index" options={{ presentation: 'modal' }} />
      <Stack.Screen name="new/auction-accepted" options={{ presentation: 'modal' }} />
      <Stack.Screen name="new/auction-verification" options={{ presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
