import { Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router'
import { auth } from '../FirebaseConfig'
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { Alert } from 'react-native';

const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      return signInMethods.length > 0; 
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

export default function CreateProfile() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Add this at the start of your proceed function
const proceed = async () => {
  try {
    // Validate required fields first
    const errors = [];
    if (!email.trim()) errors.push('Email is required');
    if (!password) errors.push('Password is required');
    
    // Show all validation errors at once
    if (errors.length > 0) {
      Alert.alert(
        'Missing Information',
        errors.join('\n'),
        //[{ text: 'OK' }]
      );
      return;
    }

    // Rest of your existing validation...
    if (!email.toLowerCase().endsWith("@rutgers.edu") && 
        !email.toLowerCase().endsWith("@scarletmail.rutgers.edu")) {
      Alert.alert("Please use a valid Rutgers email address.");
      return;
    }

    if (password.length <= 6) {
      Alert.alert("Password length must be greater than 6 characters.");
      return;
    }

    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      Alert.alert("This email is already registered. Please sign in or use a different email.");
      return;
    }

    // Success case - navigate with success message
    router.push({
      pathname: '/SignUpName',
      params: { 
        email,
        password,
        successMessage: "Account created successfully!" 
      }
    });
    
  } catch (error) {
    console.error("Error checking email:", error);
    Alert.alert("An error occurred while checking the email. Please try again.");
  }
};
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.titleSubText}>Please sign up to continue.</Text>
      <TextInput style={styles.textInput} placeholder="email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.textInput} placeholder="password" value={password} onChangeText={setPassword} secureTextEntry/>
      <TouchableOpacity style={styles.button} onPress={proceed}>
        <Text style={styles.text}>Create</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // A softer white for a modern, minimalist background
  },
  title: {
    fontSize: 28, // A bit larger for a more striking appearance
    fontWeight: '800', // Extra bold for emphasis
    marginBottom: 10, // Increased space for a more airy, open feel
    color: '#534E5B', // A deep indigo for a sophisticated, modern look
  },
  textInput: {
    height: 50, // Standard height for elegance and simplicity
    width: '90%', // Full width for a more expansive feel
    backgroundColor: '#EDEDED', // Pure white for contrast against the container
    borderColor: '#E8EAF6', // A very light indigo border for subtle contrast
    borderWidth: 2,
    borderRadius: 40, // Softly rounded corners for a modern, friendly touch
    marginVertical: 15,
    paddingHorizontal: 25, // Generous padding for ease of text entry
    fontSize: 16, // Comfortable reading size
    color: '#000000', // A dark gray for readability with a hint of warmth
    shadowColor: '#9E9E9E', // A medium gray shadow for depth
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4, // Slightly elevated for a subtle 3D effect
  },
  button: {
    width: '90%',
    marginVertical: 15,
    backgroundColor: '#534E5B', // A lighter indigo to complement the title color
    padding: 20,
    borderRadius: 40, // Matching rounded corners for consistency
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5C6BC0', // Shadow color to match the button for a cohesive look
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  text: {
    color: '#FFFFFF', // Maintained white for clear visibility
    fontSize: 18, // Slightly larger for emphasis
    fontWeight: '600', // Semi-bold for a balanced weight
  },
  createAccountButton: {
    
  },
  createAccountText: {
    color: '#534E5B',
    textDecorationLine: "underline",
  },
  titleSubText: {
    color: '#534E5B', // Maintained white for clear visibility
    fontSize: 18, // Slightly larger for emphasis
    fontWeight: '400', // Semi-bold for a balanced weight
    marginBottom: 10,
  }
});