import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function ChatScreen({ route }) {
  const { chatId, chatName, recipientId } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const flatListRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => doc.data());
      setMessages(fetchedMessages);
      flatListRef.current?.scrollToEnd({ animated: true });
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      // Add the message to the messages sub-collection
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: auth.currentUser.uid,
        recipientId,
        message: message.trim(),
        timestamp: new Date(),
      });

      // Update the lastMessage and timestamp fields in the parent chat document
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: message.trim(),
        timestamp: new Date(),
      });

      setMessage('');
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.chatName}>{chatName}</Text>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          const isSentByCurrentUser = item.senderId === auth.currentUser.uid;
          return (
            <View style={isSentByCurrentUser ? styles.sentMessage : styles.receivedMessage}>
              <Text style={styles.messageText}>{item.message}</Text>
            </View>
          );
        }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F39',
    padding: 16,
    paddingTop: StatusBar.currentHeight + 16,
  },
  chatName: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 10,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3D5CFF',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#3E3E55',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  messageText: {
    color: '#fff',
    fontFamily: 'Poppins_400Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#3E3E55',
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#3E3E55',
    color: '#fff',
    borderRadius: 8,
    padding: 10,
    fontFamily: 'Poppins_400Regular',
  },
  sendButton: {
    backgroundColor: '#3D5CFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
});
