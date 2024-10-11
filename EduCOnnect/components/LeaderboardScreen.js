import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from "react-native";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import BottomNavBar from "./BottomNavBar";

// Leaderboard Screen Component
export default function LeaderboardScreen() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch leaderboard data from Firestore
  const fetchLeaderboardData = async () => {
    try {
      const q = query(collection(db, "users"), orderBy("score", "desc"));
      const querySnapshot = await getDocs(q);
      const leaderboard = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLeaderboardData(leaderboard);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3D5CFF" />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  // If no data is available
  if (!leaderboardData || leaderboardData.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Leader Board</Text>
      </View>

      {/* Display the top 3 users */}
      {leaderboardData.length > 0 && (
        <View style={styles.topThreeContainer}>
          {/* Second Place User (Left) */}
          {leaderboardData[1] && (
            <View style={styles.sideUserContainer}>
              <Image
                source={require("../assets/second.jpg")} // Second place icon
                style={styles.smallIconImage}
              />
              <Text style={styles.userName}>
                {leaderboardData[1]?.fullName || "Unnamed"}
              </Text>
              <Text style={styles.userScore}>
                {leaderboardData[1]?.score?.toString() || "0"} pts
              </Text>
            </View>
          )}

          {/* First Place User (Center) */}
          {leaderboardData[0] && (
            <View style={styles.centerUserContainer}>
              <Image
                source={require("../assets/first1.jpg")} // First place icon
                style={styles.largeIconImage}
              />
              <Text style={styles.userName}>
                {leaderboardData[0]?.fullName || "Unnamed"}
              </Text>
              <Text style={styles.userScore}>
                {leaderboardData[0]?.score?.toString() || "0"}
              </Text>
            </View>
          )}

          {/* Third Place User (Right) */}
          {leaderboardData[2] && (
            <View style={styles.sideUserContainer}>
              <Image
                source={require("../assets/third.jpg")} // Third place icon
                style={styles.smallIconImage}
              />
              <Text style={styles.userName}>
                {leaderboardData[2]?.fullName || "Unnamed"}
              </Text>
              <Text style={styles.userScore}>
                {leaderboardData[2]?.score?.toString() || "0"} pts
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Render remaining users */}
      <FlatList
        data={leaderboardData.slice(3)}
        keyExtractor={(item) => item.id || item.index?.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.leaderboardCard}>
            <Text style={styles.rankText}>{index + 4}</Text> {/* Ranking */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item?.fullName || "Unnamed"}</Text>
              <Text style={styles.userScore}>
                {item?.score?.toString() || "0"} points
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noDataText}>No data available</Text>
        }
      />
      <BottomNavBar />
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F39",
  },
  headerContainer: {
    backgroundColor: "#3D5CFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 5,
    paddingTop: 20,
  },
  header: {
    fontSize: 28,
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1F1F39",
  },
  loadingText: {
    marginTop: 10,
    color: "#FFFFFF",
    fontSize: 16,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1F1F39",
  },
  noDataText: {
    color: "#B0B0C3",
    fontSize: 16,
  },
  topThreeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end", // Align side users to bottom of center user
    marginBottom: 20,
    marginTop: 40,
  },
  sideUserContainer: {
    alignItems: "center",
  },
  centerUserContainer: {
    alignItems: "center",
    marginBottom: 20, // Push the first place user down to make them visually larger
  },
  largeIconImage: {
    width: 70, // Larger size for first place
    height: 70,
    marginBottom: 10,
  },
  smallIconImage: {
    width: 50, // Smaller size for second and third places
    height: 50,
    marginBottom: 10,
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  userScore: {
    color: "#FFD700", // Gold for top 3 users
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  leaderboardCard: {
    flexDirection: "row",
    backgroundColor: "#292C4D",
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    alignItems: "center",
  },
  rankText: {
    color: "#FFD700",
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
});
