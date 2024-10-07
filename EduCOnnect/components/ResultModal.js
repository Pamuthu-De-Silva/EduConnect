import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const ResultModal = ({
  isModalVisible,
  correctCount,
  incorrectCount,
  totalCount,
  handleOnClose,
  handleRetry,
  handleHome,
}) => {
  return (
    <Modal
      animationType={"slide"}
      transparent={true}
      visible={isModalVisible}
      onRequestClose={handleOnClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#00000090", // Semi-transparent black background
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "#FFFFFF", // White modal background
            width: "90%",
            borderRadius: 5,
            padding: 40,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 28, color: "#000000" }}>Results</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ alignItems: "center", padding: 20 }}>
              <Text style={{ color: "#28a745", fontSize: 30 }}>
                {correctCount}
              </Text>{" "}
              {/* Success color */}
              <Text style={{ fontSize: 16 }}>Correct</Text>
            </View>
            <View style={{ alignItems: "center", padding: 20 }}>
              <Text style={{ color: "#dc3545", fontSize: 30 }}>
                {incorrectCount}
              </Text>{" "}
              {/* Error color */}
              <Text style={{ fontSize: 16 }}>Incorrect</Text>
            </View>
          </View>
          <Text style={{ opacity: 0.8 }}>
            {totalCount - (incorrectCount + correctCount)} Unattempted
          </Text>

          {/* Try Again Button */}
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 10,
              width: "100%",
              backgroundColor: "#3D5CFF", // Primary button color
              marginTop: 20,
              borderRadius: 50,
            }}
            onPress={handleRetry}
          >
            <MaterialIcons name="replay" style={{ color: "#FFFFFF" }} />{" "}
            {/* White icon */}
            <Text
              style={{
                textAlign: "center",
                color: "#FFFFFF", // White text
                marginLeft: 10,
              }}
            >
              Try Again
            </Text>
          </TouchableOpacity>

          {/* Go Home Button */}
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 10,
              width: "100%",
              backgroundColor: "#3D5CFF20", // Light blue background for secondary button
              marginTop: 20,
              borderRadius: 50,
            }}
            onPress={handleHome}
          >
            <MaterialIcons name="home" style={{ color: "#3D5CFF" }} />{" "}
            {/* Primary icon color */}
            <Text
              style={{
                textAlign: "center",
                color: "#3D5CFF", // Primary text color
                marginLeft: 10,
              }}
            >
              Go Home
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ResultModal;
