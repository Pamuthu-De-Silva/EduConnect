import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  ProgressBarAndroid,
  Alert,
  Modal,
  RefreshControl, // Import RefreshControl
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Video } from "expo-av";
import BottomNavBarTeacher from "./BottemNavBarTeacher";
import MaterialIcons from "react-native-vector-icons/MaterialIcons"; // Icons for modify and delete

const screenWidth = Dimensions.get("window").width;

export default function TeacherDashboard() {
  const [uploadProgress, setUploadProgress] = useState(0.7); // Set progress as a percentage
  const [courses, setCourses] = useState([]); // State to hold fetched courses
  const [modalVisible, setModalVisible] = useState(false); // For editing popup
  const [selectedCourse, setSelectedCourse] = useState(null); // To hold selected course for modification
  const [courseName, setCourseName] = useState(""); // Edit course name
  const [courseDescription, setCourseDescription] = useState(""); // Edit course description
  const [courseCategory, setCourseCategory] = useState(""); // Edit course category
  const [refreshing, setRefreshing] = useState(false); // State for refresh control
  const navigation = useNavigation();

  // Data for the Line Chart (you can customize it with real data)
  const data = {
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Today"],
    datasets: [
      {
        data: [10, 20, 35, 50, 25, 60],
        strokeWidth: 2, // Optional
      },
    ],
  };

  // Fetch courses from Firestore
  const fetchCourses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      const fetchedCourses = [];
      querySnapshot.forEach((doc) => {
        fetchedCourses.push({ id: doc.id, ...doc.data() });
      });
      setCourses(fetchedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      Alert.alert("Error", "Failed to load courses.");
    }
  };

  // Fetch courses and handle refresh state
  const handleRefresh = async () => {
    setRefreshing(true); // Show refresh indicator
    await fetchCourses(); // Reload data
    setRefreshing(false); // Hide refresh indicator
  };

  useEffect(() => {
    fetchCourses(); // Fetch uploaded courses on component mount
  }, []);

  const handleCancelUpload = () => {
    console.log("Upload canceled");
    setUploadProgress(0);
  };

  const handleModifyCourse = (course) => {
    setSelectedCourse(course);
    setCourseName(course.name);
    setCourseDescription(course.description);
    setCourseCategory(course.category);
    setModalVisible(true);
  };

  const handleUpdateCourse = async () => {
    if (!courseName || !courseDescription || !courseCategory) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const courseRef = doc(db, "courses", selectedCourse.id);
      await updateDoc(courseRef, {
        name: courseName,
        description: courseDescription,
        category: courseCategory,
      });
      Alert.alert("Success", "Course details updated successfully!");
      setModalVisible(false);
      fetchCourses(); // Refresh the courses list
    } catch (error) {
      console.error("Error updating course:", error);
      Alert.alert("Error", "Failed to update course details.");
    }
  };

  const handleDeleteCourse = (course) => {
    Alert.alert(
      "Delete Confirmation",
      `Are you sure you want to delete the course: ${course.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "courses", course.id));
              Alert.alert("Success", "Course deleted successfully!");
              fetchCourses(); // Refresh the list after deletion
            } catch (error) {
              console.error("Error deleting course:", error);
              Alert.alert("Error", "Failed to delete the course.");
            }
          },
        },
      ]
    );
  };

  const navigateToUploadScreen = (courseId) => {
    navigation.navigate("UploadVideoScreen", { courseId });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#3D5CFF" />

      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.topBar}>
          <Image
            style={styles.iconButton}
            source={require("../assets/bell_icon.png")}
          />
          <View style={styles.searchContainer}>
            <Image
              style={styles.searchIcon}
              source={require("../assets/search.png")}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Find Course"
              placeholderTextColor="#B0B0C3"
            />
            <Image
              style={styles.filterIcon}
              source={require("../assets/filter.png")}
            />
          </View>
          <Image
            style={styles.iconButton}
            source={require("../assets/hamburger_icon.png")}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        } // Add refresh control
      >
        {/* Analytics Section */}
        <View style={styles.analyticsSection}>
          <Text style={styles.analyticsTitle}>Analyze Your Views</Text>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsLabel}>Analytics</Text>
            <TouchableOpacity style={styles.saveReportButton}>
              <Text style={styles.saveReportText}>Save Report</Text>
            </TouchableOpacity>
            <View style={styles.chartContainer}>
              <LineChart
                data={data} // Correct reference to 'data'
                width={screenWidth - 80}
                height={220}
                yAxisLabel=""
                chartConfig={{
                  backgroundColor: "#3D5CFF",
                  backgroundGradientFrom: "#1F1F39",
                  backgroundGradientTo: "#3D5CFF",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) =>
                    `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#FF6B6B",
                  },
                }}
                bezier
                style={{
                  marginVertical: 20,
                  borderRadius: 16,
                }}
              />
            </View>
          </View>
        </View>

        {/* Uploading Videos Section */}
        <UploadingSection
          uploadProgress={uploadProgress}
          onCancel={handleCancelUpload}
        />

        {/* Your Courses Section */}
        <View style={styles.lecturesSection}>
          <Text style={styles.sectionTitle}>Your Courses</Text>
          {courses.length > 0 ? (
            courses.map((course) => (
              <View key={course.id} style={styles.lectureCard}>
                {/* Video Preview - Add navigation to UploadVideoScreen */}
                <TouchableOpacity
                  onPress={() => navigateToUploadScreen(course.id)}
                >
                  {course.videoURLs && course.videoURLs.length > 0 ? (
                    <Video
                      source={{ uri: course.videoURLs[0] }} // Display first video as preview
                      style={styles.lectureThumbnail}
                      useNativeControls={false}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.lectureThumbnailPlaceholder}>
                      <Text style={styles.thumbnailText}>No Preview</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Course Details */}
                <View style={styles.lectureDetails}>
                  <Text style={styles.lectureTitle}>{course.name}</Text>
                  <Text style={styles.lectureInfo}>{course.category}</Text>
                </View>

                {/* Icons for Edit and Delete */}
                <View style={styles.iconContainer}>
                  <TouchableOpacity
                    onPress={() => handleModifyCourse(course)}
                    style={styles.iconButton}
                  >
                    <MaterialIcons name="edit" size={24} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteCourse(course)}
                    style={styles.iconButton}
                  >
                    <MaterialIcons name="delete" size={24} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noCoursesText}>No courses available.</Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavBarTeacher />

      {/* Edit Course Modal */}
      {selectedCourse && (
        <Modal animationType="slide" transparent={true} visible={modalVisible}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Course</Text>

              <TextInput
                style={styles.input}
                placeholder="Course Name"
                value={courseName}
                onChangeText={setCourseName}
                placeholderTextColor="#B0B0C3"
              />

              <TextInput
                style={styles.input}
                placeholder="Course Description"
                value={courseDescription}
                onChangeText={setCourseDescription}
                placeholderTextColor="#B0B0C3"
              />

              <TextInput
                style={styles.input}
                placeholder="Course Category"
                value={courseCategory}
                onChangeText={setCourseCategory}
                placeholderTextColor="#B0B0C3"
              />

              <TouchableOpacity
                onPress={handleUpdateCourse}
                style={styles.updateButton}
              >
                <Text style={styles.updateButtonText}>Update Course</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

// Uploading Section Component
const UploadingSection = ({ uploadProgress, onCancel }) => {
  const navigation = useNavigation(); // Initialize navigation

  const handleAddQuiz = () => {
    navigation.navigate("AllQuizzesScreenTeacher");
  };

  return (
    <View style={styles.uploadingSection}>
      <Text style={styles.sectionTitle}>Uploading Videos (1)</Text>
      <View style={styles.uploadContainer}>
        <View style={styles.uploadTextContainer}>
          <Text style={styles.uploadTitle}>
            SpringBoot BackEnd for Beginners
          </Text>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.progressText}>
          {Math.round(uploadProgress * 100)}%
        </Text>
        <ProgressBarAndroid
          styleAttr="Horizontal"
          indeterminate={false}
          progress={uploadProgress}
          color="#FF6B6B"
        />
      </View>

      {/* Add Quiz Button */}
      <TouchableOpacity style={styles.addQuizButton} onPress={handleAddQuiz}>
        <Text style={styles.addQuizButtonText}>Add Quiz</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F39",
  },
  headerContainer: {
    backgroundColor: "#3D5CFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 10,
    marginTop: 29,
    overflow: "visible",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  iconButton: {
    width: 24,
    height: 24,
  },
  searchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#3E3E55",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 10,
  },
  searchIcon: {
    width: 20,
    height: 20,
  },
  searchInput: {
    color: "#B0B0C3",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    flex: 1,
    marginLeft: 10,
  },
  filterIcon: {
    width: 20,
    height: 20,
  },
  analyticsSection: {
    padding: 20,
  },
  analyticsTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 10,
  },
  analyticsCard: {
    backgroundColor: "#3E3E55",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  analyticsLabel: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },
  saveReportButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#E0E0E0",
    padding: 8,
    borderRadius: 8,
  },
  saveReportText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: "#3D5CFF",
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  uploadingSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 10,
  },
  uploadContainer: {
    backgroundColor: "#3E3E55",
    borderRadius: 10,
    padding: 15,
  },
  uploadTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  uploadTitle: {
    color: "#fff",
    fontFamily: "Poppins_500Medium",
  },
  cancelText: {
    color: "#FF6B6B",
    fontFamily: "Poppins_400Regular",
  },
  progressText: {
    color: "#FF6B6B",
    marginTop: 5,
  },
  addQuizButton: {
    backgroundColor: "#FF6B6B",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  addQuizButtonText: {
    color: "#FFF",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
  },
  lecturesSection: {
    padding: 20,
  },
  lectureCard: {
    backgroundColor: "#3E3E55",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  lectureDetails: {
    flex: 1,
  },
  lectureTitle: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
  },
  lectureInfo: {
    color: "#B0B0C3",
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
  },
  lectureThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  lectureThumbnailPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: "#B0B0C3",
    borderRadius: 8,
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailText: {
    color: "#fff",
    fontSize: 10,
  },
  iconContainer: {
    flexDirection: "row",
  },
  noCoursesText: {
    color: "#B0B0C3",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#3E3E55",
    padding: 10,
    borderRadius: 8,
    color: "#fff",
    marginBottom: 10,
  },
  updateButton: {
    backgroundColor: "#3D5CFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
  },
  cancelButton: {
    backgroundColor: "#FF6B6B",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
  },
});
