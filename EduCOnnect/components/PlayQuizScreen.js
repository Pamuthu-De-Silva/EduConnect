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
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore"; // Firestore methods
import { db, auth } from "../firebaseConfig"; // Firestore configuration and auth
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// Utility function to shuffle an array
const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const PlayQuizScreen = ({ navigation, route }) => {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0); // Will calculate based on points now
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { quizId, quizTitle } = route.params; // Extract quizId and quizTitle from route params

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

    // Update score based on whether the answer is correct or incorrect
    setScore((prevScore) => (isCorrect ? prevScore + 50 : prevScore - 20));

    // Check if quiz is completed
    if (Object.keys(selectedAnswers).length === questions.length - 1) {
      setQuizCompleted(true);
    }
  };

  // Update the user's score in Firestore after the quiz is completed
  const handleQuizCompletion = async () => {
    if (quizCompleted) {
      try {
        const user = auth.currentUser;
        const userDocRef = doc(db, "users", user.uid); // Get user document reference

        // Check if the user already has a score
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          // User document exists, update score
          const currentScore = userDoc.data().score || 0; // If score field doesn't exist, set it to 0
          const updatedScore = currentScore + score; // Add the new score to the existing score
          await updateDoc(userDocRef, {
            score: updatedScore, // Update the score field
          });
        } else {
          // User document doesn't exist, create one with score
          await setDoc(userDocRef, {
            score: score, // Set the score field with current score
          });
        }

        console.log("Score updated successfully!");
      } catch (error) {
        console.error("Error updating score:", error);
      }
    }
  };

  // Call this function when the quiz is completed
  useEffect(() => {
    if (quizCompleted) {
      handleQuizCompletion();
    }
  }, [quizCompleted]); // Trigger only when quizCompleted changes

  // Get the background color for selected options
  const getOptionBgColor = (questionId, option) => {
    const selectedOption = selectedAnswers[questionId];
    const correctAnswer = questions.find(
      (q) => q.id === questionId
    )?.correct_answer;
    if (!selectedOption) return "#292C4D"; // Default background
    if (selectedOption === option) {
      return option === correctAnswer ? "#28a745" : "#dc3545"; // Green for correct, red for incorrect
    } else if (option === correctAnswer) {
      return "#28a745"; // Keep the correct answer highlighted in green even if not selected
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

      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color="#FFFFFF"
            style={styles.headerArrow}
          />
        </TouchableOpacity>
        {/* Display quiz title and current question count */}
        <Text style={styles.headerTitle}>
          {quizTitle} - {Object.keys(selectedAnswers).length + 1}/
          {questions.length}
        </Text>
      </View>

      {/* Question Section */}
      <FlatList
        data={questions} // Show all questions
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
            Your Total Points: {score} points
          </Text>

          {/* 'Go Home' Button */}
          <TouchableOpacity
            style={[styles.resultButton, styles.homeButton]}
            onPress={() => navigation.navigate("AllQuizzesScreen")}
          >
            <Text style={styles.resultButtonText}>Go Back</Text>
          </TouchableOpacity>

          {/* 'View Leaderboard' Button */}
          <TouchableOpacity
            style={[styles.resultButton, styles.leaderboardButton]}
            onPress={() => navigation.navigate("LeaderboardScreen")}
          >
            <Text style={styles.resultButtonText}>View Leaderboard</Text>
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
    padding: 30,
    backgroundColor: "#3D5CFF", // Primary color
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerArrow: {
    marginTop: 20,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    marginLeft: 10,
    marginTop: 15,
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
  resultButton: {
    padding: 15,
    borderRadius: 50,
    width: "80%", // Set the same width for both buttons
    marginTop: 10,
  },
  resultButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
  homeButton: {
    backgroundColor: "#3D5CFF", // Blue for 'Go Home' button
  },
  leaderboardButton: {
    backgroundColor: "#3D5CFF", // Green for 'View Leaderboard' button
  },
});

export default PlayQuizScreen;
