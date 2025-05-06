import { View, Image, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreenComponent() {
  useEffect(() => {
    const prepare = async () => {
      try {
        await AsyncStorage.removeItem('userFilters');
        await new Promise(resolve => setTimeout(resolve, 2000)); 
      } finally {
        await SplashScreen.hideAsync();
        router.replace('/signup/Welcome');
      }
    };
    prepare();
  }, []);

  return (
    <View style={styles.container}>
      
      <Image 
        source={require('../assets/images/splash-screen-icon.png')}
        style={styles.image}
        resizeMode="contain"
      />
      
      <ActivityIndicator 
        size="large" 
        color="#FFFFFF" 
        style={styles.spinner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#534E5B'
  },
  image: {
    width: Platform.select({
      ios: 200,
      android: 220,
      web: 380
    }),
    height: Platform.select({
      ios: 200,
      android: 220,
      web: 380
    }),
    marginBottom: 30
  },
  spinner: {
    position: 'absolute',
    bottom: Platform.select({
      ios: 100,
      android: 120,
      web: 80
    })
  }
});