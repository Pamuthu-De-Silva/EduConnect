import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

export default function OnboardScreen() {
  // Load fonts
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  const navigation = useNavigation(); 

  if (!fontsLoaded) {
    return null; 
  }

  // Navigate to the Login page
  const handleLoginPress = () => {
    navigation.navigate('LoginScreen'); 
  };

  // Navigate to the Sign Up page
  const handleSignUpPress = () => {
    navigation.navigate('SignUpScreen'); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Image
          source={require('../assets/landing.png')}
          style={styles.image}
        />
        <Text style={styles.text}>Create your own{'\n'}Study Plan</Text>
        <Text style={styles.textdescription}>
          Study according to the {'\n'}study plan, make study {'\n'}more motivated
        </Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.buttonLogin} onPress={handleLoginPress}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonSignUp} onPress={handleSignUpPress}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F1F39',
    paddingHorizontal: 20,
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 100, 
  },
  image: {
    width: 286,
    height: 286,
    marginBottom: 20,
  },
  text: {
    fontSize: 27,
    color: '#ffff',
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  textdescription: {
    fontSize: 13,
    color: '#F4F3FD',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',  // Arrange buttons in a horizontal row
    marginTop: 90,         // Add some space above the buttons
  },
  buttonLogin: {
    flex: 1,                    // Make buttons expand equally
    backgroundColor: '#3D5CFF',  // Color for Login button
    paddingVertical: 12,         // Vertical padding for button height
    borderRadius: 8,             // Rounded corners
    marginHorizontal: 10,        // Space between the buttons
    alignItems: 'center',        // Center button content horizontally
    justifyContent: 'center',    // Center button content vertically
  },
  buttonSignUp: {
    flex: 1,                    // Make buttons expand equally
    backgroundColor: '#858597',  // Color for Sign Up button
    paddingVertical: 12,         // Vertical padding for button height
    borderRadius: 8,             // Rounded corners
    marginHorizontal: 10,        // Space between the buttons
    alignItems: 'center',        // Center button content horizontally
    justifyContent: 'center',    // Center button content vertically
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
});
