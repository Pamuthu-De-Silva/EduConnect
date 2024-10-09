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
  ScrollView,
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
      await addDoc(collection(db, "courses"), {
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Create a New Course</Text>
        </View>
        <View style={styles.innerContainer}>
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
            style={[styles.input, styles.textArea]}
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
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavBar />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F39",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    marginBottom:280
  },
  headerContainer: {
    backgroundColor: "#3D5CFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 10,
    paddingTop: 20,
  },
  header: {
    fontSize: 28,
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    padding:20
  },
  innerContainer: {
    padding: 20,
    marginTop: 20,
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
  textArea: {
    height: 100,
    textAlignVertical: "top", // Makes multiline input look more like a text area
  },
  button: {
    backgroundColor: "#3D5CFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
  },
});
