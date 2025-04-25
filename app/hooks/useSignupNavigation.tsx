import { useRouter, usePathname } from "expo-router";
import { useAuthStore } from "../utils/useAuthStore";
import { useSignupStore } from "../utils/useSignupStore"; // add this
import { getFullSignupStepOrder, baseSignupStepOrder, SignupStepPath } from "../utils/signupHelpers";

export function useSignupNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { setProfileStep } = useAuthStore();
  const { userType } = useSignupStore(); // read latest userType
  const signupStepOrder = userType
    ? getFullSignupStepOrder(userType)
    : baseSignupStepOrder;

  const onNext = (next: SignupStepPath) => {
    const idx = signupStepOrder.findIndex((p) => p === next);
    if (idx !== -1) {
      setProfileStep(idx + 1);
    }
    router.push(next);
  };

  const onBack = () => {
    if (pathname === "/signup/CreateProfile") {
      router.replace("/");
      return;
    }

    const idx = signupStepOrder.findIndex((p) => p === pathname);

    if (idx > 0) {
      router.push(signupStepOrder[idx - 1]);
    } else {
      router.replace("/signup/CreateProfile");
    }
  };

  return { onNext, onBack };
}
