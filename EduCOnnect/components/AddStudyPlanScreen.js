import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView, // Import ScrollView to make content scrollable
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker"; // Expo-compatible date picker
import BottomNavBar from "./BottomNavBar"; // Assuming your teacher bottom navigation
import { Picker } from "@react-native-picker/picker"; // Dropdown picker for status
import { db } from "../firebaseConfig"; // Firebase configuration
import { collection, addDoc } from "firebase/firestore"; // Firebase Firestore methods

export default function AddStudyPlanScreen({ navigation }) {
  const [planName, setPlanName] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskStatus, setTaskStatus] = useState("not started");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const addTask = () => {
    if (taskName) {
      const newTask = { name: taskName, status: taskStatus };
      setTasks([...tasks, newTask]);
      setTaskName("");
      setTaskStatus("not started");
      setShowTaskModal(false);
    } else {
      Alert.alert("Error", "Please enter a task name.");
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(false);
    setSelectedDate(currentDate);
  };

  const createPlan = async () => {
    if (!planName || tasks.length === 0) {
      Alert.alert("Error", "Please add a plan name and at least one task.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "studyPlans"), {
        planName,
        description,
        tasks,
        deadline: selectedDate.toISOString(), // Save date in ISO format
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Success", "Plan created successfully!");
      navigation.navigate("StudentHomePage");
    } catch (error) {
      console.error("Error creating plan:", error);
      Alert.alert("Error", "Failed to create the plan. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Set a New Plan</Text>
      </View>
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.subHeader}>Set the deadline</Text>

        {/* Date Picker */}
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>{selectedDate.toDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Plan Name and Description */}
        <TextInput
          style={styles.input}
          placeholder="Name of the planner"
          placeholderTextColor="#858597"
          value={planName}
          onChangeText={setPlanName}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          placeholderTextColor="#858597"
          value={description}
          onChangeText={setDescription}
        />

        {/* Tasks Section */}
        <TouchableOpacity
          style={styles.addTaskButton}
          onPress={() => setShowTaskModal(true)}
        >
          <Text style={styles.addTaskButtonText}>Add Tasks to the Plan</Text>
        </TouchableOpacity>

        {/* List of Added Tasks */}
        {tasks.length > 0 ? (
          <FlatList
            data={tasks}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.taskCard}>
                <Text style={styles.taskText}>{item.name}</Text>
                <Text style={styles.statusText}>Status: {item.status}</Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.noTasksText}>No tasks added yet</Text>
        )}

        {/* Create Plan Button */}
      </ScrollView>
      <TouchableOpacity style={styles.createPlanButton} onPress={createPlan}>
        <Text style={styles.createPlanButtonText}>
          {loading ? "Creating..." : "Create Plan"}
        </Text>
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBarContainer}>
        <BottomNavBar />
      </View>

      {/* Task Modal */}
      <Modal visible={showTaskModal} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add a New Task</Text>
            <TextInput
              style={styles.inputbox}
              placeholder="Enter Task Name"
              value={taskName}
              onChangeText={setTaskName}
            />
            <Text style={styles.modalSubtitle}>Select the progress</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={taskStatus}
                style={styles.picker}
                onValueChange={(itemValue) => setTaskStatus(itemValue)}
              >
                <Picker.Item label="Not started" value="not started" />
                <Picker.Item label="In progress" value="in progress" />
                <Picker.Item label="Done" value="done" />
              </Picker>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowTaskModal(false)}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addTask} style={styles.modalAddButton}>
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#1F1F39",
    marginTop: 26,
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
   header: {
    fontSize: 28,
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    marginVertical: 20,
    marginTop: 20,
  },
  headerContainer: {
    backgroundColor: "#3D5CFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 10,
    
    overflow: "visible",
    paddingTop: 8,
  },
  subHeader: {
    fontSize: 14,
    color: "#B0B0C3",
    textAlign: "center",
    marginBottom: 20,
  },
  dateText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#3D5CFF",
    borderRadius: 10,
  },
  input: {
    backgroundColor: "#292C4D",
    padding: 15,
    borderRadius: 10,
    color: "#fff",
    marginBottom: 20,
  },
  inputbox: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    color: "#000000",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#858597",
  },

  addTaskButton: {
    backgroundColor: "#3D5CFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  addTaskButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
  noTasksText: {
    color: "#B0B0C3",
    textAlign: "center",
    marginBottom: 20,
  },
  taskCard: {
    backgroundColor: "#292C4D",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  taskText: {
    color: "#fff",
    fontSize: 16,
  },
  statusText: {
    color: "#B0B0C3",
    fontSize: 14,
  },
  createPlanButton: {
    backgroundColor: "#3D5CFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    margin: 20,
  },
  createPlanButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
  bottomNavBarContainer: {
    borderTopWidth: 1,
    borderTopColor: "#292C4D",
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
    color: "#000000",
    fontSize: 20,
    marginBottom: 20,
  },
  modalSubtitle: {
    color: "#000000",
    fontSize: 14,
    marginBottom: 10,
  },
  picker: {
    backgroundColor: "#FFFFFF",
    color: "#000000",
    padding: 20,
  },
  pickerWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#858597",
    padding: 2, // This will now apply the border around the picker
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalCancelButton: {
    backgroundColor: "#FF3B30",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  modalAddButton: {
    backgroundColor: "#3D5CFF",
    padding: 10,
    borderRadius: 10,
    flex: 1,
  },
  modalButtonText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "Poppins_600SemiBold",
  },
});
