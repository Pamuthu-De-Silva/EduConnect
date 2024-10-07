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
} from "firebase/firestore";
import BottomNavBarTeacher from "./BottemNavBarTeacher";
import { WebView } from "react-native-webview"; // Import WebView

export default function PdfUploadPage() {
  const [pdfName, setPdfName] = useState("");
  const [pdfCategory, setPdfCategory] = useState("");
  const [pdfDescription, setPdfDescription] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadedPdfs, setUploadedPdfs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingPdfs, setLoadingPdfs] = useState(true);

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
    try {
      const storageRef = ref(storage, pdfURL);
      await deleteObject(storageRef);
      await deleteDoc(doc(db, "pdfs", id));
      Alert.alert("Deleted", "File deleted successfully.");
    } catch (error) {
      Alert.alert("Error", "Failed to delete file.");
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
            <Text style={styles.buttonText}>Upload File</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.buttonText}>Uploaded Documents</Text>
        <FlatList
          data={uploadedPdfs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.uploadedList}
          renderItem={({ item }) => (
            <View style={styles.uploadedPdfContainer}>
              <View style={styles.previewContainer}>
                {/* Display PDF preview in WebView */}
                <WebView
                  source={{ uri: item.pdfURL }}
                  style={styles.webViewPdf}
                />
              </View>
              <View style={styles.fileDetails}>
                <Text style={styles.pdfTitle}>{item.name}</Text>
                <Text style={styles.pdfDescription}>{item.description}</Text>
                <Text style={styles.uploadedDate}>
                  Uploaded on {item.uploadDate}
                </Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => Linking.openURL(item.pdfURL)}
                  >
                    <Text style={styles.buttonText}>View PDF</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeletePdf(item.id, item.pdfURL)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>No files uploaded yet.</Text>
          }
        />
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
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressText: {
    color: "#fff",
    marginLeft: 10,
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
  uploadedDate: {
    color: "#B0B0C3",
    fontFamily: "Poppins_400Regular",
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  viewButton: {
    backgroundColor: "#3D5CFF",
    padding: 10,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: "#FF3D71",
    padding: 10,
    borderRadius: 5,
  },
  emptyListText: {
    color: "#fff",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginTop: 20,
  },
  bottomNavBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
});
