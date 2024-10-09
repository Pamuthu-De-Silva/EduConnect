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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3D5CFF" />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Leader Board</Text>
      </View>
      {leaderboardData.length > 0 && (
        <View style={styles.topThreeContainer}>
          {/* Top 3 Users Section */}
          {leaderboardData.slice(0, 3).map((user, index) => (
            <View key={user.id} style={styles.topUserContainer}>
              {/* Render crown only for the first user */}
              {index === 0 && (
                <Image
                  source={require("../assets/cown.png")} // Crown image
                  style={styles.crownImage}
                />
              )}
              {/* <Image
                source={require("../assets/default-avatar.png")} // Replace with actual avatar if available
                style={styles.userAvatar}
              /> */}
              <Text style={styles.userName}>{user.fullName}</Text>
              <Text style={styles.userScore}>{user.score} pts</Text>
            </View>
          ))}
        </View>
      )}

      {/* Render other users in the list */}
      <FlatList
        data={leaderboardData.slice(3)}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.leaderboardCard}>
            <Text style={styles.rankText}>{index + 4}</Text> {/* Ranking */}
            {/* <Image
              source={require("../assets/default-avatar.png")} // Add a default avatar or user's image here
              style={styles.userAvatar}
            /> */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.fullName}</Text>
              <Text style={styles.userScore}>{item.score} points</Text>
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
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    marginBottom: 20,
    textAlign: "center",
  },
  topThreeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    marginTop: 40,
  },
  topUserContainer: {
    alignItems: "center",
  },
  crownImage: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  userAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 5,
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
  noDataText: {
    color: "#B0B0C3",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});
