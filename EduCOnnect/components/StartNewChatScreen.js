import React, { useState, useEffect } from 'react';
import { View, TextInput, ScrollView, TouchableOpacity, Text, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../firebaseConfig';
import { collection, query, onSnapshot, setDoc, doc, getDoc } from 'firebase/firestore';


const StartNewChatScreen = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter(user => user.fullName?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, users]);

  const generateChatId = (userId1, userId2) => {
    return [userId1, userId2].sort().join('_');
  };

  const handleChatPress = async (recipientId, chatName) => {
    if (auth.currentUser) {
      const chatId = generateChatId(auth.currentUser.uid, recipientId);
      
      try {
        // Check if chat already exists
        const chatDocRef = doc(db, 'chats', chatId);
        const chatDocSnap = await getDoc(chatDocRef);
        if (!chatDocSnap.exists()) {
          // Create a new chat document if it doesn't exist
          await setDoc(chatDocRef, {
            users: [auth.currentUser.uid, recipientId],
            lastMessage: '',
            timestamp: new Date()
          });
        }

        // Navigate to ChatScreen after ensuring the chat exists
        navigation.navigate('ChatScreen', {
          chatId,
          chatName,
          recipientId,
        });
      } catch (error) {
        console.error('Error navigating to ChatScreen:', error);
      }
    } else {
      console.error('User not authenticated');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: StatusBar.currentHeight + 16 }]}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        placeholderTextColor="#B0B0C3"
        value={search}
        onChangeText={setSearch}
      />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {filteredUsers.map(user => (
          <TouchableOpacity
            key={user.id}
            style={styles.chatCard}
            onPress={() => handleChatPress(user.id, user.fullName)}
          >
            <Text style={styles.chatName}>{user.fullName} <Text style={styles.chatStatus}>({user.status})</Text></Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F39',
  },
  searchInput: {
    width: '100%',
    backgroundColor: '#3E3E55',
    color: '#fff',
    borderRadius: 8,
    padding: 10,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 10,
  },
  scrollViewContent: {
    padding: 16,
  },
  chatCard: {
    backgroundColor: '#3E3E55',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  chatName: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  chatStatus: {
    color: '#B0B0C3',
    fontSize: 12,
  },
});

export default StartNewChatScreen;
