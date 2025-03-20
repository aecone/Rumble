import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";


const SignUpGenderPronouns = () => {
  const { firstName, lastName, email, password, birthday, major, gradYear, ethnicity } =
    useLocalSearchParams();
  const [gender, setGender] = useState("");
  const [pronouns, setPronouns] = useState("");

  const proceed = () => {
    // Navigate to the next page (Email/Password entry)
    router.push({
      pathname: '/SignUpHobbies',
      params: { firstName, lastName, email, password, birthday, major, gradYear, ethnicity, gender, pronouns }  // Pass name info to the next page
    });
  };
  
  // Check if both fields are filled
  //const isFormValid = gender.trim() !== '' && pronouns.trim() !== '';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Please list your gender & pronouns</Text>
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
        onPress={proceed}
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#534E5B',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 30,
    color: '#FFFFFF',
    textAlign: 'center', // Center the text
  },
  textInput: {
    height: 50,
    width: '90%',
    backgroundColor: '#534E5B',
    borderColor: '#E8EAF6',
    borderWidth: 1,
    borderRadius: 40,
    marginVertical: 10,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '200'
  },
  button: {
    width: '90%',
    marginVertical: 20,
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  text: {
    color: '#534E5B',
    fontSize: 18,
    fontWeight: '500',
  },
});