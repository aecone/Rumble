import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

const SignUpEthnicity = () => {
  const { firstName, lastName, email, password, birthday, major} = useLocalSearchParams();
  const [ethnicity, setEthnicity] = useState('');

  const proceed = () => {
    // Navigate to the next page (Email/Password entry)
    router.push({
      pathname: '/SignUpGenderPronouns',
      params: { firstName, lastName, email, password, birthday, major, ethnicity }  // Pass name info to the next page
    });
  };

  const isFormValid = ethnicity.trim();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your ethnicity?</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Ethnicity"
        value={ethnicity}
        onChangeText={setEthnicity}
      />
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: isFormValid ? '#5C6BC0' : '#B0BEC5' }]} // Change button color based on validity
        onPress={proceed}
        disabled={!isFormValid}
      >
        <Text style={styles.text}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUpEthnicity;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 30,
    color: '#1A237E',
  },
  textInput: {
    height: 50,
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderColor: '#E8EAF6',
    borderWidth: 2,
    borderRadius: 10,
    marginVertical: 10,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  button: {
    width: '90%',
    marginVertical: 20,
    backgroundColor: '#5C6BC0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
