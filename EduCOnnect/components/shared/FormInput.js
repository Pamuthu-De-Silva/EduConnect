import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

const FormInput = ({
  labelText = "",
  placeholderText = "",
  onChangeText = null,
  value = null,
  ...more
}) => {
  return (
    <View style={styles.inputContainer}>
      {labelText !== "" && <Text style={styles.label}>{labelText}</Text>}
      <TextInput
        style={styles.input}
        placeholder={placeholderText}
        placeholderTextColor={"#FFFFFF80"} // White placeholder text with opacity
        onChangeText={onChangeText}
        value={value}
        {...more}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    color: "#FFFFFF", // White label text
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "bold",
  },
  input: {
    padding: 15,
    borderColor: "#3D5CFF", // Blue border color to match the theme
    borderWidth: 1,
    width: "100%",
    borderRadius: 8, // Rounded corners for the input field
    backgroundColor: "#292C4D", // Dark background for the input field
    color: "#FFFFFF", // White text color for input
  },
});

export default FormInput;
