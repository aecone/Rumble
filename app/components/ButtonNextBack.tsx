// app/components/ButtonNextBack.tsx

import { TouchableOpacity, Text, View } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useAuthStore } from "../utils/useAuthStore"; 
import { signupStepOrder } from "../utils/signupHelpers";

interface ButtonNextBackProps {
    next: (typeof signupStepOrder)[number]; 
    }

export function ButtonNextBack({ next }: ButtonNextBackProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { setProfileStep } = useAuthStore();

  const onNext = () => {
    const idx = signupStepOrder.findIndex((p) => p === next);
    if (idx !== -1) {
      setProfileStep(idx + 1); // steps are 1-based
    }
    router.push(next);
  };

  const onBack = () => {
    const idx = signupStepOrder.findIndex((p) => p === pathname);
    if (idx > 0) {
      router.push(signupStepOrder[idx - 1]);
    } else {
      router.replace("/signup/CreateProfile");
    }
  };

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
      <TouchableOpacity onPress={onBack}>
        <Text style={{ color: "#534E5B", fontSize: 16 }}>Back</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onNext}>
        <Text style={{ color: "#534E5B", fontSize: 16 }}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}
