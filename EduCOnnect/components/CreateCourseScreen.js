import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

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
    <View style={styles.container}>
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
      />

      <TouchableOpacity onPress={handleCreateCourse} style={styles.button}>
        <Text style={styles.buttonText}>Create Course</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F39",
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
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#3D5CFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
});
