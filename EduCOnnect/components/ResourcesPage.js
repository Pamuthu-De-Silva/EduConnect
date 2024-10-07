import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import BottomNavBarTeacher from "./BottemNavBarTeacher"; // Assuming you have a custom bottom nav component
import Icon from "react-native-vector-icons/MaterialIcons"; // For the quiz icon

export default function ResourcesPage({ navigation }) {
  const [pdfs, setPdfs] = useState([]);

  useEffect(() => {
    // Fetching PDFs from Firestore collection
    const unsubscribe = onSnapshot(collection(db, "pdfs"), (snapshot) => {
      const fetchedPdfs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPdfs(fetchedPdfs);
    });

    return () => unsubscribe(); // Clean up subscription on unmount
  }, []);

  const renderPdfCard = ({ item }) => (
    <View style={styles.card}>
      {/* PDF Preview Image */}
      <Image
        source={{
          uri: item.coverURL || "https://via.placeholder.com/80x120.png",
        }} // Default placeholder if coverURL is not available
        style={styles.coverImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.author}>By {item.author || "Unknown Author"}</Text>
        <Text style={styles.price}>${item.price || "Free"}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.grabButton}>
            <Text style={styles.buttonText}>Grab Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.learnMoreButton}>
            <Text style={styles.buttonText}>Learn More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Resources</Text>
        </View>
        <Text style={styles.sectionTitle}>Quiz Section</Text>
        <TouchableOpacity
          style={styles.quizButton}
          onPress={() => navigation.navigate("AllQuizzesScreen")} // Navigating to PlayQuizScreen
        >
          <Icon name="quiz" size={40} color="#fff" />
          <Text style={styles.quizTitle}>Attempt Quizzes</Text>
          <Text style={styles.quizSubtitle}>
            Ready to test your knowledge? Click here to begin!
          </Text>
        </TouchableOpacity>

        {/* Related PDFs Section */}
        <Text style={styles.sectionTitle}>Related to your topic</Text>
        <FlatList
          data={pdfs.slice(0, 1)} // Showing 1 PDF for the "Related" section, adjust as needed
          keyExtractor={(item) => item.id}
          renderItem={renderPdfCard}
          contentContainerStyle={styles.pdfList}
        />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavBarTeacher />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F39",
  },
  header: {
    fontSize: 28,
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    marginVertical: 20,
    marginTop: 20,
  },
  headerContainer: {
    backgroundColor: "#3D5CFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 15,
    marginTop: 20,
    overflow: "visible",
    paddingTop: 15,
  },
  pdfList: {
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: "row", // Aligns image and content side by side
    backgroundColor: "#292C4D",
    borderRadius: 10,
    marginVertical: 10,
    padding: 15,
    alignItems: "flex-start", // Align the content at the start of the container
  },
  coverImage: {
    width: 80, // Adjust the preview size
    height: 120,
    borderRadius: 10,
    marginRight: 15, // Adds spacing between the image and content
    backgroundColor: "#E0E0E0", // Placeholder background color in case of slow loading
  },
  cardContent: {
    flex: 1, // Makes the content take up the rest of the space
  },
  title: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "Poppins_700Bold",
  },
  author: {
    fontSize: 14,
    color: "#B0B0C3",
    marginVertical: 5,
  },
  price: {
    fontSize: 16,
    color: "#FFD700",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  grabButton: {
    backgroundColor: "#FF3D71",
    borderRadius: 5,
    padding: 10,
  },
  learnMoreButton: {
    backgroundColor: "#3D5CFF",
    borderRadius: 5,
    padding: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 22,
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    marginHorizontal: 20,
    marginTop: 30,
  },
  quizButton: {
    backgroundColor: "#1D2747",
    height: 150,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#6699FF",
  },
  quizTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    marginTop: 10,
  },
  quizSubtitle: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
    marginHorizontal: 20,
  },
});
