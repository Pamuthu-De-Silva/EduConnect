import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Video } from "expo-av";
import Icon from "react-native-vector-icons/MaterialIcons";
import BottomNavBar from "./BottomNavBar";

const { width } = Dimensions.get("window");

export default function CourseDetailScreen({ route }) {
  const { course } = route.params;
  const [playingIndex, setPlayingIndex] = useState(0); // Track which video is playing
  const videoPlayerRef = useRef(null); // Reference for the video player

  // Ensure that course.videoURLs exists and is an array
  const videoURLs =
    course.videoURLs && Array.isArray(course.videoURLs) ? course.videoURLs : [];

  // Ensure course.lessons exists and matches videoURLs
  const lessons =
    course.lessons && course.lessons.length === videoURLs.length
      ? course.lessons
      : [];

  // Automatically play the next video after the current one finishes
  const handleVideoEnd = () => {
    if (playingIndex < videoURLs.length - 1) {
      setPlayingIndex(playingIndex + 1);
    }
  };

  const handlePlayPause = (index) => {
    setPlayingIndex(index); // Switch to the selected video
    videoPlayerRef.current.playAsync(); // Play the selected video
  };

  const renderLessonItem = ({ item, index }) => (
    <View style={styles.lessonContainer}>
      {/* Icon and video playback controls */}
      <TouchableOpacity
        onPress={() => handlePlayPause(index)}
        style={styles.playPauseButton}
      >
        <Icon
          name={
            playingIndex === index
              ? "pause-circle-filled"
              : "play-circle-filled"
          }
          size={40}
          color="#3D5CFF"
        />
      </TouchableOpacity>

      {/* Lesson details */}
      <View style={styles.lessonDetails}>
        <Text style={styles.lessonTitle}>
          Lesson {index + 1}: {lessons[index]?.title || "Untitled"}
        </Text>
        <Text style={styles.lessonDuration}>
          {lessons[index]?.duration || "Unknown Duration"}
        </Text>
      </View>

      {/* Lock icon (if the lesson is locked, you can modify this condition) */}
      {index > 0 && (
        <TouchableOpacity>
          <Icon name="lock" size={30} color="#6C6C8C" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Scrollable content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Video Player */}
        <View style={styles.videoContainer}>
          {videoURLs.length > 0 ? (
            <Video
              ref={videoPlayerRef}
              source={{ uri: videoURLs[playingIndex] }} // Play the current video
              style={styles.videoPlayer}
              useNativeControls
              resizeMode="contain"
              shouldPlay
              onPlaybackStatusUpdate={(status) => {
                if (status.didJustFinish) {
                  handleVideoEnd(); // Automatically play the next video
                }
              }}
            />
          ) : (
            <View style={styles.noVideoContainer}>
              <Text style={styles.noVideoText}>
                No videos available for this course
              </Text>
            </View>
          )}

          {/* Course Info */}
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle}>{course.name}</Text>
            <Text style={styles.courseDescription}>{course.description}</Text>
            <View style={styles.courseStats}>
              <Text style={styles.courseDuration}>
                {lessons[playingIndex]?.duration || "Unknown Duration"}
              </Text>
              <Text style={styles.courseLessons}>
                {videoURLs.length} Lessons
              </Text>
            </View>
          </View>
        </View>

        {/* Lessons List */}
        {videoURLs.length > 0 ? (
          <FlatList
            data={videoURLs}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderLessonItem}
            contentContainerStyle={styles.lessonList}
          />
        ) : (
          <Text style={styles.noLessonsText}>No lessons available</Text>
        )}
      </ScrollView>

      {/* Static Bottom Bar */}
      <View style={styles.footerButtons}>
        <TouchableOpacity style={styles.favoriteButton}>
          <Icon name="star" size={30} color="#FF6B6B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.downloadButton}>
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation Bar */}
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F39",
  },
  scrollContent: {
    paddingBottom: 180, // Increased padding to avoid overlap with footer and nav bar
  },
  videoContainer: {
    backgroundColor: "#000",
  },
  videoPlayer: {
    width: "100%",
    height: 200,
  },
  noVideoContainer: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#292C4D",
  },
  noVideoText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  courseInfo: {
    padding: 20,
    backgroundColor: "#2F2F42",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom:-10
  },
  courseTitle: {
    fontSize: 22,
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    marginBottom: 5,
  },
  courseDescription: {
    color: "#B0B0C3",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    marginBottom: 10,
  },
  courseStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  courseDuration: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
  courseLessons: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
  lessonList: {
    padding: 20,
  },
  lessonContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#292C4D",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  playPauseButton: {
    marginRight: 15,
  },
  lessonDetails: {
    flex: 1,
  },
  lessonTitle: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  lessonDuration: {
    color: "#B0B0C3",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  noLessonsText: {
    color: "#B0B0C3",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    padding: 20,
    textAlign: "center",
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#1F1F39",
    position: "absolute",
    bottom: 70, // Adjusted to sit above the BottomNavBar
    width: "100%",
    zIndex: 2, 
    marginBottom:10// Ensures the footer stays above BottomNavBar
  },
  favoriteButton: {
    backgroundColor: "#292C4D",
    padding: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadButton: {
    backgroundColor: "#3D5CFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginLeft: 20,
  },
  downloadButtonText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
  },
});
