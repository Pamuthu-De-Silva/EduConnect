import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, StatusBar, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const MessagesScreen = () => {
  const navigation = useNavigation();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);

  useEffect(() => {
    if (auth.currentUser) {
      const currentUserId = auth.currentUser.uid;

      console.log('Current User ID:', currentUserId);

      const q = query(collection(db, 'chats'), where('users', 'array-contains', currentUserId));

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        console.log('Chats snapshot size:', snapshot.size);
        if (snapshot.empty) {
          console.log('No chats found for this user.');
          setChats([]);
          setFilteredChats([]);
          setLoading(false);
          return;
        }

        try {
          const chatPromises = snapshot.docs.map(async (docSnapshot) => {
            const chatData = docSnapshot.data();
            const otherUserId = chatData.users.find((id) => id !== currentUserId);

            if (!otherUserId) {
              console.log('No other user found in this chat.');
              return null;
            }

            const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
            if (!otherUserDoc.exists()) {
              console.log(`User with ID ${otherUserId} does not exist.`);
              return null;
            }

            const otherUserData = otherUserDoc.data();
            const messagesQuery = query(
              collection(db, 'chats', docSnapshot.id, 'messages'),
              orderBy('timestamp', 'desc'),
              limit(1)
            );

            const messagesSnapshot = await getDocs(messagesQuery);
            if (messagesSnapshot.empty) {
              console.log(`No messages found in chat ${docSnapshot.id}`);
              return {
                chatId: docSnapshot.id,
                otherUserId,
                otherUserName: otherUserData?.fullName || 'Unknown User',
                lastMessage: 'No messages yet',
              };
            }

            const lastMessage = messagesSnapshot.docs[0].data().message;

            return {
              chatId: docSnapshot.id,
              otherUserId,
              otherUserName: otherUserData?.fullName || 'Unknown User',
              lastMessage,
            };
          });

          const chatResults = await Promise.all(chatPromises);
          const filteredChats = chatResults.filter((chat) => chat !== null);
          console.log('Filtered Chats:', filteredChats);
          setChats(filteredChats);
          setFilteredChats(filteredChats);
        } catch (error) {
          console.error('Error fetching chat details:', error);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    setFilteredChats(
      chats.filter((chat) =>
        chat.otherUserName.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, chats]);

  const handleChatPress = (chatId, otherUserName, otherUserId) => {
    navigation.navigate('ChatScreen', {
      chatId,
      chatName: otherUserName,
      recipientId: otherUserId,
    });
  };

  const handleDeleteChat = async (chatId) => {
    console.log('Deleting chat:', chatId);
    try {
      const messagesQuery = query(collection(db, 'chats', chatId, 'messages'));
      const messagesSnapshot = await getDocs(messagesQuery);

      const deletePromises = messagesSnapshot.docs.map((messageDoc) => {
        console.log('Deleting message ID:', messageDoc.id);
        return deleteDoc(messageDoc.ref);
      });

      await Promise.all(deletePromises);

      await deleteDoc(doc(db, 'chats', chatId));
      console.log(`Chat ${chatId} deleted successfully`);
    } catch (error) {
      console.error('Error deleting chat:', error);
      Alert.alert('Error', 'Failed to delete chat. Please try again.');
    }
  };

  const confirmDeleteChat = (chatId) => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteChat(chatId),
        },
      ]
    );
  };

  const handleNewChat = () => {
    navigation.navigate('StartNewChatScreen');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search chats..."
        placeholderTextColor="#B0B0C3"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.chatId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatCard}
            onPress={() => handleChatPress(item.chatId, item.otherUserName, item.otherUserId)}
            onLongPress={() => confirmDeleteChat(item.chatId)}
          >
            <Text style={styles.chatName}>{item.otherUserName}</Text>
            <Text style={styles.lastMessage}>{item.lastMessage}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.noChatsText}>No chats available</Text>
        )}
      />

      <TouchableOpacity style={styles.floatingButton} onPress={handleNewChat}>
        <Ionicons name="chatbubble-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F39',
    padding: 16,
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
  lastMessage: {
    color: '#B0B0C3',
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'Poppins_400Regular',
  },
  loadingText: {
    color: '#B0B0C3',
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginTop: 20,
  },
  noChatsText: {
    color: '#B0B0C3',
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginTop: 20,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#3D5CFF',
    borderRadius: 50,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MessagesScreen;
