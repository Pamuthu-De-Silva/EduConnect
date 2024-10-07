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
} from "react-native";
import { collection, getDocs } from "firebase/firestore"; // Firebase Firestore methods
import { db } from "../firebaseConfig"; // Firestore configuration
import FormButton from "../components/shared/FormButton"; // Your shared button component
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

const AllQuizzesScreen = ({ navigation }) => {
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
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
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    getAllQuizzes();
  }, []);

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
      </View>

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

      {/* Button to Create Quiz */}
      
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
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
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
  playButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 50,
    backgroundColor: "#3D5CFF", // Primary color for the button
  },
  playButtonText: {
    color: "#FFFFFF",
    fontFamily: "Poppins_700Bold",
  },
  createQuizButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    borderRadius: 50,
    paddingHorizontal: 30,
    backgroundColor: "#3D5CFF", // Primary color for create quiz button
  },
});

export default AllQuizzesScreen;
