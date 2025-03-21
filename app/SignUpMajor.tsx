import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { router, useLocalSearchParams } from 'expo-router';

const SignUpMajor = () => {
  const { firstName, lastName, email, password, birthday } = useLocalSearchParams();
  const [major, setMajor] = useState('');

  const proceed = () => {
    router.push({
      pathname: '/SignUpGradYear',
      params: { firstName, lastName, email, password, birthday, major },
    });
  };

  const isFormValid = major !== '';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your major?</Text>

      {/* DropDown Picker */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={major}
          onValueChange={(itemValue) => setMajor(itemValue)}
          style={[styles.picker, { backgroundColor: '#534E5B' }]}
          mode="dropdown"
          dropdownIconColor={"#534E5B"}
        >
          <Picker.Item label="Select Major" value="" />
          <Picker.Item label="Computer Science" value="Computer Science" />
          <Picker.Item label="Mechanical Engineering" value="Mechanical Engineering" />
          <Picker.Item label="Electrical Engineering" value="Electrical Engineering" />
          <Picker.Item label="Business Administration" value="Business Administration" />
          <Picker.Item label="BAIT" value="BAIT" />
          <Picker.Item label="Information Technology" value="Information Technology" />
          <Picker.Item label="Biomedical Engineering" value="Biomedical Engineering" />
          <Picker.Item label="Communications" value="Communications" />
          <Picker.Item label="Civil Engineering" value="Civil Engineering" />
          <Picker.Item label="Engineering (other)" value="Engineering (other)" />
          <Picker.Item label="Psychology" value="Psychology" />
          <Picker.Item label="Public Health" value="Public Health" />
          <Picker.Item label="Biology" value="Biology" />
          <Picker.Item label="English" value="English" />
          <Picker.Item label="History" value="History" />
          <Picker.Item label="Political Science" value="Political Science" />
          <Picker.Item label="Arts" value="Arts" />
          <Picker.Item label="Other" value="Other" />
          {/* Add more majors as needed */}
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

export default SignUpMajor;

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
