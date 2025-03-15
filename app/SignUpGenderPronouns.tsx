import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import Config from 'react-native-config'; // Import Config to access env variables

const SignUpGenderPronouns = () => {
  const { firstName, lastName, email, password, birthday, major, ethnicity } =
    useLocalSearchParams();
  const [gender, setGender] = useState("");
  const [pronouns, setPronouns] = useState("");
  console.log("API Base URL:", Config.API_BASE_URL);
  const API_BASE_URL = Config.API_BASE_URL; 
  const signUp = async () => {
    try {
      const emailString = Array.isArray(email) ? email[0] : email;
      const passwordString = Array.isArray(password) ? password[0] : password;
  
      if (!emailString || !passwordString) {
        alert("Invalid email or password.");
        return;
      }
  
      const response = await fetch(`${API_BASE_URL}/create_user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailString,
          password: passwordString,
          firstName,
          lastName,
          birthday,
          major,
          ethnicity,
          gender,
          pronouns,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        router.replace("/"); // Navigate to the next page
      } else if (response.status === 500) {
        alert(data.error || "Something went wrong on our end. Please try again.");
      } else {
        alert("Sign up failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.log(error);
      alert("Network error: Unable to connect to the server.");
    }
  };
  
  // Check if both fields are filled
  //const isFormValid = gender.trim() !== '' && pronouns.trim() !== '';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Please list your gender and pronouns</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Gender"
        value={gender}
        onChangeText={setGender}
      />
      <TextInput
        style={styles.textInput}
        placeholder="Pronouns"
        value={pronouns}
        onChangeText={setPronouns}
      />
      <TouchableOpacity
        style={[styles.button]} // Change button color based on validity
        onPress={signUp}
        //disabled={!isFormValid}
      >
        <Text style={styles.text}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUpGenderPronouns;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 30,
    color: "#1A237E",
  },
  textInput: {
    height: 50,
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderColor: "#E8EAF6",
    borderWidth: 2,
    borderRadius: 10,
    marginVertical: 10,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  button: {
    width: "90%",
    marginVertical: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#5C6BC0",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
