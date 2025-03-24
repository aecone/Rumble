import { Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView } from 'react-native'
import { useState } from 'react';
import { router } from 'expo-router'
import { auth } from '../FirebaseConfig'
import { fetchSignInMethodsForEmail } from "firebase/auth";

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

  const proceed = async () => {
    try {
      const emailExists = await checkEmailExists(email); // Check if email exists
  
      if (emailExists) {
        alert("This email is already registered. Please sign in or use a different email.");
        return;
      }

      if(password.length <= 6){
        alert("Password length must be greater than 6 characters.");
        return;
      }
  
      if (!email.toLowerCase().endsWith("rutgers.edu")) {
        alert("Please use a valid Rutgers email address.");
        return;
      }
  
      // Navigate to the next page (Email/Password entry)
      router.push({
        pathname: '/SignUpName',
        params: { email, password }  // Pass name info to the next page
      });
    } catch (error) {
      console.error("Error checking email:", error);
      alert("An error occurred while checking the email. Please try again.");
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