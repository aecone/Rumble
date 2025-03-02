import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

const Birthday = () => {
  const { firstName, lastName, email, password } = useLocalSearchParams(); // Retrieve passed params
  const [birthday, setBirthday] = useState('');

  // Function to check if the date is valid
  const isValidDate = (date: string) => {
    const regex = /^(0[1-9]|1[0-2])\/([0-2][0-9]|3[01])\/\d{4}$/;
    if (!regex.test(date)) return false; // Return false if the format doesn't match MM/DD/YYYY
    const [month, day, year] = date.split('/').map((num: string) => parseInt(num, 10));
    const dateObj = new Date(year, month - 1, day);
    
    // Check if the entered date is a valid date
    if (dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day || dateObj.getFullYear() !== year) {
      return false;
    }

    // Check if the entered date is in the future
    const currentDate = new Date();
    if (dateObj > currentDate) return false;

    return true;
  };

  const proceed = () => {
    router.push({
      pathname: '/SignUpMajor', // Replace with your next screen
      params: { firstName, lastName, email, password, birthday },
    });
  };

  const isFormValid = isValidDate(birthday); // Check if the entered birthday is valid

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's Your Birthday</Text>
      <TextInput
        style={styles.textInput}
        placeholder="MM/DD/YYYY"
        value={birthday}
        onChangeText={setBirthday}
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: isFormValid ? '#5C6BC0' : '#B0BEC5' }]} // Change button color based on validity
        onPress={proceed}
        disabled={!isFormValid} // Disable button if form is not valid
      >
        <Text style={styles.text}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Birthday;

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
