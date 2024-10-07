import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl, // Import RefreshControl
} from "react-native";
import { Video } from "expo-av";
import { db } from "../firebaseConfig";
import { collection, query, onSnapshot } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import BottomNavBar from "./BottomNavBar"; // Import the BottomNavBar component

const LectureDetailScreen = ({ route }) => {
  const { lecture } = route.params || { lecture: {} }; // Fallback for undefined lecture
  const navigation = useNavigation();
  const [lectures, setLectures] = useState([]);
  const [refreshing, setRefreshing] = useState(false); // State for refreshing

  useEffect(() => {
    const q = query(collection(db, "lectures"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedLectures = [];
      querySnapshot.forEach((doc) => {
        fetchedLectures.push({ id: doc.id, ...doc.data() });
      });
      setLectures(fetchedLectures);
    });
    return () => unsubscribe();
  }, []);

  // Function to handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    const q = query(collection(db, "lectures"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedLectures = [];
      querySnapshot.forEach((doc) => {
        fetchedLectures.push({ id: doc.id, ...doc.data() });
      });
      setLectures(fetchedLectures);
      setRefreshing(false); // Stop refreshing once data is reloaded
    });
    return () => unsubscribe();
  };

  // Error handling in case lecture is undefined
  if (!lecture || Object.keys(lecture).length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>
          Lecture details are not available.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.goBackButton}
        >
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
        <BottomNavBar /> {/* Always render the bottom navbar */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="arrow-back" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Video Player */}
      <Video
        source={{ uri: lecture.videoURL }}
        style={styles.video}
        useNativeControls
        resizeMode="contain"
        shouldPlay
      />

      {/* Lecture Details */}
      <Text style={styles.title}>{lecture.name}</Text>
      <Text style={styles.description}>{lecture.description}</Text>

      {/* Play Next Section */}
      <Text style={styles.sectionTitle}>Up Next</Text>
      <FlatList
        data={lectures.filter((item) => item.id !== lecture.id)} // Filter out the current lecture
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.lectureWrapper}
            onPress={() =>
              navigation.replace("LectureDetailScreen", { lecture: item })
            } // Replace with next lecture
          >
            <Video
              source={{ uri: item.videoURL }}
              style={styles.thumbnailImage}
              useNativeControls={false}
              resizeMode="cover"
              isLooping={false}
              shouldPlay={false}
            />
            <View style={styles.detailsContainer}>
              <Text style={styles.courseTitle}>{item.name}</Text>
              <Text style={styles.courseDescription}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} /> // Add RefreshControl for pull-to-refresh
        }
        contentContainerStyle={styles.lectureList}
      />

      {/* Bottom Navigation Bar */}
      <BottomNavBar style={styles.bottomNavBar} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F39", // Dark theme background
  },
  backButton: {
    marginBottom: 20,
    marginTop: 50, // Ensure the back button is below the status bar
    marginLeft: 20, // Adjust left margin to align properly
  },
  video: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: "#FFFFFF", // White title
    fontWeight: "bold",
    marginBottom: 10,
    marginHorizontal: 20, // Adjusted for consistent side spacing
  },
  description: {
    fontSize: 16,
    color: "#B0B0C3", // Grey description text
    marginBottom: 20,
    marginHorizontal: 20, // Adjusted for consistent side spacing
  },
  sectionTitle: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginVertical: 10,
    marginHorizontal: 20, // Adjusted for consistent side spacing
  },
  lectureWrapper: {
    backgroundColor: "#3E3E55", // Updated color to match the UI
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    marginHorizontal: 20, // Adjusted for consistent side spacing
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 }, // iOS shadow offset
    shadowOpacity: 0.3, // iOS shadow opacity
    shadowRadius: 4, // iOS shadow blur
  },
  thumbnailImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  detailsContainer: {
    flex: 1,
  },
  courseTitle: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
  },
  courseDescription: {
    color: "#B0B0C3",
    fontFamily: "Poppins_400Regular",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1F1F39",
  },
  errorMessage: {
    color: "#FF6B6B",
    fontSize: 18,
    marginBottom: 20,
  },
  goBackButton: {
    backgroundColor: "#3D5CFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  goBackText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  bottomNavBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  lectureList: {
    paddingBottom: 80, // Add padding to avoid overlap with the bottom navbar
  },
});

export default LectureDetailScreen;
