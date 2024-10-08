import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import BottomNavBar from "./BottemNavBarTeacher"; // Importing BottomNavBar

export default function CreateCourseScreen() {
  const [courseName, setCourseName] = useState("");
  const [courseCategory, setCourseCategory] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const navigation = useNavigation();

  const handleCreateCourse = async () => {
    if (!courseName || !courseCategory || !courseDescription) {
      Alert.alert("Error", "Please fill in all the fields");
      return;
    }

    try {
      const newCourse = await addDoc(collection(db, "courses"), {
        name: courseName,
        category: courseCategory,
        description: courseDescription,
        userId: auth.currentUser.uid,
        createdAt: new Date(),
        published: false,
      });
      Alert.alert("Success", "Course created successfully!");
      navigation.navigate("TeacherDashboard"); // Navigate back to dashboard after creation
    } catch (error) {
      console.error("Error creating course:", error);
      Alert.alert("Error", "Failed to create course.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Create a New Course</Text>

        <TextInput
          style={styles.input}
          placeholder="Course Name"
          value={courseName}
          onChangeText={setCourseName}
          placeholderTextColor="#B0B0C3"
        />

        <TextInput
          style={styles.input}
          placeholder="Course Category"
          value={courseCategory}
          onChangeText={setCourseCategory}
          placeholderTextColor="#B0B0C3"
        />

        <TextInput
          style={styles.input}
          placeholder="Course Description"
          value={courseDescription}
          onChangeText={setCourseDescription}
          placeholderTextColor="#B0B0C3"
          multiline={true}
          numberOfLines={4}
        />

        <TouchableOpacity
          onPress={handleCreateCourse}
          style={styles.button}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Create Course</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation Bar */}
      <BottomNavBar />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F39",
    justifyContent: "space-between",
    marginTop:25
  },
  innerContainer: {
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 27,
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#292C4D",
    color: "#fff",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },
  button: {
    backgroundColor: "#3D5CFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
  },
});
