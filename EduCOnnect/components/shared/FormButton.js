import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const FormButton = ({
  labelText = "",
  handleOnPress = null,
  style,
  isPrimary = true,
  ...more
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        style,
      ]}
      activeOpacity={0.9}
      onPress={handleOnPress}
      {...more}
    >
      <Text
        style={[
          styles.buttonText,
          isPrimary ? styles.primaryButtonText : styles.secondaryButtonText,
        ]}
      >
        {labelText}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#3D5CFF", // Hardcoded primary color (Blue)
    borderWidth: 1,
    borderColor: "#3D5CFF",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF", // Hardcoded white for secondary button
    borderWidth: 1,
    borderColor: "#3D5CFF",
  },
  buttonText: {
    fontSize: 16, // Matching font size for buttons
    fontWeight: "bold",
  },
  primaryButtonText: {
    color: "#FFFFFF", // White text for primary button
  },
  secondaryButtonText: {
    color: "#3D5CFF", // Blue text for secondary button
  },
});

export default FormButton;
