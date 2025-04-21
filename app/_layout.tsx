import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Alert, Platform } from 'react-native';
import { getAuth } from 'firebase/auth';
import { useColorScheme } from '@/components/useColorScheme';
import '@/firebase'; // make sure firebase is initialized here
import { API_BASE_URL } from "../FirebaseConfig";

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    let mounted = true;

    // Register device and send token to Flask
    registerForPushNotificationsAsync().then(async token => {
      if (!token || !mounted) return;

      console.log('Expo Push Token:', token);

      const user = getAuth().currentUser;
      if (user) {
        const idToken = await user.getIdToken();

        await fetch(`${API_BASE_URL}/set_notification_token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ token }),
        });
      }
    });

    // Foreground notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      Alert.alert('📬 Notification', notification.request.content.body || 'You received a message!');
    });

    // Tap/Interaction notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;

      if (data?.screen && data?.matchId && data?.matchName) {
        console.log('Navigating to:', data.screen, 'with', data.matchId, data.matchName);
    
        router.push({
          pathname: data.screen,
          params: {
            matchId: data.matchId,
            matchName: data.matchName
          }
        });
      }
    });

    return () => {
      mounted = false;
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  if (!loaded) return null;
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') {
    console.log("Push notifications are not supported on web.");
    return;
  }
  if (!Device.isDevice) {
    Alert.alert('Must use physical device for Push Notifications');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Notification permissions not granted');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}
