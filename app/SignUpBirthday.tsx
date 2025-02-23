import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

const Birthday = () => {
  const { firstName, lastName } = useLocalSearchParams(); // Retrieve passed params
  const [birthday, setBirthday] = useState('');

  const proceed = () => {
    router.push({
      pathname: '/SignUpMajor', // Replace with your next screen
      params: { firstName, lastName, birthday },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Your Birthday</Text>
      <TextInput
        style={styles.textInput}
        placeholder="MM/DD/YYYY"
        value={birthday}
        onChangeText={setBirthday}
      />
      <TouchableOpacity style={styles.button} onPress={proceed}>
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
    backgroundColor: '#FAFAFA', // Consistent background color
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 30,
    color: '#1A237E', // Matching title color
  },
  textInput: {
    height: 50,
    width: '90%', // Consistent width with other page
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
    backgroundColor: '#5C6BC0', // Matching button color
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
