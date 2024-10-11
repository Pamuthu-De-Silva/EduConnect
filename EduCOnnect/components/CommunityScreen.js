// CommunityScreen.js
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text, StyleSheet } from 'react-native';
import BottomNavBar from './BottomNavBar';
import MessagesScreen from './MessagesScreen';
import CommunityForumScreen from './CommunityForumScreen';
import { StatusBar } from 'react-native';

const Tab = createMaterialTopTabNavigator();

export default function CommunityScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Notifications</Text>

            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: '#fff',
                    tabBarInactiveTintColor: '#B0B0C3',
                    tabBarLabelStyle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold' },
                    tabBarStyle: { backgroundColor: '#1F1F39' },
                    tabBarIndicatorStyle: { backgroundColor: '#3D5CFF' },
                }}
            >
                <Tab.Screen name="Messages" component={MessagesScreen} />
                <Tab.Screen name="Community Forum" component={CommunityForumScreen} />
            </Tab.Navigator>

            <BottomNavBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1F1F39',
        padding: 16,
        paddingTop: StatusBar.currentHeight + 16, // Add padding for the status bar
    },
    title: {
        fontSize: 24,
        fontFamily: 'Poppins_600SemiBold',
        color: '#fff',
        marginBottom: 16,
    },
});
