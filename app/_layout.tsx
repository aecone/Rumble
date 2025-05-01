import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import "react-native-reanimated";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Alert, Platform, View, ActivityIndicator } from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useColorScheme } from "@/components/useColorScheme";
import "@/firebase"; // your firebase init
import { API_BASE_URL } from "../FirebaseConfig";
import { AuthGate } from "./utils/AuthGate"; 
import { useAuthStore } from "./utils/useAuthStore"; 

SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from "expo-router";
export const unstable_settings = {
  initialRouteName: "(tabs)",
};


export default function RootLayout() {
  const { setAuthUser, setChecked } = useAuthStore(); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      console.log("Auth state changed:", user ? "logged in" : "logged out");
      setAuthUser(user);
      setChecked(true);
    });
    return unsubscribe;
  }, []);
  const [fontsLoaded, fontsError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (fontsError) throw fontsError;
  }, [fontsError]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthGate>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />  {/* 👈 ADD THIS */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
      </AuthGate>
    </ThemeProvider>
  );
}

function useRegisterForPushNotifications() {
  useEffect(() => {
    let mounted = true;
    const register = async () => {
      if (Platform.OS === "web") return;
      if (!Device.isDevice) {
        Alert.alert("Must use physical device for push notifications");
        return;
      }
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert("Notification permissions not granted");
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Expo Push Token:", token);

      if (mounted) {
        const user = getAuth().currentUser;
        if (user) {
          const idToken = await user.getIdToken();
          await fetch(`${API_BASE_URL}/set_notification_token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({ token }),
          });
        }
      }
    };

    register();

    return () => {
      mounted = false;
    };
  }, []);
}
