import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function LandingPage() {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('OnboardScreen'); 
    }, 3000); 

    return () => clearTimeout(timer); 
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1F1F39" barStyle="light-content" />
      <Image
        source={require('../assets/Logo.png')} // Path to the image
        style={styles.image}
      />
      <Text style={styles.text}>EduConnect</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F1F39',
  },
  image: {
    width: 104,
    height: 104,
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: '#FFFFFF',
  },
});
