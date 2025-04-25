import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSignupStore } from "../utils/useSignupStore";
import { signupStepPaths } from "../utils/routes";
import { BackButton } from "../components/BackButton";
import { NextButton } from "../components/NextButton";
import { usePathname } from "expo-router";
import { getFullSignupStepOrder, baseSignupStepOrder } from "../utils/signupHelpers";

export default function MentorOrMentee() {
  const { userType, setField } = useSignupStore();
  const pathname = usePathname();

  // ⚡ Correct signupStepOrder
  const signupStepOrder = userType ? getFullSignupStepOrder(userType) : baseSignupStepOrder;

  const selectRole = (role: "mentor" | "mentee") => {
    setField("userType", role);
  };

  const idx = signupStepOrder.findIndex((p) => p === pathname);

  const nextPath = idx >= 0 && idx + 1 < signupStepOrder.length
    ? signupStepOrder[idx + 1]
    : null;

  return (
    <View style={styles.container}>
      <BackButton />

        <Text style={styles.title}>Would you like to be a mentor or a mentee?</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              userType === "mentor"
                ? styles.selectedButton
                : styles.unselectedButton,
            ]}
            onPress={() => selectRole("mentor")}
          >
            <Text
              style={[
                styles.text,
                userType === "mentor"
                  ? styles.selectedText
                  : styles.unselectedText,
              ]}
            >
              Mentor
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              userType === "mentee"
                ? styles.selectedButton
                : styles.unselectedButton,
            ]}
            onPress={() => selectRole("mentee")}
          >
            <Text
              style={[
                styles.text,
                userType === "mentee"
                  ? styles.selectedText
                  : styles.unselectedText,
              ]}
            >
              Mentee
            </Text>
          </TouchableOpacity>
        </View>

      {/* Next Button */}
      <NextButton
  next={nextPath || signupStepPaths.MentorOrMentee} // fallback safe
  disabled={!userType}
/>

    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#534E5B",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 30,
    color: "#FFFFFF",
    alignItems: "center",
    textAlign: "center",
    marginHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    borderColor: "#FFFFFF",
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    marginVertical: 10,
    padding: 15,
    borderWidth: 1,
    borderRadius: 40,
    borderColor: "#FFFFFF",
    alignItems: "flex-start",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  selectedButton: {
    backgroundColor: "#FFFFFF",
    color: "#534E5B",
    borderColor: "#FFFFFF",
  },
  selectedText: {
    color: "#534E5B",
    fontSize: 20,
  },
  unselectedButton: {
    backgroundColor: "#534E5B",
    color: "#534E5B",
  },
  unselectedText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "400",
  },
  signupButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 40,
    alignItems: "center",
    width: "90%",
  },
  activeButton: {
    backgroundColor: "#FFFFFF",
  },
  disabledButton: {
    backgroundColor: "#BDBDBD",
  },
});
