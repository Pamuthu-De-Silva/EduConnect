import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import { db, storage } from "../firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import BottomNavBar from "./BottemNavBarTeacher"; // Importing BottomNavBar
import TeacherDashboard from "./TeacherDashboard"; 
import { useNavigation } from "@react-navigation/native";
export default function UploadVideoScreen({ route }) {
  const { courseId } = route.params; // Get courseId from params
  const [videoFiles, setVideoFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const screenWidth = Dimensions.get("window").width;
  const navigation = useNavigation();
  const handleSelectVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled) {
        const selectedVideos = result.assets;
        setVideoFiles([...videoFiles, ...selectedVideos]);
        Alert.alert("Success", "Videos selected!");
      } else {
        Alert.alert("Cancelled", "Video selection was cancelled.");
      }
    } catch (error) {
      console.error("Error selecting video:", error);
      Alert.alert("Error", "Failed to select videos. Please try again.");
    }
  };

  const handleUploadVideos = async () => {
    if (videoFiles.length === 0) {
      Alert.alert("Error", "Please select at least one video to upload.");
      return;
    }

    setUploading(true);
    let videoURLs = [];

    try {
      for (let i = 0; i < videoFiles.length; i++) {
        const video = videoFiles[i];
        const { uri } = video;

        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRefPath = `courses/${courseId}/videos/${Date.now()}_${
          video.filename || "video"
        }`;
        const storageRef = ref(storage, storageRefPath);

        const uploadTask = uploadBytesResumable(storageRef, blob);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progressPercent =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setProgress((prevProgress) => ({
                ...prevProgress,
                [video.uri]: progressPercent,
              }));
            },
            (error) => {
              console.error("Upload error:", error);
              Alert.alert("Upload Error", error.message);
              setUploading(false);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              videoURLs.push(downloadURL); // Add each URL to the array
              resolve();
            }
          );
        });
      }

      // Once all videos are uploaded, update Firestore with the complete array
      await updateDoc(doc(db, "courses", courseId), {
        videoURLs: videoURLs,
      });

      setUploading(false);
      Alert.alert("Success", "All videos uploaded successfully!");
      navigation.navigate("TeacherDashboard"); 
    } catch (error) {
      console.error("Error uploading videos:", error);
      Alert.alert("Error", error.message);
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Upload Lectures</Text>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity onPress={handleSelectVideo} style={styles.button}>
          <Text style={styles.buttonText}>Select Videos</Text>
        </TouchableOpacity>

        {videoFiles.length > 0 && (
          <FlatList
            data={videoFiles}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.uploadedVideoContainer}>
                <Text style={styles.videoTitle}>
                  {item.filename || "Selected Video"}
                </Text>
                <Video
                  source={{ uri: item.uri }}
                  style={[styles.uploadedVideo, { width: screenWidth - 40 }]}
                  useNativeControls
                  resizeMode="contain"
                />
                {uploading && (
                  <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>
                      {progress[item.uri]
                        ? `Uploading: ${Math.round(progress[item.uri])}%`
                        : "Waiting to upload..."}
                    </Text>
                  </View>
                )}
              </View>
            )}
          />
        )}

        {uploading && (
          <ActivityIndicator
            size="large"
            color="#3D5CFF"
            style={styles.loader}
          />
        )}

        <TouchableOpacity onPress={handleUploadVideos} style={styles.button}>
          <Text style={styles.buttonText}>
            {uploading ? "Uploading Videos..." : "Upload Videos"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavBar style={styles.navBar} />
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
    paddingBottom: 10,
    marginTop: 15,
    overflow: "visible",
    paddingTop: 8,
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 80,
    // Extra padding for bottom nav
  },
  title: {
    fontSize: 27,
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#3D5CFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
  },
  uploadedVideoContainer: {
    backgroundColor: "#292C4D",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  videoTitle: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    marginBottom: 10,
    fontSize: 16,
  },
  uploadedVideo: {
    height: 200,
    borderRadius: 10,
  },
  progressContainer: {
    marginVertical: 10,
    alignItems: "center",
  },
  progressText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  loader: {
    marginVertical: 20,
  },
  navBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
});
