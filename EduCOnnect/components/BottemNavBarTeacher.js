import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';


export default function BottomNavBar() {
  const navigation = useNavigation();

  // Scale animation for button press
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: [{ scale: scaleValue }],
  };

  return (
    <LinearGradient
      colors={['#3D5CFF', '#6A82FB']}  // Gradient colors for a modern look
      style={styles.navBar}
    >
      {/* Home Button */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('TeacherDashboard')}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.iconContainer, animatedStyle]}>
          <Icon name="home" size={28} color="#fff" />
          
        </Animated.View>
      </TouchableOpacity>

      {/* Resources Button */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('PdfUploadPage')}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.iconContainer, animatedStyle]}>
          <Icon name="library-books" size={28} color="#fff" />
          
        </Animated.View>
      </TouchableOpacity>

      {/* Downloads Button */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('VideoUpload')}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.iconContainer, animatedStyle]}>
          <AntDesign name="upload" size={28} color="#fff" />
          
        </Animated.View>
      </TouchableOpacity>

      {/* Community Button */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('Community')}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.iconContainer, animatedStyle]}>
          <Icon name="group" size={28} color="#fff" />
          
        </Animated.View>
      </TouchableOpacity>

      {/* Account Button */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('Account')}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.iconContainer, animatedStyle]}>
          <Icon name="account-circle" size={28} color="#fff" />
          
        </Animated.View>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
  },
  navText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    marginTop: 5,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
