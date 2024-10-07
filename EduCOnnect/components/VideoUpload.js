import React, { useState, useEffect, useRef } from 'react';
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
  Platform
} from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Video } from 'expo-av';
import { db, storage, auth } from '../firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, query, onSnapshot, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import * as MediaLibrary from 'expo-media-library';
import { signInAnonymously } from 'firebase/auth';
import BottomNavBarTeacher from './BottemNavBarTeacher';

export default function TeacherHomePage() {
  const [lectureName, setLectureName] = useState('');
  const [lectureCategory, setLectureCategory] = useState('');
  const [lectureDescription, setLectureDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState(null);

  const videoPlayerRef = useRef(null);
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_700Bold });

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Permission to access media library is required to upload videos.');
        }
      }
    };

    requestPermissions();

    const anonymousSignIn = async () => {
      try {
        await signInAnonymously(auth);
        console.log('Signed in anonymously');
      } catch (error) {
        console.error('Anonymous sign-in failed:', error);
        Alert.alert('Authentication Error', 'Failed to authenticate. Please try again.');
      }
    };

    anonymousSignIn();

    // Firestore subscription to fetch uploaded videos by the current user
    const q = query(
      collection(db, 'lectures'),
      where('userId', '==', auth.currentUser.uid) // Filter by user ID
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const videos = [];
      querySnapshot.forEach((doc) => {
        videos.push({ id: doc.id, ...doc.data() });
      });
      setUploadedVideos(videos);
      setLoadingVideos(false); // Stop loading once videos are fetched
      console.log("Fetched Videos for User:", videos);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const selectedVideo = result.assets[0];
        setVideoFile(selectedVideo);
        Alert.alert('Success', `Video selected: ${selectedVideo.fileName || 'Unnamed Video'}`);
      } else {
        Alert.alert('Cancelled', 'Video selection was cancelled.');
      }
    } catch (error) {
      console.error('Error selecting video:', error);
      Alert.alert('Error', 'Failed to select video. Please try again.');
    }
  };

  const handleUploadVideo = async () => {
    if (!videoFile || !lectureName || !lectureCategory || !lectureDescription) {
      Alert.alert('Error', 'Please fill in all fields and select a video.');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const { uri, fileName } = videoFile;

      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRefPath = `lectures/${Date.now()}_${fileName}`;
      const storageRef = ref(storage, storageRefPath);

      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progressPercent);
        },
        (error) => {
          console.error('Upload error:', error);
          Alert.alert('Upload Error', error.message);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, 'lectures'), {
            name: lectureName,
            category: lectureCategory,
            description: lectureDescription,
            videoURL: downloadURL,
            userId: auth.currentUser.uid, // Save the user ID
          });

          setLectureName('');
          setLectureCategory('');
          setLectureDescription('');
          setVideoFile(null);
          setUploading(false);
          Alert.alert('Success', 'Video uploaded successfully!');
        }
      );
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert('Error', error.message);
      setUploading(false);
    }
  };

  // Handle Delete Video
  const handleDeleteVideo = async (video) => {
    try {
      // Delete video from Firebase Storage
      const storageRef = ref(storage, video.videoURL);
      await deleteObject(storageRef);

      // Delete video metadata from Firestore
      await deleteDoc(doc(db, 'lectures', video.id));

      Alert.alert('Success', 'Video deleted successfully!');
    } catch (error) {
      console.error('Error deleting video:', error);
      Alert.alert('Error', 'Failed to delete video.');
    }
  };

  // Handle Edit Video
  const handleEditVideo = (video) => {
    setVideoToEdit(video);
    setLectureName(video.name);
    setLectureCategory(video.category);
    setLectureDescription(video.description);
    setEditMode(true);
  };

  // Update existing video details in Firestore
  const handleUpdateVideo = async () => {
    if (!lectureName || !lectureCategory || !lectureDescription) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const videoRef = doc(db, 'lectures', videoToEdit.id);

      await updateDoc(videoRef, {
        name: lectureName,
        category: lectureCategory,
        description: lectureDescription,
      });

      setLectureName('');
      setLectureCategory('');
      setLectureDescription('');
      setEditMode(false);
      setVideoToEdit(null);
      Alert.alert('Success', 'Video details updated successfully!');
    } catch (error) {
      console.error('Error updating video:', error);
      Alert.alert('Error', 'Failed to update video.');
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

  if (loadingVideos) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3D5CFF" />
        <Text style={styles.loadingText}>Loading Videos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{editMode ? 'Edit Lecture' : 'Upload Lecture Video'}</Text>

        <TextInput
          style={styles.input}
          placeholder="Lecture Name"
          value={lectureName}
          onChangeText={setLectureName}
          placeholderTextColor="#B0B0C3"
        />

        <TextInput
          style={styles.input}
          placeholder="Lecture Category"
          value={lectureCategory}
          onChangeText={setLectureCategory}
          placeholderTextColor="#B0B0C3"
        />

        <TextInput
          style={styles.input}
          placeholder="Lecture Description"
          value={lectureDescription}
          onChangeText={setLectureDescription}
          placeholderTextColor="#B0B0C3"
        />

        {!editMode && (
          <TouchableOpacity onPress={handleSelectVideo} style={styles.button}>
            <Text style={styles.buttonText}>Select Video</Text>
          </TouchableOpacity>
        )}

        {videoFile && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewText}>Selected Video Preview:</Text>
            <Video
              ref={videoPlayerRef}
              source={{ uri: videoFile.uri }}
              style={styles.previewVideo}
              useNativeControls
              resizeMode="contain"
              isLooping
            />
          </View>
        )}

        {uploading ? (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.progressText}>Uploading: {Math.round(progress)}%</Text>
          </View>
        ) : editMode ? (
          <TouchableOpacity onPress={handleUpdateVideo} style={styles.button}>
            <Text style={styles.buttonText}>Update Video</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleUploadVideo} style={styles.button}>
            <Text style={styles.buttonText}>Upload Video</Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={uploadedVideos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.uploadedList}
          renderItem={({ item }) => (
            <View style={styles.uploadedVideoContainer}>
              <Text style={styles.videoTitle}>{item.name}</Text>
              <Text style={styles.videoDescription}>{item.description}</Text>
              <Video
                source={{ uri: item.videoURL }}
                style={styles.uploadedVideo}
                useNativeControls
                resizeMode="contain"
                isLooping
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={() => handleEditVideo(item)}
                  style={[styles.button, styles.editButton]}>
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteVideo(item)}
                  style={[styles.button, styles.deleteButton]}>
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyListText}>No videos uploaded yet.</Text>}
        />
      </ScrollView>

      <BottomNavBarTeacher style={styles.bottomNavBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F39',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1F1F39',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
  },
  title: {
    fontSize: 27,
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 20,
    marginTop: 30,
  },
  input: {
    backgroundColor: '#292C4D',
    color: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#3D5CFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
  },
  previewContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  previewText: {
    color: '#fff',
    marginBottom: 10,
    fontFamily: 'Poppins_400Regular',
  },
  previewVideo: {
    width: '100%',
    height: 200,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  progressText: {
    color: '#fff',
    marginLeft: 10,
    fontFamily: 'Poppins_400Regular',
  },
  uploadedList: {
    marginTop: 20,
  },
  uploadedVideoContainer: {
    backgroundColor: '#292C4D',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  videoTitle: {
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 5,
  },
  videoDescription: {
    color: '#B0B0C3',
    fontFamily: 'Poppins_400Regular',
    marginBottom: 10,
  },
  uploadedVideo: {
    width: '100%',
    height: 150,
  },
  emptyListText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    backgroundColor: '#FF9505',
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    flex: 1,
  },
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#292C4D',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
