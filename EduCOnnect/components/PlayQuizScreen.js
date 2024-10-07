import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
} from "react-native";
import { collection, getDocs } from "firebase/firestore"; // Firestore methods
import { db } from "../firebaseConfig"; // Firestore configuration
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// Utility function to shuffle an array
const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const PlayQuizScreen = ({ navigation, route }) => {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { quizId } = route.params; // Extract quizId from route params

  // Fetch questions for the current quiz
  const getQuestionsForQuiz = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, "quizzes", quizId, "questions")
      );
      const questionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        shuffledOptions: shuffleArray(
          doc.data().incorrect_answers.concat(doc.data().correct_answer)
        ), // Shuffle answers when fetching the data
      }));
      setQuestions(questionsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getQuestionsForQuiz(); // Fetch questions when component mounts
  }, []);

  // Handle selecting an answer
  const handleAnswerSelection = (questionId, selectedOption) => {
    const question = questions.find((q) => q.id === questionId);
    const isCorrect = selectedOption === question.correct_answer;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));

    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }

    // Check if quiz is completed
    if (Object.keys(selectedAnswers).length === questions.length - 1) {
      setQuizCompleted(true);
    }
  };

  // Get the background color for selected options
  const getOptionBgColor = (questionId, option) => {
    const selectedOption = selectedAnswers[questionId];
    if (!selectedOption) return "#292C4D"; // Default background
    if (selectedOption === option) {
      return option ===
        questions.find((q) => q.id === questionId).correct_answer
        ? "#28a745" // Green for correct answer
        : "#dc3545"; // Red for incorrect answer
    }
    return "#292C4D";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1F1F39" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz Questions</Text>
      </View>

      <FlatList
        data={questions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{item.question}</Text>

            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.questionImage}
                resizeMode="contain"
              />
            ) : null}

            {item.shuffledOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  { backgroundColor: getOptionBgColor(item.id, option) },
                ]}
                onPress={() => handleAnswerSelection(item.id, option)}
                disabled={!!selectedAnswers[item.id]} // Disable after selection
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />

      {quizCompleted && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Quiz Completed!</Text>
          <Text style={styles.resultScore}>
            Your Score: {score}/{questions.length}
          </Text>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate("StudentHomePage")}
          >
            <Text style={styles.homeButtonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      )}
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
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#3D5CFF", // Primary color
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    marginLeft: 10,
  },
  questionCard: {
    backgroundColor: "#292C4D", // Card background color
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 15,
    borderRadius: 10,
  },
  questionText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Poppins_700Bold",
  },
  questionImage: {
    width: "100%",
    height: 200,
    marginVertical: 10,
    borderRadius: 5,
  },
  optionButton: {
    backgroundColor: "#3D5CFF20", // Light blue for options
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  optionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  resultContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  resultText: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  resultScore: {
    fontSize: 18,
    color: "#FFD700", // Gold color for score
    marginVertical: 10,
  },
  homeButton: {
    backgroundColor: "#3D5CFF",
    padding: 15,
    borderRadius: 50,
    marginTop: 20,
  },
  homeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
});

export default PlayQuizScreen;
