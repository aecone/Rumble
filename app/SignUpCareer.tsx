import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
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
      <Text style={styles.title}>What's your intended career</Text>

      {/* DropDown Picker */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={career}
          onValueChange={(itemValue) => setCareer(itemValue)}
          style={[styles.picker, { backgroundColor: '#534E5B' }]}
          mode="dropdown"
          dropdownIconColor={"#534E5B"}
        >
          <Picker.Item label="Select career" value="" />
          <Picker.Item label="UI/UX" value="UI/UX" />
          <Picker.Item label="Medicine" value="Medicine" />
          <Picker.Item label="Politician" value="Politician" />
          <Picker.Item label="Law" value="Law" />
          <Picker.Item label="Design" value="Design" />
          <Picker.Item label="Research" value="Research" />
          <Picker.Item label="Finance" value="Finance" />
          <Picker.Item label="Data Science" value="Data Science" />
          <Picker.Item label="Data Engineering" value="Data Engineering" />
          <Picker.Item label="Software Engineering" value="Software Engineering" />
          <Picker.Item label="Computer Engineering" value="Computer Engineering" />
          <Picker.Item label="Biomedical Engineering" value="Biomedical Engineering" />
          <Picker.Item label="Electrical Engineering" value="Electrical Engineering" />
          <Picker.Item label="Data Engineering" value="Data Engineering" />
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
    marginTop: 30,
    color: '#FFFFFF',
    textAlign: 'center',
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