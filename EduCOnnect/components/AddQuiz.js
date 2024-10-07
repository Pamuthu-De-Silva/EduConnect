import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import BottomNavBarTeacher from "./BottemNavBarTeacher";

export default function CreateQuiz({ navigation }) {
  // Add navigation prop
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_700Bold });

  useEffect(() => {
    // Additional effects or data fetching can be added here if necessary
  }, []);

  const handleCreateQuiz = async () => {
    if (!quizTitle || !quizDescription) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const quizDocRef = await addDoc(collection(db, "quizzes"), {
        title: quizTitle,
        description: quizDescription,
        userId: auth.currentUser.uid,
        createdAt: new Date(),
      });

      const createdQuizId = quizDocRef.id; // Get the ID of the created quiz

      setQuizTitle("");
      setQuizDescription("");
      setLoading(false);
      Alert.alert("Success", "Quiz created successfully!");

      // Navigate to AddQuestionScreen with quizId and quizTitle
      navigation.navigate("AddQuestionScreen", {
        currentQuizId: createdQuizId,
        currentQuizTitle: quizTitle,
      });
    } catch (error) {
      console.error("Error creating quiz:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to create quiz.");
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3D5CFF" />
        <Text style={styles.loadingText}>Loading Fonts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create New Quiz</Text>

        <TextInput
          style={styles.input}
          placeholder="Quiz Title"
          value={quizTitle}
          onChangeText={setQuizTitle}
          placeholderTextColor="#B0B0C3"
        />

        <TextInput
          style={styles.input}
          placeholder="Quiz Description"
          value={quizDescription}
          onChangeText={setQuizDescription}
          placeholderTextColor="#B0B0C3"
        />

        {loading ? (
          <ActivityIndicator size="large" color="#3D5CFF" />
        ) : (
          <TouchableOpacity onPress={handleCreateQuiz} style={styles.button}>
            <Text style={styles.buttonText}>Create Quiz</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <BottomNavBarTeacher style={styles.bottomNavBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F39",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#1F1F39",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
  },
  title: {
    fontSize: 27,
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    marginBottom: 20,
    marginTop: 30,
  },
  input: {
    backgroundColor: "#292C4D",
    color: "#fff",
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#3D5CFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
  },
  bottomNavBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#292C4D",
    justifyContent: "center",
    alignItems: "center",
  },
});
