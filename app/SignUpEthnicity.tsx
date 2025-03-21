import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { router, useLocalSearchParams } from 'expo-router';

const SignUpEthnicity = () => {
  const { firstName, lastName, email, password, birthday, major, gradYear} = useLocalSearchParams();
  const [ethnicity, setEthnicity] = useState('');

  const proceed = () => {
    // Navigate to the next page (Email/Password entry)
    router.push({
      pathname: '/SignUpGenderPronouns',
      params: { firstName, lastName, email, password, birthday, major, gradYear, ethnicity }  // Pass name info to the next page
    });
  };

  const isFormValid = ethnicity.trim();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Please select your race/ethnicity</Text>

      {/* DropDown Picker */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={ethnicity}
          onValueChange={(itemValue) => setEthnicity(itemValue)}
          style={[styles.picker, { backgroundColor: '#534E5B' }]}
          mode="dropdown"
          dropdownIconColor={"#534E5B"}
        >
          <Picker.Item label="Select Race/Ethnicity" value="" />
          <Picker.Item label="Asian" value="Asian" />
          <Picker.Item label="East Asian" value="East Asian" />
          <Picker.Item label="South Asian" value="South Asian" />
          <Picker.Item label="Southeast Asian" value="Southeast Asian" />
          <Picker.Item label="Middle Eastern/Arab" value="Middle Eastern/Arab" />
          <Picker.Item label="American Indian/Alaskan Native" value="American Indian/Alaskan Native" />
          <Picker.Item label="African American" value="African American" />
          <Picker.Item label="Native Hawaiian or Pacific Islander" value="Native Hawaiian or Pacific Islander" />
          <Picker.Item label="Hispanic or Latino" value="Hispanic or Latino" />
          <Picker.Item label="White" value="White" />
          <Picker.Item label="Multiracial" value="Multiracial" />
          <Picker.Item label="Prefer not to say" value="Prefer not to say" />
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

export default SignUpEthnicity;

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

