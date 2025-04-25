// app/components/ButtonNextBack.tsx

import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useAuthStore } from "../utils/useAuthStore";
import { baseSignupStepOrder } from "../utils/signupHelpers";

interface ButtonNextBackProps {
  next: (typeof baseSignupStepOrder)[number];
  disabled?: boolean;
}

export function ButtonNextBack({ next, disabled }: ButtonNextBackProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { setProfileStep } = useAuthStore();

  const onNext = () => {
    const idx = baseSignupStepOrder.findIndex((p) => p === next);
    if (idx !== -1) setProfileStep(idx + 1);
    router.push(next);
  };

  const onBack = () => {
    const idx = baseSignupStepOrder.findIndex((p) => p === pathname);
    if (idx > 0) {
      router.push(baseSignupStepOrder[idx - 1]);
    } else {
      router.replace("/signup/CreateProfile");
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Fixed top-left back button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Next button centered near bottom */}
      <View style={styles.nextWrapper}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: disabled ? "#B0BEC5" : "#FFFFFF" },
          ]}
          onPress={onNext}
          disabled={disabled}
        >
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "space-between",
    paddingTop: 60, // some breathing space for back button
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backText: {
    color: "white",
    fontSize: 16,
  },
  nextWrapper: {
    alignItems: "center",
    marginBottom: 30,
  },
  nextButton: {
    width: "90%",
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
  },
  nextText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#534E5B",
  },
});
