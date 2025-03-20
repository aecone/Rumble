import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

const SignUpCareer = () => {
  const { firstName, lastName, email, password, birthday, major, gradYear, ethnicity, gender, pronouns, hobbies} = useLocalSearchParams();
  const [career, setCareer] = useState('');

  const proceed = () => {
    // Navigate to the next page (Email/Password entry)
    router.push({
      pathname: '/SignUpIndustries',
      params: { firstName, lastName, email, password, birthday, major, gradYear, ethnicity, gender, pronouns, hobbies, career }  // Pass name info to the next page
    });
  };

  const isFormValid = career.trim();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What is you intended career?</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Intended career"
        value={career}
        onChangeText={setCareer}
      />
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: isFormValid ? '#FFFFFF' : '#B0BEC5' }]} // Change button color based on validity
        onPress={proceed}
        disabled={!isFormValid}
      >
        <Text style={styles.text}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUpCareer;

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
    backgroundColor: '#534E5'
  },
  text: {
    color: '#534E5B',
    fontSize: 18,
    fontWeight: '500',
  },
});

