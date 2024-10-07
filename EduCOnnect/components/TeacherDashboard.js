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
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import BottomNavBarTeacher from "./BottemNavBarTeacher";

const screenWidth = Dimensions.get("window").width;

export default function TeacherDashboard() {
  const [uploadProgress, setUploadProgress] = useState(0.7); // Set progress as a percentage
  const [uploadedLectures, setUploadedLectures] = useState([]); // State to hold uploaded lectures

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

  // Simulated function to fetch uploaded lectures
  const fetchUploadedLectures = () => {
    // This function should call your API or Firebase to get the uploaded lectures.
    const fetchedLectures = [
      { title: "SpringBoot BackEnd for Beginners", duration: "16 hours" },
      { title: "Product Design v1.0", duration: "16 hours" },
      { title: "Java Development", duration: "10 hours" },
      { title: "Visual Design", duration: "14 hours" },
    ]; // Replace this with actual data fetching
    setUploadedLectures(fetchedLectures);
  };

  useEffect(() => {
    fetchUploadedLectures(); // Fetch uploaded lectures on component mount
  }, []);

  const handleCancelUpload = () => {
    // Logic to cancel the upload goes here
    console.log("Upload canceled");
    // Reset progress or perform any other cleanup
    setUploadProgress(0);
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Analytics Section */}
        <View style={styles.analyticsSection}>
          <Text style={styles.analyticsTitle}>Analyze Your Views</Text>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsLabel}>Analytics</Text>
            <TouchableOpacity style={styles.saveReportButton}>
              <Text style={styles.saveReportText}>Save Report</Text>
            </TouchableOpacity>
            {/* Real Line Chart */}
            <View style={styles.chartContainer}>
              <LineChart
                data={data}
                width={screenWidth - 80} // Ensures padding on both sides
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

        {/* Your Lectures Section */}
        <LecturesSection lectures={uploadedLectures} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavBarTeacher />
    </View>
  );
}

// Uploading Section Component
const UploadingSection = ({ uploadProgress, onCancel }) => {
  const navigation = useNavigation(); // Initialize navigation

  const handleAddQuiz = () => {
    // Navigate to AddQuiz.js when the button is pressed
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

// Your Lectures Section Component
const LecturesSection = ({ lectures }) => (
  <View style={styles.lecturesSection}>
    <Text style={styles.sectionTitle}>Your Lectures</Text>
    {lectures.map((lecture, index) => (
      <LectureCard
        key={index}
        title={lecture.title}
        duration={lecture.duration}
      />
    ))}
  </View>
);

// Reusable Lecture Card
const LectureCard = ({ title, duration }) => (
  <View style={styles.lectureCard}>
    <View style={styles.lectureThumbnail} />
    <View style={styles.lectureDetails}>
      <Text style={styles.lectureTitle}>{title}</Text>
      <Text style={styles.lectureInfo}>{duration}</Text>
    </View>
  </View>
);

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
    alignItems: "center", // Center the chart
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
    backgroundColor: "#FF6B6B", // Same theme color as the progress bar
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
  lectureThumbnail: {
    width: 60,
    height: 60,
    backgroundColor: "#B0B0C3",
    borderRadius: 8,
    marginRight: 15,
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
});
