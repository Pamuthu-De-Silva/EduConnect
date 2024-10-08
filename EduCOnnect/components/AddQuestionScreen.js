import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import FormInput from "../components/shared/FormInput";
import FormButton from "../components/shared/FormButton";

const AddQuestionScreen = ({ navigation, route }) => {
  const quizId = route.params?.quizId || null; // Get quizId from route params
  const quizTitle = route.params?.quizTitle || ""; // Get quizTitle from route params

  // Check for quizId once the screen is loaded
  useEffect(() => {
    console.log("Received quizId: ", quizId); // Debug log to confirm quizId is passed correctly
    if (!quizId) {
      Alert.alert(
        "Error",
        "No quiz ID provided. Please go back and create/select a valid quiz."
      );
      navigation.goBack(); // Go back if no quizId is provided
    }
  }, [quizId]);

  const [question, setQuestion] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [optionTwo, setOptionTwo] = useState("");
  const [optionThree, setOptionThree] = useState("");
  const [optionFour, setOptionFour] = useState("");
  const [uploading, setUploading] = useState(false);

  // Handle adding a question
  const handleQuestionSave = async () => {
    if (
      !question ||
      !correctAnswer ||
      !optionTwo ||
      !optionThree ||
      !optionFour
    ) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setUploading(true);

    try {
      await addDoc(collection(db, "quizzes", quizId, "questions"), {
        question: question,
        correct_answer: correctAnswer,
        incorrect_answers: [optionTwo, optionThree, optionFour],
      });

      Alert.alert("Success", "Question saved successfully!");
      resetForm();

      // Navigate back to the same screen to add another question
      navigation.replace("AddQuestionScreen", {
        quizId: quizId,
        quizTitle: quizTitle,
      });
    } catch (error) {
      console.error("Error saving question:", error);
      Alert.alert("Error", `Failed to save question: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Reset the form after saving
  const resetForm = () => {
    setQuestion("");
    setCorrectAnswer("");
    setOptionTwo("");
    setOptionThree("");
    setOptionFour("");
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: "#1F1F39" }}>
        <View style={{ padding: 20 }}>
          <Text style={styles.title}>Add Question</Text>
          <Text style={styles.subtitle}>For {quizTitle}</Text>

          <FormInput
            labelText="Question"
            placeholderText="Enter the question"
            onChangeText={(val) => setQuestion(val)}
            value={question}
          />

          <FormInput
            labelText="Correct Answer"
            placeholderText="Enter the correct answer"
            onChangeText={(val) => setCorrectAnswer(val)}
            value={correctAnswer}
          />
          <FormInput
            labelText="Option 2"
            placeholderText="Enter option 2"
            onChangeText={(val) => setOptionTwo(val)}
            value={optionTwo}
          />
          <FormInput
            labelText="Option 3"
            placeholderText="Enter option 3"
            onChangeText={(val) => setOptionThree(val)}
            value={optionThree}
          />
          <FormInput
            labelText="Option 4"
            placeholderText="Enter option 4"
            onChangeText={(val) => setOptionFour(val)}
            value={optionFour}
          />

          {uploading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <FormButton
              labelText="Save Question"
              handleOnPress={handleQuestionSave}
            />
          )}

          <FormButton
            labelText="Done & Go Home"
            isPrimary={false}
            handleOnPress={() => navigation.navigate("TeacherDashboard")}
            style={{ marginVertical: 20 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = {
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    color: "#fff",
    marginBottom: 20,
  },
};

export default AddQuestionScreen;
