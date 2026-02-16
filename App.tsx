import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  BodoniModa_600SemiBold,
  BodoniModa_700Bold,
} from '@expo-google-fonts/bodoni-moda';
import {
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold,
} from '@expo-google-fonts/sora';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { AppStateProvider } from './src/state/AppState';
import { ExpoGoNavigator } from './src/navigation/ExpoGoNavigator';
import { RootNavigator } from './src/navigation/RootNavigator';
import { LoadingScreen } from './src/screens/LoadingScreen';

export default function App() {
  const [fontsLoaded] = useFonts({
    BodoniModa_600SemiBold,
    BodoniModa_700Bold,
    Sora_400Regular,
    Sora_600SemiBold,
    Sora_700Bold,
  });

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  const isExpoGo = Constants.appOwnership === 'expo';

  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <StatusBar style="dark" />
        {isExpoGo ? <ExpoGoNavigator /> : <RootNavigator />}
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
