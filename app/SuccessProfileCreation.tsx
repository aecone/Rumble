import { Text, StyleSheet, TouchableOpacity, SafeAreaView, View } from 'react-native';
import React from 'react';
import { router } from 'expo-router';
import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';

const AllSetScreen = () => {
  let [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });
  
  if (!fontsLoaded) {
    return null;
  }

  const handleLogin = () => {
    router.push('/SignIn');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>You're all set!</Text>
      </View>
      
      <View style={styles.buttonWrapper}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Log Back In to Start Swiping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AllSetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#534E5B',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, // Prevents button from covering text on small screens
  },
  title: {
    fontSize: 32,
    fontFamily: 'Montserrat_700Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 38, // Better text spacing
  },
  buttonWrapper: {
    width: '100%',
    paddingBottom: 40, 
  },
  button: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 18,
    color: '#534E5B',
    letterSpacing: 0.5, 
  }
});