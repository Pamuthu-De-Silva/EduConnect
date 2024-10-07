import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import LandingPage from "./components/LandingPage";
import OnboardScreen from "./components/OnboardScreen";
import LoginScreen from "./components/LoginScreen";
import SignUpScreen from "./components/SignUpScreen";
import VideoUpload from "./components/VideoUpload";
import StudentHomePage from "./components/StudentHomePage";
import LectureDetailScreen from "./components/LectureDetailScreen";
import TeacherDashboard from "./components/TeacherDashboard";
import PdfUploadPage from "./components/ResorceUpload";
import AddQuiz from "./components/AddQuiz";
import AddQuestionScreen from "./components/AddQuestionScreen";
import ResourcesPage from "./components/ResourcesPage";
import AllQuizzesScreen from "./components/AllQuizzesScreen";
import PlayQuizScreen from "./components/PlayQuizScreen";
import AllQuizzesScreenTeacher from "./components/AllQuizzesScreenTeacher";
import UpdateQuizScreen from "./components/UpdateQuizScreen";
import ProfileScreen from "./components/ProfileScreen";
import AddStudyPlanScreen from "./components/AddStudyPlanScreen";
import StudyPlanerProgress from "./components/StudyPlanerProgress";
import StudyPlannerUpdate from "./components/StudyPlannerUpdate";

const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LandingPage"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="LandingPage" component={LandingPage} />
        <Stack.Screen name="OnboardScreen" component={OnboardScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="VideoUpload" component={VideoUpload} />
        <Stack.Screen name="StudentHomePage" component={StudentHomePage} />
        <Stack.Screen
          name="LectureDetailScreen"
          component={LectureDetailScreen}
        />
        <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
        <Stack.Screen name="PdfUploadPage" component={PdfUploadPage} />
        <Stack.Screen name="AddQuiz" component={AddQuiz} />
        <Stack.Screen name="AddQuestionScreen" component={AddQuestionScreen} />
        <Stack.Screen name="ResourcesPage" component={ResourcesPage} />
        <Stack.Screen name="AllQuizzesScreen" component={AllQuizzesScreen} />
        <Stack.Screen name="PlayQuizScreen" component={PlayQuizScreen} />
        <Stack.Screen
          name="AllQuizzesScreenTeacher"
          component={AllQuizzesScreenTeacher}
        />
        <Stack.Screen name="UpdateQuizScreen" component={UpdateQuizScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen
          name="AddStudyPlanScreen"
          component={AddStudyPlanScreen}
        />

        <Stack.Screen
          name="StudyPlanerProgress"
          component={StudyPlanerProgress}
        />

        <Stack.Screen
          name="StudyPlannerUpdate"
          component={StudyPlannerUpdate}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
