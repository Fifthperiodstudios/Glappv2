
import { Provider as PaperProvider, Text, TextInput } from 'react-native-paper';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './Screens/LoginScreen';
import MainScreen from './Screens/MainScreen';
import SettingsScreen from './Screens/SettingsScreen';
import { loadAsync } from 'expo-font';
import { useCallback, useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';

import { useAppSelector } from './Statemanagement/hooks';

const theme = {
  "colors": {
    /* Blaue Login Taste, farbe von schrift auf elevated button und weiß für Elemente auf Blau*/
    "primary": "rgb(2, 151, 201)",
    "onPrimary": "rgb(255, 255, 255)",

    /* Grüne Button Taste und weiß für Elemente auf Grün*/
    "primaryContainer": "rgb(152, 214, 129)",
    "onPrimaryContainer": "rgb(255, 255, 255)",

    /*Hell Grün für unscheinbarers und weiß für Elemente auf Grün*/
    "secondary": "rgb(159, 210, 139)",
    "onSecondary": "rgb(255, 255, 255)",

    /* Ungenutzt, ist aber hell blau und dunkleres blau*/
    "secondaryContainer": "rgb(215, 227, 248)",

    /*Farbe der selektierten Icons auf AppBar*/
    "onSecondaryContainer": "rgb(44, 135, 232)", //,"rgb(16, 28, 43)", "rgb(106, 165, 234)"

    /*Ungenutzt, lila und weiß*/
    "tertiary": "rgb(108, 87, 120)",
    "onTertiary": "rgb(255, 255, 255)",

    /*Ungenutzt, helles pink und  dunkles lila*/
    "tertiaryContainer": "rgb(244, 218, 255)",
    "onTertiaryContainer": "rgb(38, 20, 49)",

    /* Farben für Fehler helles rot und dunkles rot */
    "error": "rgb(251, 208, 208)",
    "onError": "rgb(187, 166, 166)",
    "errorContainer": "rgb(255, 218, 214)",
    "onErrorContainer": "rgb(65, 0, 2)",

    /* Hintegrund von Komponenten wie z.B. von TextInput und Schrift auf Hintergrund*/
    "background": "rgb(255, 255, 255)",
    "onBackground": "rgb(0, 0, 0)",

    /* Genereller Hintergrund und Farbe von Text auf Hintergrund */
    "surface": "rgb(255, 255, 255)",
    "onSurface": "rgb(26, 28, 30)",

    "surfaceVariant": "rgb(223, 226, 235)",

    /*Icon Farbe von Icons auf Appbar unselected, auch: text in inputbox*/
    "onSurfaceVariant": "rgb(106, 165, 234)",

    "outline": "rgb(115, 119, 127)",
    "outlineVariant": "rgb(195, 198, 207)",
    "shadow": "rgb(0, 0, 0)",
    "scrim": "rgb(0, 0, 0)",
    "inverseSurface": "rgb(47, 48, 51)",
    "inverseOnSurface": "rgb(241, 240, 244)",
    "inversePrimary": "rgb(160, 201, 255)",
    "elevation": {
      "level0": "transparent",

      /*elevated Button farbe*/
      "level1": "rgb(2, 0, 201)",

      /*Backgroundcolor der Appbar rgb(234, 240, 248)*/
      "level2": "rgb(234, 240, 248)",
      "level3": "rgb(227, 235, 245)",
      "level4": "rgb(224, 233, 244)",
      "level5": "rgb(220, 230, 242)"
    },
    "surfaceDisabled": "rgba(26, 28, 30, 0.12)",
    "onSurfaceDisabled": "rgba(26, 28, 30, 0.38)",
    "backdrop": "rgba(44, 49, 55, 0.4)"
  }
}

export type RootStackParamList = {
  Home: undefined,
  Settings: undefined,
  SignIn: undefined,
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppContent = () => {

  const isSignedIn = useAppSelector(state => state.loginReducer.isSignedIn);

  const [appIsReady, setAppIsReady] = useState(false);

  /*
  if exists(localData):
    if localData.token != "":
      if localData.version < app.version:
        deleteAllData except token
        load new data via token
        save as new schema
      else:
        show timetable, exam schedule with old data
        load new data if exists
    else:
      deleteAllData
      show loginScreen
  else:
      show loginScreen  
  */

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await loadAsync({
          'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf')
        });

      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer onReady={onLayoutRootView} theme={{
        dark: false,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.surface,
          card: theme.colors.primaryContainer,
          text: theme.colors.onSurface,
          border: theme.colors.secondary,
          notification: theme.colors.error
        }
      }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isSignedIn ? (
            <>
              <Stack.Screen name="Home" component={MainScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
            </>
          ) : (
            <Stack.Screen name="SignIn" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default AppContent;