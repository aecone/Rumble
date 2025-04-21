import { useEffect, useState } from "react";
import { useAuthStore } from "../utils/useAuthStore";
import { signupStepOrder } from "../utils/signupHelpers";
import { useRouter, usePathname, Slot } from "expo-router";
import { BackHandler, Alert } from "react-native";

export default function SignupLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { profileStep } = useAuthStore();
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    const restore = async () => {
      if (profileStep > 0) {
        console.log(`Restoring ${profileStep} previous signup steps...`);
        // Just stay on the right page — do not try to rebuild all history
        setTimeout(() => setRestoring(false), 300);
      } else {
        setRestoring(false);
      }
    };
    restore();
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (pathname === "/signup/CreateProfile") {
        return false; 
      }
      if (!pathname.startsWith("/signup")) {
        // If not in signup flow, allow normal back
        return false;
      }

      // Otherwise, show a confirmation if user tries to leave signup
      Alert.alert(
        "Leave Signup?",
        "If you leave now, you may lose your progress. Are you sure?",
        [
          { text: "Stay", style: "cancel", onPress: () => {} },
          {
            text: "Leave",
            style: "destructive",
            onPress: () => router.replace("/"),
          },
        ]
      );
      return true; // <- block default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [pathname]);

  if (restoring) {
    return null;
  }

  return <Slot />;
}
  