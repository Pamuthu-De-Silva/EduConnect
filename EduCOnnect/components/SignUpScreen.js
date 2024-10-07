// SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import Checkbox from 'expo-checkbox';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accountType, setAccountType] = useState('student');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const validateForm = () => {
    if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required!");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return false;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return false;
    }
    if (!termsAccepted) {
      Alert.alert("Error", "You must agree to the terms and conditions.");
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user details to Firestore under the 'users' collection
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        phoneNumber,
        accountType,
        createdAt: new Date(),
      });

      Alert.alert("Success", "Account created successfully!");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Image
          source={require('../assets/login.png')}
          style={styles.image}
        />
        <Text style={styles.text}>Sign Up</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          placeholderTextColor="#B0B0C3"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#B0B0C3"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          placeholderTextColor="#B0B0C3"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#B0B0C3"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholderTextColor="#B0B0C3"
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Account Type:</Text>
          <Picker
            selectedValue={accountType}
            style={styles.picker}
            onValueChange={(itemValue) => setAccountType(itemValue)}
          >
            <Picker.Item label="Student" value="student" />
            <Picker.Item label="Teacher" value="teacher" />
          </Picker>
        </View>

        <View style={styles.checkboxContainer}>
          <Checkbox
            value={termsAccepted}
            onValueChange={setTermsAccepted}
            color={termsAccepted ? '#4630EB' : undefined}
          />
          <Text style={styles.label}>I agree to the terms and conditions</Text>
        </View>

        <TouchableOpacity
          style={[styles.buttonSignUp, !termsAccepted && { backgroundColor: '#A9A9A9' }]} 
          onPress={handleSignUp}
          disabled={!termsAccepted}
        >
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
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
    width: '100%',
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 24,
    color: '#ffffff',
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#3E3E55',
    borderRadius: 8,
    paddingHorizontal: 10,
    color: '#fff',
    marginVertical: 8,
    fontFamily: 'Poppins_400Regular',
  },
  pickerContainer: {
    width: '100%',
    marginVertical: 8,
    backgroundColor: '#3E3E55',
    borderRadius: 8,
  },
  picker: {
    color: '#B0B0C3',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  label: {
    fontSize: 12,
    color: '#B0B0C3',
    fontFamily: 'Poppins_400Regular',
    marginLeft: 8,
  },
  buttonSignUp: {
    backgroundColor: '#3D5CFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
});
