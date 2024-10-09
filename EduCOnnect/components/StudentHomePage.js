import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import BottomNavBar from "./BottomNavBar";
import { StatusBar } from "expo-status-bar";
import { Video } from "expo-av";
import { db } from "../firebaseConfig";
import { collection, query, onSnapshot } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import Icon from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

const banners = [
  { id: 1, image: require("../assets/banner1.png") },
  { id: 2, image: require("../assets/banner2.jpg") },
  { id: 3, image: require("../assets/banner3.png") },
];

export default function StudentHomePage() {
  const scrollRef = useRef(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [courses, setCourses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [filteredCourses, setFilteredCourses] = useState([]); // State for filtered courses
  const navigation = useNavigation(); // Initialize navigation

  useEffect(() => {
    const scrollToNextBanner = () => {
      let nextIndex = currentBannerIndex + 1;
      if (nextIndex >= banners.length) nextIndex = 0;
      setCurrentBannerIndex(nextIndex);
      scrollRef.current?.scrollTo({
        x: nextIndex * width * 0.9,
        animated: true,
      });
    };

    const interval = setInterval(scrollToNextBanner, 3000);
    return () => clearInterval(interval);
  }, [currentBannerIndex]);

  // Fetch all courses
  const fetchCourses = () => {
    const q = query(collection(db, "courses")); // Fetch courses
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedCourses = [];
      querySnapshot.forEach((doc) => {
        fetchedCourses.push({ id: doc.id, ...doc.data() });
      });
      setCourses(fetchedCourses);
      setFilteredCourses(fetchedCourses); // Initially, filtered courses are the same as all courses
    });
    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchCourses();
    return () => unsubscribe();
  }, []);

  // Function to handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchCourses(); // Fetch the courses again
    setTimeout(() => {
      setRefreshing(false); // Set refreshing to false after data is reloaded
    }, 1000); // Simulate network delay
  };

  // Navigate to video play screen when student clicks a course
  const navigateToCourseDetails = (course) => {
    navigation.navigate("CourseDetailScreen", { course });
  };

  // Handle the search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredCourses(courses); // If search query is empty, show all courses
    } else {
      const filtered = courses.filter((course) =>
        course.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#3D5CFF" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
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
                value={searchQuery}
                onChangeText={handleSearch} // Update search query as user types
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

          {/* Banner inside header */}
          <View style={styles.bannerWrapper}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              ref={scrollRef}
              style={styles.bannerScroll}
            >
              {banners.map((banner) => (
                <View key={banner.id} style={styles.bannerContainer}>
                  <Image source={banner.image} style={styles.bannerImage} />
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        <TouchableOpacity
          style={styles.quizButton}
          onPress={() => navigation.navigate("StudyPlanerProgress")}
        >
          <Icon name="schedule" size={40} color="#fff" />
          <Text style={styles.quizTitle}>Study Planner</Text>
          <Text style={styles.quizSubtitle}>
            Study according to the study plan, make study more motivated
          </Text>
        </TouchableOpacity>

        {/* "Popular Courses" Section */}
        <View style={styles.roundedContainer}>
          <Text style={styles.sectionTitle}>Our most popular courses</Text>
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.lectureWrapper}
                onPress={() => navigateToCourseDetails(course)} // Navigate to the detail screen
              >
                {course.videoURLs && course.videoURLs.length > 0 ? (
                  <Video
                    source={{ uri: course.videoURLs[0] }} // Display first video as preview
                    style={styles.thumbnailImage}
                    useNativeControls={false}
                    resizeMode="cover"
                    isLooping={false}
                    shouldPlay={false}
                  />
                ) : (
                  <View style={styles.lectureThumbnailPlaceholder}>
                    <Text style={styles.thumbnailText}>No Preview</Text>
                  </View>
                )}
                <View style={styles.detailsContainer}>
                  <Text style={styles.courseTitle}>{course.name}</Text>
                  <Text style={styles.courseDescription}>
                    {course.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.placeholderText}>
              No courses found matching "{searchQuery}".
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F39",
  },
  headerContainer: {
    backgroundColor: "#3D5CFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 30,
    marginTop: 29,
    overflow: "visible",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
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
  bannerWrapper: {
    marginTop: 10,
    alignItems: "center",
  },
  bannerScroll: {
    width: width * 0.9,
    borderRadius: 20,
  },
  bannerContainer: {
    width: width * 0.9,
    height: 160,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  roundedContainer: {
    backgroundColor: "#2F2F42",
    borderRadius: 20,
    padding: 15,
    marginTop: 20,
    width: width * 0.9,
    overflow: "hidden",
    alignSelf: "center",
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
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 10,
  },
  lectureWrapper: {
    backgroundColor: "#3E3E55",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  thumbnailImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  detailsContainer: {
    flex: 1,
  },
  courseTitle: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
  },
  courseDescription: {
    color: "#B0B0C3",
    fontFamily: "Poppins_400Regular",
  },
  placeholderText: {
    color: "#B0B0C3",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
  },
});
