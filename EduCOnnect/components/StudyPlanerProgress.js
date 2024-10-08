import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { db } from "../firebaseConfig"; // Firebase configuration
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore"; // Firestore methods
import BottomNavBar from "./BottomNavBar"; // Assuming BottomNavBar exists
import { ProgressBar } from "react-native-paper"; // For the progress bar
import { Picker } from "@react-native-picker/picker"; // Dropdown for task status
import MaterialIcons from "react-native-vector-icons/MaterialIcons"; // Import the icon library

export default function StudyPlanerProgress({ navigation }) {
  const [studyPlans, setStudyPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updatedTasks, setUpdatedTasks] = useState({}); // Track task updates

  // Fetch Study Plans from Firestore
  const getStudyPlans = async () => {
    const plansSnapshot = await getDocs(collection(db, "studyPlans"));
    const plans = plansSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setStudyPlans(plans);
  };

  // Open the task update modal for a specific plan
  const openTaskModal = (plan) => {
    setSelectedPlan(plan);
    setUpdatedTasks(
      plan.tasks.reduce((acc, task, index) => {
        acc[index] = task.status;
        return acc;
      }, {})
    ); // Initialize task statuses
    setModalVisible(true);
  };

  // Update the task status locally
  const updateTaskStatus = (taskIndex, newStatus) => {
    setUpdatedTasks((prev) => ({
      ...prev,
      [taskIndex]: newStatus,
    }));
  };

  // Save task progress updates to Firebase
  const saveTaskUpdates = async () => {
    if (selectedPlan) {
      const updatedTaskList = selectedPlan.tasks.map((task, index) => ({
        ...task,
        status: updatedTasks[index],
      }));

      const planDocRef = doc(db, "studyPlans", selectedPlan.id);
      await updateDoc(planDocRef, { tasks: updatedTaskList });

      Alert.alert("Success", "Task progress updated!");
      setModalVisible(false);
      getStudyPlans(); // Refresh study plans
    }
  };

  // Delete a plan from Firebase
  const deletePlan = async (planId) => {
    await deleteDoc(doc(db, "studyPlans", planId));
    Alert.alert("Deleted", "Plan deleted successfully.");
    getStudyPlans(); // Refresh the list of plans
  };

  useEffect(() => {
    getStudyPlans();
  }, []);

  // Calculate progress percentage
  const calculateProgress = (tasks) => {
    const doneTasks = tasks.filter((task) => task.status === "done").length;
    return tasks.length > 0 ? doneTasks / tasks.length : 0;
  };

  // Split the plans into two columns
  const renderPlanGrid = () => {
    const rows = [];
    for (let i = 0; i < studyPlans.length; i += 2) {
      const firstPlan = studyPlans[i];
      const secondPlan = studyPlans[i + 1];
      rows.push(
        <View key={i} style={styles.planRow}>
          <TouchableOpacity
            style={styles.planCard}
            onPress={() => openTaskModal(firstPlan)}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>{firstPlan.planName}</Text>
              <TouchableOpacity onPress={() => deletePlan(firstPlan.id)}>
                <MaterialIcons name="delete" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <ProgressBar
              progress={calculateProgress(firstPlan.tasks)}
              color="#3D5CFF"
              style={styles.progressBar}
            />
            <Text style={styles.planProgress}>
              Completed{" "}
              {firstPlan.tasks.filter((task) => task.status === "done").length}/
              {firstPlan.tasks.length}
            </Text>
          </TouchableOpacity>

          {secondPlan && (
            <TouchableOpacity
              style={styles.planCard}
              onPress={() => openTaskModal(secondPlan)}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>{secondPlan.planName}</Text>
                <TouchableOpacity onPress={() => deletePlan(secondPlan.id)}>
                  <MaterialIcons name="delete" size={18} color="#ffff" />
                </TouchableOpacity>
              </View>
              <ProgressBar
                progress={calculateProgress(secondPlan.tasks)}
                color="#3D5CFF"
                style={styles.progressBar}
              />
              <Text style={styles.planProgress}>
                Completed{" "}
                {
                  secondPlan.tasks.filter((task) => task.status === "done")
                    .length
                }
                /{secondPlan.tasks.length}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    return rows;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Your Progress</Text>

      {/* Add Plan Button */}
      <TouchableOpacity
        style={styles.createPlanButton}
        onPress={() => navigation.navigate("AddStudyPlanScreen")}
      >
        <Text style={styles.createPlanButtonText}>Create Plan</Text>
      </TouchableOpacity>

      {/* Study Plans */}
      <ScrollView>{renderPlanGrid()}</ScrollView>

      {/* Modal for Task Progress Update */}
      {selectedPlan && (
        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedPlan.planName}</Text>
              <ScrollView style={styles.modalTaskList}>
                {selectedPlan.tasks.map((task, index) => (
                  <View key={index} style={styles.taskRow}>
                    <Text style={styles.taskName}>{task.name}</Text>
                    <Picker
                      selectedValue={updatedTasks[index]}
                      onValueChange={(value) => updateTaskStatus(index, value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Not Started" value="not started" />
                      <Picker.Item label="In Progress" value="in progress" />
                      <Picker.Item label="Done" value="done" />
                    </Picker>
                  </View>
                ))}
              </ScrollView>

              {/* Modal Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={saveTaskUpdates}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Bottom Navigation Bar in its own container */}
      <View style={styles.bottomNavBarContainer}>
        <BottomNavBar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F39",
    padding: 20,
    paddingBottom: 80, // Add padding to prevent content from hiding behind navbar
    marginTop: 25,
  },
  header: {
    fontSize: 24,
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    marginBottom: 20,
    textAlign: "center",
  },
  planRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  planCard: {
    flex: 1,
    backgroundColor: "#292C4D",
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  planTitle: {
    fontSize: 18,
    color: "#fff",
  },
  progressBar: {
    marginTop: 10,
    height: 8,
    borderRadius: 5,
    backgroundColor: "#3E3E55",
  },
  planProgress: {
    color: "#B0B0C3",
    marginTop: 10,
  },
  createPlanButton: {
    backgroundColor: "#3D5CFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  createPlanButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
  bottomNavBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#292C4D",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#3E3E55",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
  },
  modalTaskList: {
    maxHeight: 300,
  },
  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  taskName: {
    color: "#000",
    fontSize: 16,
    flex: 1,
  },
  picker: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#3D5CFF",
    padding: 10,
    borderRadius: 10,
    flex: 1,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
});
