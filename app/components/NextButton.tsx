import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useSignupNavigation } from "../hooks/useSignupNavigation";
import { baseSignupStepOrder, SignupStepPath } from "../utils/signupHelpers"; // or "@/utils/signupHelpers" if using alias

interface NextButtonProps {
    next: SignupStepPath;
    disabled?: boolean;
    onPress?: () => void; 
  }
  export function NextButton({ next, disabled, onPress }: NextButtonProps) {
    const { onNext } = useSignupNavigation();
  
    return (
      <TouchableOpacity
        style={[
          styles.nextButton,
          { backgroundColor: disabled ? "#B0BEC5" : "#FFFFFF" },
        ]}
        onPress={onPress || (() => onNext(next))} // use prop OR fallback
        disabled={disabled}
      >
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>
    );
  }

const styles = StyleSheet.create({
  nextButton: {
    width: "90%",
    maxWidth: 350,
    padding: 20,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  nextText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#534E5B",
  },
});
