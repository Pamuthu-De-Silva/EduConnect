import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from "react-native";
import { collection, getDocs } from "firebase/firestore"; // Firebase Firestore methods
import { db } from "../firebaseConfig"; // Firestore configuration
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import MaterialIcons from "react-native-vector-icons/MaterialIcons"; // Search icon
import { LinearGradient } from 'expo-linear-gradient'; // Gradient backgrounds
import BottomNavBar from "./BottomNavBar";

const AllQuizzesScreen = ({ navigation }) => {
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]); // State to hold filtered quizzes
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_700Bold });

  // Fetch all quizzes from Firestore
  const getAllQuizzes = async () => {
    setRefreshing(true);
    const quizSnapshot = await getDocs(collection(db, "quizzes"));
    let tempQuizzes = [];
    quizSnapshot.forEach((doc) => {
      tempQuizzes.push({ id: doc.id, ...doc.data() });
    });
    setAllQuizzes(tempQuizzes);
    setFilteredQuizzes(tempQuizzes); // Set initial filtered quizzes to be all quizzes
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    getAllQuizzes();
  }, []);

  // Handle search query change
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === "") {
      setFilteredQuizzes(allQuizzes); // If no query, show all quizzes
    } else {
      const filtered = allQuizzes.filter((quiz) =>
        quiz.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredQuizzes(filtered);
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3D5CFF" />
        <Text style={styles.loadingText}>Loading Quizzes...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#1F1F39", "#3D5CFF"]} style={styles.container}>
      <StatusBar backgroundColor="#1F1F39" barStyle={"light-content"} />

      {/* Search Input Section */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#FFFFFF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Quizzes"
            placeholderTextColor="#B0B0C3"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Quizzes List */}
      <FlatList
        data={filteredQuizzes}
        onRefresh={getAllQuizzes}
        refreshing={refreshing}
        showsVerticalScrollIndicator={false}
        style={styles.quizList}
        renderItem={({ item: quiz }) => (
          <View style={styles.quizCard}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.quizTitle}>{quiz.title}</Text>
              {quiz.description !== "" && (
                <Text style={styles.quizDescription}>{quiz.description}</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => {
                navigation.navigate("PlayQuizScreen", {
                  quizId: quiz.id,
                });
              }}
            >
              <Text style={styles.playButtonText}>Play</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      <View>
        <BottomNavBar />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontFamily: "Poppins_400Regular",
    marginTop: 10,
  },
  header: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: 'rgba(61, 92, 255, 0.8)', // More transparent background for modern look
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#292C4D",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: "100%",
    marginTop:20
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    marginLeft: 10,
  },
  quizList: {
    paddingVertical: 20,
  },
  quizCard: {
    padding: 20,
    borderRadius: 12,
    marginVertical: 10,
    marginHorizontal: 15,
    backgroundColor: "#2A2B46", // Slightly darker for contrast
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5, // For better shadow on Android
  },
  quizTitle: {
    fontSize: 20,
    color: "#FFFFFF", // White text for quiz title
    fontFamily: "Poppins_700Bold",
  },
  quizDescription: {
    color: "#B0B0C3",
    fontFamily: "Poppins_400Regular",
    marginTop: 5,
  },
  playButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 50,
    backgroundColor: "#FF6B6B", // Brightened color for the button
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5, // Adding shadow to button as well
  },
  playButtonText: {
    color: "#FFFFFF",
    fontFamily: "Poppins_700Bold",
  },
});

export default AllQuizzesScreen;
