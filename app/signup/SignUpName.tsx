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
import { Routes } from "../utils/routes";

const SignUpName = () => {
  const { firstName, lastName, setField } = useSignupStore();

  const proceed = () => {

            router.push(Routes.SignUpBirthday);
    
  };

  // Check if both fields are filled
  const isFormValid = firstName.trim() !== "" && lastName.trim() !== "";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your name?</Text>
      <TextInput
        style={styles.textInput}
        placeholder="First Name"
        value={firstName}
        onChangeText={(text) => setField("firstName", text)}
      />

      <TextInput
        style={styles.textInput}
        placeholder="Last Name"
        value={lastName}
        onChangeText={(text) => setField("lastName", text)}
      />

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isFormValid ? "#FFFFFF" : "#B0BEC5" },
        ]} // Change button color based on validity
        onPress={proceed}
        disabled={!isFormValid}
      >
        <Text style={styles.text}>Next</Text>
      </TouchableOpacity>
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
