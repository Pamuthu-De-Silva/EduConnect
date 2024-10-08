// ManageQuestionsScreen.js
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
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import FormButton from "../components/shared/FormButton";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import BottomNavBarTeacher from "./BottemNavBarTeacher";

const ManageQuestionsScreen = ({ route, navigation }) => {
  const { quizId, quizTitle } = route.params; // Fetch quizId and quizTitle from route parameters
  const [allQuestions, setAllQuestions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_700Bold });

  // Fetch all questions from Firestore
  const getAllQuestions = async () => {
    setRefreshing(true);
    try {
      const questionsSnapshot = await getDocs(
        collection(db, "quizzes", quizId, "questions")
      );
      let tempQuestions = [];
      questionsSnapshot.forEach((doc) => {
        tempQuestions.push({ id: doc.id, ...doc.data() });
      });
      setAllQuestions(tempQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      Alert.alert("Error", "Failed to fetch questions.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getAllQuestions();
  }, []);

  // Delete Question function
  const handleDeleteQuestion = async (questionId) => {
    Alert.alert(
      "Delete Question",
      "Are you sure you want to delete this question?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteDoc(
                doc(db, "quizzes", quizId, "questions", questionId)
              );
              Alert.alert("Success", "Question deleted successfully!");
              getAllQuestions(); // Refresh questions
            } catch (error) {
              console.error("Error deleting question:", error);
              Alert.alert("Error", "Failed to delete question.");
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
        <Text style={styles.loadingText}>Loading Questions...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1F1F39" barStyle={"light-content"} />

      <View style={styles.header}>
        <Text style={styles.headerText}></Text>

        {/* Add Question Button */}
        <FormButton
          labelText="Add Question"
          style={styles.addQuestionButton}
          handleOnPress={() =>
            navigation.navigate("AddQuestionScreen", {
              quizId: quizId, // Pass quizId correctly
              quizTitle: quizTitle, // Pass quizTitle correctly
            })
          }
        />
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Questions for "{quizTitle}"</Text>

      <FlatList
        data={allQuestions}
        onRefresh={getAllQuestions}
        refreshing={refreshing}
        showsVerticalScrollIndicator={false}
        style={styles.questionList}
        renderItem={({ item: question }) => (
          <View style={styles.questionCard}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.questionText}>{question.question}</Text>
            </View>
            <View style={styles.buttonGroup}>
              {/* Edit Button with Icon */}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() =>
                  navigation.navigate("EditQuestionScreen", {
                    quizId: quizId,
                    questionId: question.id,
                  })
                }
              >
                <Icon name="edit" size={24} color="#3D5CFF" />
              </TouchableOpacity>

              {/* Delete Button with Icon */}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleDeleteQuestion(question.id)}
              >
                <Icon name="delete" size={24} color="#FF3D71" />
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
    backgroundColor: "#1F1F39",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginTop: 30,
    marginBottom: 30,
  },
  addQuestionButton: {
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FF6905",
  },
  subtitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    marginHorizontal: 20,
    marginTop: 20,
  },
  questionList: {
    paddingVertical: 20,
  },
  questionCard: {
    padding: 20,
    borderRadius: 8,
    marginVertical: 10,
    marginHorizontal: 15,
    backgroundColor: "#292C4D",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
  },
  questionText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Poppins_400Regular",
  },
  buttonGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  iconButton: {
    marginLeft: 10,
  },
  navBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1F1F39",
  },
});

export default ManageQuestionsScreen;
