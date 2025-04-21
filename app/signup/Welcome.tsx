import { Text, StyleSheet, TouchableOpacity, SafeAreaView, View, Image } from 'react-native'
import React from 'react'
import { router } from 'expo-router'
import { useFonts, Montserrat_400Regular } from '@expo-google-fonts/montserrat'

const WelcomeScreen = () => {
  let [fontsLoaded] = useFonts({
    Montserrat_400Regular, 
  });
  
  if (!fontsLoaded) {
    return null;
  }

  const handleSignIn = () => router.push('/SignIn');
  const handleSignUp = () => router.push('/create-profile');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../assets/images/splash-screen-icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome Back!</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        {/* Outlined Sign In Button */}
        <TouchableOpacity 
          style={[styles.button, styles.signInButton]} 
          onPress={handleSignIn}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
        
        {/* Solid Sign Up Button */}
        <TouchableOpacity 
          style={[styles.button, styles.signUpButton]} 
          onPress={handleSignUp}
        >
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default WelcomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#534E5B',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 5,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Montserrat_400Regular', 
    color: '#FFFFFF',
    fontWeight: 'normal', 
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '90%',
    marginVertical: 10,
    padding: 20,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  signInButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  signInButtonText: {
    fontFamily: 'Montserrat_400Regular', 
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'normal', 
  },
  signUpButton: {
    backgroundColor: '#FFFFFF',
  },
  signUpButtonText: {
    fontFamily: 'Montserrat_400Regular', 
    fontSize: 18,
    color: '#534E5B',
    fontWeight: 'normal', 
  }
});