import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "./useAuthStore"; 
import { ReactNode } from "react";

type AuthGateProps = {
  children: ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const { setChecked, setAuthUser, checked } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      console.log("AuthGate: onAuthStateChanged - user:", user ? "Yes" : "No");
      setAuthUser(user);     // save user
      setChecked(true);      // auth state check is complete
    });

    return unsubscribe;
  }, []);

  if (!checked) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#534E5B" }}>
        <ActivityIndicator size="large" color="#92C7C5" />
      </View>
    );
  }

  return <>{children}</>;
}
