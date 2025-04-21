import {
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import { auth, db } from "../FirebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { router } from "expo-router";
import { useFonts } from "expo-font"; // Import the useFonts hook

const index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  let [fontsLoaded] = useFonts({
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
  });
  if (!fontsLoaded) {
    return null; // Or a loading spinner
  }
  const signIn = async () => {
    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      if (user) router.replace("/(tabs)/profileTab");
    } catch (error: any) {
      console.log(error);
      alert("Sign in failed: " + error.message);
    }
  };

  // Button to navigate to create a profile
  const goToCreateProfile = () => {
    router.push("/signup/CreateProfile" as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.titleSubText}>Please sign in to continue.</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.textInput}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={signIn}>
        <Text style={styles.text}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToCreateProfile}>
        <Text style={styles.createAccountText}>
          Don't have an account? Sign up
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF", // A softer white for a modern, minimalist background
    fontFamily: "Montserrat-Regular", // Using Montserrat for a clean, modern look
  },
  title: {
    fontSize: 28, // A bit larger for a more striking appearance
    fontWeight: "800", // Extra bold for emphasis
    marginBottom: 10, // Increased space for a more airy, open feel
    color: "#534E5B", // A deep indigo for a sophisticated, modern look
  },
  textInput: {
    height: 50, // Standard height for elegance and simplicity
    width: "90%", // Full width for a more expansive feel
    backgroundColor: "#EDEDED", // Pure white for contrast against the container
    borderColor: "#E8EAF6", // A very light indigo border for subtle contrast
    borderWidth: 2,
    borderRadius: 40, // Softly rounded corners for a modern, friendly touch
    marginVertical: 15,
    paddingHorizontal: 25, // Generous padding for ease of text entry
    fontSize: 16, // Comfortable reading size
    color: "#000000", // A dark gray for readability with a hint of warmth
    elevation: 4, // Slightly elevated for a subtle 3D effect
  },
  button: {
    width: "90%",
    marginVertical: 15,
    backgroundColor: "#534E5B", // A lighter indigo to complement the title color
    padding: 20,
    borderRadius: 45, // Matching rounded corners for consistency
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  text: {
    color: "#FFFFFF", // Maintained white for clear visibility
    fontSize: 18, // Slightly larger for emphasis
    fontWeight: "600", // Semi-bold for a balanced weight
  },
  createAccountButton: {},
  createAccountText: {
    color: "#534E5B",
    textDecorationLine: "underline",
  },
  titleSubText: {
    color: "#534E5B", // Maintained white for clear visibility
    fontSize: 18, // Slightly larger for emphasis
    fontWeight: "400", // Semi-bold for a balanced weight
    marginBottom: 10,
  },
});
