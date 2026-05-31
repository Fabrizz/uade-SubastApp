import { useAuth } from '@/context/auth';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { Image, Text } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function SplashScreenController() {
  const { isLoading } = useAuth();

  const [loaded] = useFonts({
    'Montserrat-Thin':      require('../assets/fonts/montserrat-v31-latin-200.ttf'),
    'Montserrat-Light':     require('../assets/fonts/montserrat-v31-latin-300.ttf'),
    'Montserrat-Regular':   require('../assets/fonts/montserrat-v31-latin-regular.ttf'),
    'Montserrat-Medium':    require('../assets/fonts/montserrat-v31-latin-500.ttf'),
    'Montserrat-SemiBold':  require('../assets/fonts/montserrat-v31-latin-600.ttf'),
    'Montserrat-Bold':      require('../assets/fonts/montserrat-v31-latin-700.ttf'),
    'Montserrat-ExtraBold': require('../assets/fonts/montserrat-v31-latin-800.ttf'),

    'Manrope-Thin':      require('../assets/fonts/manrope-v20-latin-200.ttf'),
    'Manrope-Light':     require('../assets/fonts/manrope-v20-latin-300.ttf'),
    'Manrope-Regular':   require('../assets/fonts/manrope-v20-latin-regular.ttf'),
    'Manrope-Medium':    require('../assets/fonts/manrope-v20-latin-500.ttf'),
    'Manrope-SemiBold':  require('../assets/fonts/manrope-v20-latin-600.ttf'),
    'Manrope-Bold':      require('../assets/fonts/manrope-v20-latin-700.ttf'),
    'Manrope-ExtraBold': require('../assets/fonts/manrope-v20-latin-800.ttf'),
  });

  const ready = loaded && !isLoading;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (ready) return null;

  return (
    <LinearGradient
      colors={['#000000', '#3f0146', '#9102A2']}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <Image
        source={require('@/assets/images/logo.png')}
        style={{ width: 80, height: 80, marginBottom: 16 }}
        resizeMode="contain"
      />
      <Text style={{ fontFamily: 'Montserrat-Bold', color: 'white', fontSize: 40, letterSpacing: 1 }}>
        SubastApp
      </Text>
    </LinearGradient>
  );
}
