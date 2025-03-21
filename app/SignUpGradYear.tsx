import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { router, useLocalSearchParams } from 'expo-router';

const SignUpGradYear = () => {
    const { firstName, lastName, email, password, birthday, major} = useLocalSearchParams();
  const [gradYear, setGradYear] = useState('');

  const proceed = () => {
    // Navigate to the next page (Email/Password entry)
    router.push({
      pathname: '/SignUpEthnicity',
      params: { firstName, lastName, email, password, birthday, major, gradYear }  // Pass name info to the next page
    });
  };

  const isFormValid = gradYear.trim() !== '';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your anticipated graduation year?</Text>

      {/* DropDown Picker */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={gradYear}
          onValueChange={(itemValue) => setGradYear(itemValue)}
          style={[styles.picker, { backgroundColor: '#534E5B' }]}
          mode="dropdown"
          dropdownIconColor={"#534E5B"}
        >
          <Picker.Item label="Select Graduation Year" value="" />
          <Picker.Item label="2025" value="2025" />
          <Picker.Item label="2026" value="2026" />
          <Picker.Item label="2027" value="2027" />
          <Picker.Item label="2028" value="2028" />
          <Picker.Item label="2029" value="2029" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: isFormValid ? '#FFFFFF' : '#B0BEC5' }]}
        onPress={proceed}
        disabled={!isFormValid}
      >
        <Text style={styles.text}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUpGradYear;

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
  pickerContainer: {
    height: 50,
    width: '90%',
    backgroundColor: '#534E5B',
    borderRadius: 40,
    marginVertical: 10,
    justifyContent: 'center',
    borderColor: '#E8EAF6',
    borderWidth: 1,
  },
  picker: {
    width: '100%',
    color: '#FFFFFF',
    alignContent: 'center',
    fontSize: 22,
    borderColor: '#534E5B',
    borderRadius: 40
  },
  button: {
    width: '90%',
    marginVertical: 20,
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
  },
  text: {
    color: '#534E5B',
    fontSize: 18,
    fontWeight: '500',
  },
});