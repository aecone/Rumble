// app/hooks/useSignupNavigation.ts
import { useRouter, usePathname } from "expo-router";
import { useAuthStore } from "../utils/useAuthStore";
import { baseSignupStepOrder, SignupStepPath } from "../utils/signupHelpers";

export function useSignupNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { setProfileStep } = useAuthStore();

  const onNext = (next: SignupStepPath) => {
    const idx = baseSignupStepOrder.findIndex((p) => p === next);
    if (idx !== -1) setProfileStep(idx + 1);
    router.push(next);
  };

  const onBack = () => {
    const idx = baseSignupStepOrder.findIndex((p) => p === pathname);
    if (idx > 0) {
      router.push(baseSignupStepOrder[idx - 1]);
    } else if (pathname === "/signup/CreateProfile") {
      router.replace("/");
    } else {
      router.replace("/signup/CreateProfile");
    }
  };

  return { onNext, onBack };
}
