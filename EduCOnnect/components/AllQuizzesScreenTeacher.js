// AllQuizzesScreenTeacher.js
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
  Alert,
} from "react-native";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore"; // Firebase Firestore methods
import { db } from "../firebaseConfig"; // Firestore configuration
import FormButton from "../components/shared/FormButton"; // Your shared button component
import Icon from "react-native-vector-icons/MaterialIcons"; // Import the icon library
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import BottomNavBarTeacher from "./BottemNavBarTeacher";
import Feather from "react-native-vector-icons/Feather"; // Icons for modify and delete
import { FontAwesome, Ionicons } from "@expo/vector-icons";

const AllQuizzesScreenTeacher = ({ navigation }) => {
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_700Bold });

  // Fetch all quizzes from Firestore
  const getAllQuizzes = async () => {
    setRefreshing(true);
    try {
      const quizSnapshot = await getDocs(collection(db, "quizzes"));
      let tempQuizzes = [];
      quizSnapshot.forEach((doc) => {
        tempQuizzes.push({ id: doc.id, ...doc.data() });
      });
      setAllQuizzes(tempQuizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      Alert.alert("Error", "Failed to fetch quizzes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getAllQuizzes();
  }, []);

  // Delete Quiz function
  const handleDeleteQuiz = async (quizId) => {
    Alert.alert(
      "Delete Quiz",
      "Are you sure you want to delete this quiz?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "quizzes", quizId));
              Alert.alert("Success", "Quiz deleted successfully!");
              getAllQuizzes(); // Refresh quizzes
            } catch (error) {
              console.error("Error deleting quiz:", error);
              Alert.alert("Error", "Failed to delete quiz.");
            }
          },
        },
      ],
      { cancelable: true }
    );
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
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1F1F39" barStyle={"light-content"} />

      <View style={styles.header}>
        <Text style={styles.headerText}>All Quizzes</Text>

        {/* Create Quiz Button at the top-right */}
        <FormButton
          labelText="Create Quiz"
          style={styles.createQuizButton}
          handleOnPress={() => navigation.navigate("AddQuiz")}
        />
      </View>

      {/* Subtitle for "Your Quizzes" */}
      <Text style={styles.subtitle}>Your Quizzes</Text>

      <FlatList
        data={allQuizzes}
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
            <View style={styles.buttonGroup}>
              {/* Update Button with Icon */}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  navigation.navigate("UpdateQuizScreen", {
                    quizId: quiz.id,
                  });
                }}
              >
                <Feather name="edit" size={24} color="#FFF" />
              </TouchableOpacity>

              {/* Delete Button with Icon */}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleDeleteQuiz(quiz.id)}
              >
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.navBarContainer}>
        <BottomNavBarTeacher />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F39", // Dark theme background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1F1F39",
  },
  loadingText: {
    color: "#FFFFFF",
    fontFamily: "Poppins_400Regular",
    marginTop: 10,
  },
  header: {
    backgroundColor: "#3D5CFF",
    padding: 20,
    flexDirection: "row", // To position the title and button side by side
    justifyContent: "space-between", // Push the button to the right
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginTop: 30,
    marginBottom: 30,
  },
  headerText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
  },
  createQuizButton: {
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FF6905", // Button color changed to make it stand out
  },
  subtitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    marginHorizontal: 20,
    marginTop: 20,
  },
  quizList: {
    paddingVertical: 20,
  },
  quizCard: {
    padding: 20,
    borderRadius: 8,
    marginVertical: 10,
    marginHorizontal: 15,
    backgroundColor: "#292C4D", // Card background to match the dark theme
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4, // Shadow for iOS and Android
  },
  quizTitle: {
    fontSize: 18,
    color: "#FFFFFF", // White text for quiz title
    fontFamily: "Poppins_700Bold",
  },
  quizDescription: {
    color: "#B0B0C3",
    fontFamily: "Poppins_400Regular",
    marginTop: 5,
  },
  buttonGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // Align buttons to the right
  },
  iconButton: {
    marginLeft: 10, // Add space between the buttons
  },
  navBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1F1F39", // Matching background with the screen
  },
});

export default AllQuizzesScreenTeacher;
