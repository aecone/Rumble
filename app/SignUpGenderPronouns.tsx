import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

const SignUpGenderPronouns = () => {
  const { firstName, lastName, birthday, major, ethnicity} = useLocalSearchParams();
  const [gender, setGender] = useState('');
  const [pronouns, setPronouns] = useState('');

  const proceed = () => {
    router.push({
      pathname: '/(tabs)/two',
      params: { firstName, lastName, birthday, major, ethnicity, gender, pronouns }  // Pass name info to the next page
    });
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
      backgroundColor: '#FAFAFA',
    },
    title: {
      fontSize: 26,
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
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor: '#5C6BC0',
    },
    text: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
  });
  