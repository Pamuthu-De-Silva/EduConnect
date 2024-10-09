import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Modal,
  Button,
} from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import * as FileSystem from "expo-file-system"; // For file downloads
import { db } from "../firebaseConfig";
import BottomNavBarTeacher from "./BottomNavBar";
import Icon from "react-native-vector-icons/MaterialIcons"; // For the quiz icon
import { useNavigation } from "@react-navigation/native";
export default function ResourcesPage({ navigation }) {
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null); // For details popup
  const [modalVisible, setModalVisible] = useState(false); // Controls the modal visibility

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

  const downloadPdf = async (url, name) => {
    try {
      const fileUri = FileSystem.documentDirectory + name + ".pdf"; // File destination
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri
      );

      const { uri } = await downloadResumable.downloadAsync();
      console.log("Finished downloading to ", uri);
      alert("Download completed! File saved to: " + uri);
    } catch (e) {
      console.error(e);
      alert("Download failed.");
    }
  };

  const openDetailsModal = (pdf) => {
    setSelectedPdf(pdf); // Set the selected PDF data
    setModalVisible(true); // Open the modal
  };

  const renderPdfCard = ({ item }) => (
    <View style={styles.card}>
      {/* PDF Preview Image */}
      <Image
        source={
          item.coverURL ? { uri: item.coverURL } : require("../assets/pdf.png")
        } // Use require() for local image
        style={styles.coverImage}
        resizeMode="contain" // Ensures the image scales properly within the frame
      />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.author}>By {item.author || "Unknown Author"}</Text>
        <Text style={styles.price}>${item.price || "Free"}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => downloadPdf(item.pdfURL, item.name)} // Handle file download
          >
            <Text style={styles.buttonText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => openDetailsModal(item)} // Open the modal with PDF details
          >
            <Text style={styles.buttonText}>Details</Text>
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
          data={pdfs} // Now showing all PDFs
          keyExtractor={(item) => item.id}
          renderItem={renderPdfCard}
          contentContainerStyle={styles.pdfList}
        />
      </ScrollView>

      {/* Modal for PDF details */}
      {selectedPdf && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)} // Close modal on request
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedPdf.name}</Text>
              <Text style={styles.modalAuthor}>
                Author: {selectedPdf.author || "Unknown Author"}
              </Text>
              <Text style={styles.modalDescription}>
                Description:{" "}
                {selectedPdf.description || "No description available"}
              </Text>
              <Text style={styles.modalPrice}>
                Price: ${selectedPdf.price || "Free"}
              </Text>

              {/* Custom Close Button */}
              <TouchableOpacity
                style={styles.closeButton} // Custom styling
                onPress={() => setModalVisible(false)} // Close modal
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

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
    alignItems: "center", // Centers content vertically
  },
  coverImage: {
    flex: 1, // Makes the image take available space
    aspectRatio: 1, // Ensures the image maintains its aspect ratio
    borderRadius: 10,
    marginRight: 15,
  },
  cardContent: {
    flex: 2, // Allow the content to take up more space than the image
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
    justifyContent: "flex-end",
  },
  downloadButton: {
    backgroundColor: "#FF3D71",
    borderRadius: 5,
    padding: 10,
  },
  detailsButton: {
    backgroundColor: "#3D5CFF",
    borderRadius: 5,
    padding: 10,
    marginLeft: 5,
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
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalAuthor: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 10,
  },
  modalPrice: {
    fontSize: 16,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#3D5CFF", // Custom background color for the button
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    width: "100%", // Make it full-width
    alignItems: "center", // Center the text
  },
  closeButtonText: {
    color: "#fff", // Text color
    fontSize: 16,
    fontWeight: "bold",
  },
});
