/*
User input for birthday in signup sequence.
Navigates to SignUpMajor
*/

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useSignupStore } from "../utils/useSignupStore";
import { signupStepPaths } from "../utils/routes";
import { BackButton } from "../components/BackButton";
import { NextButton } from "../components/NextButton";
import { useSignupNavigation } from "../hooks/useSignupNavigation";

//Birthday obj/function for formatting and valid input
const Birthday = () => {
  const { birthday, setField } = useSignupStore();
  const [error, setError] = useState("");
  const { onNext } = useSignupNavigation();
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  // Auto-format with forward slashes
  const formatDate = (text: string) => {
    // Remove all non-digit characters
    let cleaned = text.replace(/\D/g, "");

    // Add slashes at positions 2 and 5 (MM/DD/YYYY)
    if (cleaned.length > 2 && cleaned.length <= 4) {
      cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else if (cleaned.length > 4) {
      cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }

    setField("birthday", cleaned);

    validateDate(cleaned);
  };

  const validateDate = (date: string) => {
    if (!date) {
      setError("Please enter your birthday");
      return false;
    }

    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(date)) {
      setError("Please use MM/DD/YYYY format");
      return false;
    }

    const [month, day, year] = date.split("/").map(Number);
    const dateObj = new Date(year, month - 1, day);

    // Check if date is valid
    if (
      dateObj.getMonth() + 1 !== month ||
      dateObj.getDate() !== day ||
      dateObj.getFullYear() !== year
    ) {
      setError("Please enter a valid date");
      return false;
    }

    // Check if date is in the future
    if (dateObj > new Date()) {
      setError("Birthday cannot be in the future");
      return false;
    }

    setError("");
    return true;
  };

  const isFormValid = !error && birthday.length === 10;
  const fullLength = birthday.length === 10;

  return (
    <View style={styles.container}>
      <BackButton />

      <Text style={styles.title}>What's Your Birthday?</Text>

      <TextInput
        style={[
          styles.textInput,
          attemptedSubmit && error ? styles.errorInput : null, // only show error border after try
        ]}
        placeholder="MM/DD/YYYY"
        value={birthday}
        onChangeText={(text) => {
          formatDate(text);
          if (text.length === 10) {
            validateDate(text); // only validate once full input is typed
          }
        }}
        keyboardType="number-pad"
        maxLength={10}
        returnKeyType="done"
        onSubmitEditing={() => {
          setAttemptedSubmit(true);
          if (isFormValid) {
            onNext(signupStepPaths.SignUpMajor);
          }
        }}
      />

      {attemptedSubmit && error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

<NextButton
  next={signupStepPaths.SignUpMajor}
  disabled={!fullLength}
  onPress={() => {
    setAttemptedSubmit(true);
    if (validateDate(birthday)) {
      onNext(signupStepPaths.SignUpMajor);
    }
  }}
/>

    </View>
  );
};

export default Birthday;

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
  },
  textInput: {
    height: 50,
    width: "90%",
    backgroundColor: "#534E5B",
    borderColor: "#E8EAF6",
    borderWidth: 1,
    borderRadius: 40,
    marginVertical: 10,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "200",
  },
  button: {
    width: "90%",
    marginVertical: 20,
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    backgroundColor: "#534E5",
  },
  text: {
    color: "#534E5B",
    fontSize: 18,
    fontWeight: "500",
  },
  errorInput: {
    borderColor: "#FF6B6B",
  },
  errorText: {
    color: "#FF6B6B",
    marginBottom: 10,
    textAlign: "center",
  },
});
