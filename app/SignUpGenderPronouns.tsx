import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { router, useLocalSearchParams } from "expo-router";

const SignUpGenderPronouns = () => {
  const { firstName, lastName, email, password, birthday, major, gradYear, ethnicity } =
    useLocalSearchParams();
  const [gender, setGender] = useState("");
  const [pronouns, setPronouns] = useState("");

  const proceed = () => {
    // Navigate to the next page
    router.push({
      pathname: '/SignUpHobbies',
      params: { firstName, lastName, email, password, birthday, major, gradYear, ethnicity, gender, pronouns }
    });
  };
  
  // Check if both fields are filled
  const isFormValid = gender.trim() !== '' && pronouns.trim() !== '';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Please select your gender & pronouns</Text>
      
      {/* Gender Dropdown */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={gender}
          onValueChange={(itemValue) => setGender(itemValue)}
          style={[styles.picker, { backgroundColor: '#534E5B' }]}
          mode="dropdown"
          dropdownIconColor={"#534E5B"}
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Woman" value="Woman" />
          <Picker.Item label="Man" value="Man" />
          <Picker.Item label="Non-binary" value="Non-binary" />
          <Picker.Item label="Genderfluid" value="Genderfluid" />
          <Picker.Item label="Prefer not to say" value="Prefer not to say" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>
      
      {/* Pronouns Dropdown */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={pronouns}
          onValueChange={(itemValue) => setPronouns(itemValue)}
          style={[styles.picker, { backgroundColor: '#534E5B' }]}
          mode="dropdown"
          dropdownIconColor={"#534E5B"}
        >
          <Picker.Item label="Select Pronouns" value="" />
          <Picker.Item label="He/Him" value="He/Him" />
          <Picker.Item label="She/Her" value="She/Her" />
          <Picker.Item label="They/Them" value="They/Them" />
          <Picker.Item label="He/They" value="He/They" />
          <Picker.Item label="She/They" value="She/They" />
          <Picker.Item label="Ze/Hir" value="Ze/Hir" />
          <Picker.Item label="Ze/Zir" value="Ze/Zir" />
          <Picker.Item label="Xe/Xem" value="Xe/Xem" />
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