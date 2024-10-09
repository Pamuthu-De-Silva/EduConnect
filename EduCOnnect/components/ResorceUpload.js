import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Linking,
  Modal,
} from "react-native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { db, storage, auth } from "../firebaseConfig";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import BottomNavBarTeacher from "./BottemNavBarTeacher";
import { WebView } from "react-native-webview";
import { FontAwesome, Ionicons } from "@expo/vector-icons"; // Icons
import Feather from "react-native-vector-icons/Feather";

export default function PdfUploadPage() {
  const [pdfName, setPdfName] = useState("");
  const [pdfCategory, setPdfCategory] = useState("");
  const [pdfDescription, setPdfDescription] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadedPdfs, setUploadedPdfs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingPdfs, setLoadingPdfs] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editPdfData, setEditPdfData] = useState(null);

  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_700Bold });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "pdfs"), (querySnapshot) => {
      const pdfs = [];
      querySnapshot.forEach((doc) => {
        pdfs.push({ id: doc.id, ...doc.data() });
      });
      setUploadedPdfs(pdfs);
      setLoadingPdfs(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: false,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        setPdfFile(file);
        Alert.alert("Success", `PDF selected: ${file.name}`);
      } else {
        Alert.alert("Cancelled", "File selection was cancelled.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select file. Please try again.");
    }
  };

  const handleUploadPdf = async () => {
    if (!pdfFile || !pdfName || !pdfCategory || !pdfDescription) {
      Alert.alert("Error", "Please fill in all fields and select a file.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const { uri, name } = pdfFile;
      const fileUri = FileSystem.cacheDirectory + name;

      await FileSystem.copyAsync({
        from: uri,
        to: fileUri,
      });

      const response = await fetch(fileUri);
      const blob = await response.blob();

      const storageRefPath = `pdfs/${Date.now()}_${name}`;
      const storageRef = ref(storage, storageRefPath);

      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progressPercent =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progressPercent);
        },
        (error) => {
          Alert.alert("Upload Error", error.message);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, "pdfs"), {
            name: pdfName,
            category: pdfCategory,
            description: pdfDescription,
            pdfURL: downloadURL,
            userId: auth.currentUser.uid,
          });

          setPdfName("");
          setPdfCategory("");
          setPdfDescription("");
          setPdfFile(null);
          setUploading(false);
          Alert.alert("Success", "File uploaded successfully!");
        }
      );
    } catch (error) {
      Alert.alert("Error", error.message);
      setUploading(false);
    }
  };

  const handleDeletePdf = async (id, pdfURL) => {
    Alert.alert(
      "Delete Confirmation",
      "Are you sure you want to delete this file?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const storageRef = ref(storage, pdfURL);
              await deleteObject(storageRef);
              await deleteDoc(doc(db, "pdfs", id));
              Alert.alert("Deleted", "File deleted successfully.");
            } catch (error) {
              Alert.alert("Error", "Failed to delete file.");
            }
          },
        },
      ]
    );
  };

  const handleEditPdf = (pdf) => {
    setEditPdfData(pdf);
    setModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editPdfData) return;

    try {
      const pdfDocRef = doc(db, "pdfs", editPdfData.id);
      await updateDoc(pdfDocRef, {
        name: editPdfData.name,
        category: editPdfData.category,
        description: editPdfData.description,
      });
      setModalVisible(false);
      Alert.alert("Success", "PDF details updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update PDF details.");
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

  if (loadingPdfs) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3D5CFF" />
        <Text style={styles.loadingText}>Loading Files...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Upload Lecture File</Text>

        <TextInput
          style={styles.input}
          placeholder="File Name"
          value={pdfName}
          onChangeText={setPdfName}
          placeholderTextColor="#B0B0C3"
        />

        <TextInput
          style={styles.input}
          placeholder="File Category"
          value={pdfCategory}
          onChangeText={setPdfCategory}
          placeholderTextColor="#B0B0C3"
        />

        <TextInput
          style={styles.input}
          placeholder="File Description"
          value={pdfDescription}
          onChangeText={setPdfDescription}
          placeholderTextColor="#B0B0C3"
        />

        <TouchableOpacity onPress={handleSelectFile} style={styles.button}>
          <Ionicons name="document-attach" size={24} color="white" />
          <Text style={styles.buttonText}>Select File</Text>
        </TouchableOpacity>

        {uploading ? (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.progressText}>
              Uploading: {Math.round(progress)}%
            </Text>
          </View>
        ) : (
          <TouchableOpacity onPress={handleUploadPdf} style={styles.button}>
            <FontAwesome name="upload" size={24} color="white" />
            <Text style={styles.buttonText}>Upload File</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.uploadedDocuments}>Uploaded Documents</Text>
        <FlatList
          data={uploadedPdfs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.uploadedList}
          renderItem={({ item }) => (
            <View style={styles.uploadedPdfContainer}>
              {/* PDF Preview */}
              <TouchableOpacity
                style={styles.previewContainer}
                onPress={() => Linking.openURL(item.pdfURL)} // Opens PDF on clicking preview
              >
                <WebView
                  source={{ uri: item.pdfURL }}
                  style={styles.webViewPdf}
                />
              </TouchableOpacity>

              <View style={styles.fileDetails}>
                <Text style={styles.pdfTitle}>{item.name}</Text>
                <Text style={styles.pdfDescription}>{item.description}</Text>

                <View style={styles.iconRow}>
                  <Feather
                    name="edit"
                    size={24}
                    color="#FFF"
                    style={{ marginRight: 10 }}
                    onPress={() => handleEditPdf(item)}
                  />
                  <Ionicons
                    name="trash-outline"
                    size={24}
                    color="red"
                    onPress={() => handleDeletePdf(item.id, item.pdfURL)} // Delete functionality
                  />
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>No files uploaded yet.</Text>
          }
        />

        {/* Modal for Editing PDF details */}
        {editPdfData && (
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit PDF Details</Text>

                <TextInput
                  style={styles.modalInput}
                  placeholder="File Name"
                  value={editPdfData.name}
                  onChangeText={(text) =>
                    setEditPdfData({ ...editPdfData, name: text })
                  }
                />

                <TextInput
                  style={styles.modalInput}
                  placeholder="File Category"
                  value={editPdfData.category}
                  onChangeText={(text) =>
                    setEditPdfData({ ...editPdfData, category: text })
                  }
                />

                <TextInput
                  style={styles.modalInput}
                  placeholder="File Description"
                  value={editPdfData.description}
                  onChangeText={(text) =>
                    setEditPdfData({ ...editPdfData, description: text })
                  }
                />

                <TouchableOpacity
                  onPress={handleSaveEdit}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>

      <BottomNavBarTeacher style={styles.bottomNavBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F39",
    marginTop: 20,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#1F1F39",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
  },
  title: {
    fontSize: 27,
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    marginTop: 20,
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
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    marginLeft: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressText: {
    color: "#fff",
    marginLeft: 10,
  },
  uploadedDocuments: {
    fontSize: 22,
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    marginVertical: 20,
  },
  uploadedList: {
    marginTop: 20,
  },
  uploadedPdfContainer: {
    backgroundColor: "#292C4D",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: "row",
  },
  previewContainer: {
    width: 80,
    height: 100,
    marginRight: 10,
  },
  webViewPdf: {
    width: "100%",
    height: "100%",
  },
  fileDetails: {
    flex: 1,
  },
  pdfTitle: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
  },
  pdfDescription: {
    color: "#B0B0C3",
    fontFamily: "Poppins_400Regular",
    marginTop: 5,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    
  },
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
  modalInput: {
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    width: "100%", // Make all inputs the same width
  },
  bottomNavBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
});
