// UpdateQuizScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import FormButton from "../components/shared/FormButton"; // Your shared button component
import BottomNavBarTeacher from "./BottemNavBarTeacher"; // Importing BottomNavBarTeacher
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

const UpdateQuizScreen = ({ route, navigation }) => {
  const { quizId } = route.params;
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentDescription, setCurrentDescription] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_700Bold });

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const quizRef = doc(db, "quizzes", quizId);
        const quizSnap = await getDoc(quizRef);
        if (quizSnap.exists()) {
          const data = quizSnap.data();
          setCurrentTitle(data.title);
          setCurrentDescription(data.description);
          setTitle(data.title);
          setDescription(data.description);
        } else {
          Alert.alert("Error", "Quiz not found.");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
        Alert.alert("Error", "Failed to fetch quiz details.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, []);

  const handleUpdateQuiz = async () => {
    if (!title || !description) {
      Alert.alert("Error", "Both fields are required.");
      return;
    }

    setLoading(true);
    try {
      const quizRef = doc(db, "quizzes", quizId);
      await updateDoc(quizRef, { title, description });
      setLoading(false);
      Alert.alert("Success", "Quiz updated successfully!");
      navigation.goBack(); // Navigate back after update
    } catch (error) {
      setLoading(false);
      console.error("Error updating quiz:", error);
      Alert.alert("Error", "Failed to update quiz.");
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3D5CFF" />
        <Text style={styles.loadingText}>Updating Quiz...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.label}>Update Quiz</Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            placeholder="Quiz Title"
            placeholderTextColor="#B0B0C3"
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, { height: 100 }]} // Height increased for multi-line input
            placeholder="Quiz Description"
            placeholderTextColor="#B0B0C3"
            multiline
          />

          {loading ? (
            <ActivityIndicator size="large" color="#3D5CFF" />
          ) : (
            <FormButton
              labelText="Update Quiz"
              handleOnPress={handleUpdateQuiz}
              style={styles.updateButton}
            />
          )}

          <FormButton
            labelText="Manage Questions"
            handleOnPress={() =>
              navigation.navigate("ManageQuestionsScreen", {
                quizId: quizId,
                quizTitle: title,
              })
            }
            style={styles.manageQuestionsButton}
          />

          <FormButton
            labelText="Done & Go Home"
            isPrimary={false}
            handleOnPress={() => navigation.navigate("TeacherDashboard")}
            style={{ marginVertical: 20 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Navigation Bar */}
      <View style={styles.navBarContainer}>
        <BottomNavBarTeacher />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F39", // Dark background color
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100, // Ensure there is space for the BottomNavBar
  },
  label: {
    color: "#fff",
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#292C4D", // Dark input background
    color: "#fff", // White text
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
    fontFamily: "Poppins_400Regular",
  },
  updateButton: {
    marginTop: 20,
  },
  manageQuestionsButton: {
    marginTop: 10,
    backgroundColor: "#3D5CFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1F1F39",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontFamily: "Poppins_400Regular",
  },
  navBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1F1F39", // Matching background with the screen
  },
});

export default UpdateQuizScreen;
