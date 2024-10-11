// ProfileScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import BottomNavBar from "./BottomNavBar";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons"; // Importing for the leaderboard icon

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    };
    fetchUserData();
  }, []);

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace("LoginScreen"); // Navigate to sign-in page
      })
      .catch((error) => {
        console.log("Error signing out:", error);
      });
  };

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Picture and Information */}
      <View style={styles.profileContainer}>
        <Image
          source={require("../assets/profile_placeholder.png")} // Placeholder image or user image if available
          style={styles.profileImage}
        />
        <Text style={styles.nameText}>{userData.fullName}</Text>
        <Text style={styles.emailText}>{userData.email}</Text>
        <Text style={styles.phoneText}>{userData.phoneNumber}</Text>
        <Text style={styles.accountTypeText}>
          Account Type: {userData.accountType}
        </Text>
      </View>

      {/* Leaderboard Button */}
      <TouchableOpacity
        style={styles.leaderboardButton}
        onPress={() => navigation.navigate("LeaderboardScreen")} // Navigate to LeaderboardScreen
      >
        <Icon name="leaderboard" size={50} color="#fff" />
        <Text style={styles.leaderboardTitle}>Leaderboard</Text>
        <Text style={styles.leaderboardSubtitle}>
          See how you rank against other learners!
        </Text>
      </TouchableOpacity>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.buttonSignOut} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <View style={styles.navbarContainer}>
        <BottomNavBar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1F1F39",
    paddingHorizontal: 20,
    marginTop: -80,
  },
  leaderboardButton: {
    backgroundColor: "#1D2747",
    height: 180, // Increase height for better visibility
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 15, // Rounder corners for better visual appearance
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFD700", // Gold border for leaderboard button
    shadowColor: "#000", // Add shadow for better visibility
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5, // Add elevation for shadow in Android
  },
  leaderboardTitle: {
    color: "#fff",
    fontSize: 20, // Larger font for better visibility
    fontFamily: "Poppins_700Bold",
    marginTop: 10,
  },
  leaderboardSubtitle: {
    color: "#fff",
    fontSize: 15, // Increase subtitle font size
    textAlign: "center",
    marginTop: 5,
    marginHorizontal: 20,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  nameText: {
    fontSize: 24,
    color: "#ffffff",
    fontFamily: "Poppins_700Bold",
    marginBottom: 5,
  },
  emailText: {
    fontSize: 16,
    color: "#B0B0C3",
    fontFamily: "Poppins_400Regular",
    marginBottom: 5,
  },
  phoneText: {
    fontSize: 16,
    color: "#B0B0C3",
    fontFamily: "Poppins_400Regular",
    marginBottom: 5,
  },
  accountTypeText: {
    fontSize: 16,
    color: "#3D5CFF",
    fontFamily: "Poppins_400Regular",
  },
  buttonSignOut: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },
  navbarContainer: {
    position: "absolute",
    bottom: 0,
    width: width, // Full width of the screen
    backgroundColor: "#1F1F39", // Match the theme
    paddingVertical: 10, // Adjust padding if needed
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1F1F39",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Poppins_400Regular",
  },
});