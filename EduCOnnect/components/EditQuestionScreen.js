// EditQuestionScreen.js
import React, { useState, useEffect } from "react";
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
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebaseConfig";
import FormInput from "../components/shared/FormInput";
import FormButton from "../components/shared/FormButton";

const EditQuestionScreen = ({ navigation, route }) => {
  const { quizId, questionId } = route.params;
  const [question, setQuestion] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [optionTwo, setOptionTwo] = useState("");
  const [optionThree, setOptionThree] = useState("");
  const [optionFour, setOptionFour] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_700Bold });

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const questionRef = doc(db, "quizzes", quizId, "questions", questionId);
        const questionSnap = await getDoc(questionRef);
        if (questionSnap.exists()) {
          const data = questionSnap.data();
          setQuestion(data.question);
          setCorrectAnswer(data.correct_answer);
          setOptionTwo(data.incorrect_answers[0]);
          setOptionThree(data.incorrect_answers[1]);
          setOptionFour(data.incorrect_answers[2]);
          setExistingImageUrl(data.imageUrl || "");
        } else {
          Alert.alert("Error", "Question not found.");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error fetching question:", error);
        Alert.alert("Error", "Failed to fetch question.");
      }
    };

    fetchQuestion();
  }, []);

  const handleQuestionUpdate = async () => {
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
    let imageUrl = existingImageUrl;

    if (imageUri) {
      const storageRef = ref(
        storage,
        `images/questions/${quizId}_${questionId}`
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
          Alert.alert("Error", "Image upload failed.");
        },
        async () => {
          imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          updateQuestionInDatabase(imageUrl);
        }
      );
    } else {
      updateQuestionInDatabase(imageUrl);
    }
  };

  const updateQuestionInDatabase = async (imageUrl) => {
    try {
      const questionRef = doc(db, "quizzes", quizId, "questions", questionId);
      await updateDoc(questionRef, {
        question: question,
        correct_answer: correctAnswer,
        incorrect_answers: [optionTwo, optionThree, optionFour],
        imageUrl: imageUrl,
      });
      Alert.alert("Success", "Question updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating question:", error);
      Alert.alert("Error", "Failed to update question.");
    } finally {
      setUploading(false);
    }
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
          <Text style={styles.title}>Edit Question</Text>

          <FormInput
            labelText="Question"
            placeholderText="Enter the question"
            onChangeText={(val) => setQuestion(val)}
            value={question}
          />

          {existingImageUrl || imageUri ? (
            <Image
              source={{ uri: imageUri || existingImageUrl }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
          ) : null}

          <TouchableOpacity
            style={styles.addImageButton}
            onPress={selectImage}
          >
            <Text style={styles.addImageText}>+ {existingImageUrl ? "Change Image" : "Add Image"}</Text>
          </TouchableOpacity>

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
              labelText="Update Question"
              handleOnPress={handleQuestionUpdate}
            />
          )}

          <FormButton
            labelText="Cancel"
            isPrimary={false}
            handleOnPress={() => navigation.goBack()}
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

export default EditQuestionScreen;
