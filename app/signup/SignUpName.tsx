import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useSignupStore } from "../utils/useSignupStore";
import { signupStepPaths} from "../utils/routes";
import { BackButton } from "../components/BackButton";
import { NextButton } from "../components/NextButton";
import { useSignupNavigation } from "../hooks/useSignupNavigation";




const SignUpName = () => {
  const { firstName, lastName, setField } = useSignupStore();
const lastNameRef = useRef<TextInput>(null);
const { onNext } = useSignupNavigation();

  // Check if both fields are filled
  const isFormValid = firstName.trim() !== "" && lastName.trim() !== "";

  return (
      <View style={styles.container}>
        <BackButton />
        <Text style={styles.title}>What's your name?</Text>
        <TextInput
         style={styles.textInput}
        placeholder="First Name"
        value={firstName}
        onChangeText={(text) => setField("firstName", text)}
        returnKeyType="next"
        onSubmitEditing={() => lastNameRef.current?.focus()} // move to Last Name field
      />

      <TextInput
       style={styles.textInput}
        ref={lastNameRef}
        placeholder="Last Name"
        value={lastName}
        onChangeText={(text) => setField("lastName", text)}
        returnKeyType="done"
        onSubmitEditing={() => {
          if (isFormValid) {
            onNext(signupStepPaths.SignUpBirthday);
          }
        }}
      />
      <NextButton next={signupStepPaths.SignUpBirthday} disabled={!isFormValid} />

    </View>
  );
};

export default SignUpName;

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
});
