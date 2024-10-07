import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { launchImageLibrary } from "expo-image-picker";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebaseConfig";
import FormInput from "../components/shared/FormInput";
import FormButton from "../components/shared/FormButton";

const AddQuestionScreen = ({ navigation, route }) => {
  const [currentQuizId] = useState(route.params.currentQuizId); // Stay the same across multiple questions
  const [currentQuizTitle] = useState(route.params.currentQuizTitle);

  const [question, setQuestion] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [optionTwo, setOptionTwo] = useState("");
  const [optionThree, setOptionThree] = useState("");
  const [optionFour, setOptionFour] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_700Bold });

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
    const currentQuestionId = Math.floor(
      100000 + Math.random() * 9000
    ).toString();
    let imageUrl = "";

    if (imageUri) {
      const storageRef = ref(
        storage,
        `images/questions/${currentQuizId}_${currentQuestionId}`
      );
      const img = await fetch(imageUri);
      const imgBlob = await img.blob();
      const uploadTask = uploadBytesResumable(storageRef, imgBlob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error("Upload failed:", error);
          setUploading(false);
        },
        async () => {
          imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          saveQuestionToDatabase(imageUrl);
        }
      );
    } else {
      saveQuestionToDatabase(imageUrl);
    }
  };

  const saveQuestionToDatabase = async (imageUrl) => {
    try {
      await addDoc(collection(db, "quizzes", currentQuizId, "questions"), {
        question: question,
        correct_answer: correctAnswer,
        incorrect_answers: [optionTwo, optionThree, optionFour],
        imageUrl: imageUrl,
      });
      Alert.alert("Success", "Question saved successfully!");
      resetForm();

      // Allow the user to add another question
      navigation.navigate("AddQuestionScreen", {
        currentQuizId: currentQuizId,
        currentQuizTitle: currentQuizTitle,
      });
    } catch (error) {
      console.error("Error saving question:", error);
      Alert.alert("Error", "Failed to save question.");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setQuestion("");
    setCorrectAnswer("");
    setOptionTwo("");
    setOptionThree("");
    setOptionFour("");
    setImageUri("");
  };

  const selectImage = async () => {
    let result = await launchImageLibrary({ mediaType: "photo" });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
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
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: "#1F1F39" }}>
        <View style={{ padding: 20 }}>
          <Text style={styles.title}>Add Question</Text>
          <Text style={styles.subtitle}>For {currentQuizTitle}</Text>

          <FormInput
            labelText="Question"
            placeholderText="Enter the question"
            onChangeText={(val) => setQuestion(val)}
            value={question}
          />

          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
          ) : (
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={selectImage}
            >
              <Text style={styles.addImageText}>+ Add Image</Text>
            </TouchableOpacity>
          )}

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
  addImageButton: {
    backgroundColor: "#3D5CFF",
    alignItems: "center",
    padding: 20,
    marginVertical: 15,
    borderRadius: 5,
  },
  addImageText: {
    color: "#fff",
    opacity: 0.7,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    marginVertical: 10,
    borderRadius: 5,
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
  },
};

export default AddQuestionScreen;
