import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet, Image, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { db, storage, auth } from '../firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const CommunityForumScreen = () => {
  const [question, setQuestion] = useState('');
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [image, setImage] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reply, setReply] = useState('');
  const [replies, setReplies] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false); // State for delete confirmation modal
  const [editModalVisible, setEditModalVisible] = useState(false); // State for edit modal
  const [editedQuestion, setEditedQuestion] = useState('');

  const flatListRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'communityQuestions'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedQuestions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestions(fetchedQuestions);
    });

    return () => unsubscribe();
  }, []);

  const fetchReplies = (questionId) => {
    const repliesQuery = query(collection(db, `communityQuestions/${questionId}/replies`), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(repliesQuery, (snapshot) => {
      const fetchedReplies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReplies(fetchedReplies);
    });

    return unsubscribe;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePublish = async () => {
    if (!question && !image) return;
  
    let imageUrl = null;
    if (image) {
      try {
        const response = await fetch(image);
        const blob = await response.blob();
        const imageRef = ref(storage, `communityImages/${new Date().toISOString()}`);
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
        console.log('Uploaded Image URL:', imageUrl); // Log the image URL for debugging
      } catch (error) {
        console.error('Error uploading image:', error);
        return;
      }
    }
  
    try {
      await addDoc(collection(db, 'communityQuestions'), {
        userId: auth.currentUser.uid,
        question,
        imageUrl: imageUrl || null,  // Ensure imageUrl is stored correctly
        timestamp: new Date(),
      });
      setQuestion('');
      setImage(null);
    } catch (error) {
      console.error("Error publishing question: ", error);
    }
  };
  

  const handleReply = async () => {
    if (!reply || !selectedQuestion) return;

    try {
      const questionRef = doc(db, 'communityQuestions', selectedQuestion.id);
      await addDoc(collection(questionRef, 'replies'), {
        userId: auth.currentUser.uid,
        reply,
        timestamp: new Date(),
      });
      setReply('');
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      // Delete replies first if needed
      const repliesQuery = query(collection(db, `communityQuestions/${questionId}/replies`));
      const repliesSnapshot = await getDocs(repliesQuery);
      repliesSnapshot.forEach(async (replyDoc) => {
        await deleteDoc(doc(db, `communityQuestions/${questionId}/replies`, replyDoc.id));
      });

      // Now delete the question
      await deleteDoc(doc(db, 'communityQuestions', questionId));
      setDeleteModalVisible(false); // Close delete modal
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const confirmDelete = (question) => {
    setSelectedQuestion(question);
    setDeleteModalVisible(true);
  };

  const handleEditQuestion = async () => {
    if (!editedQuestion) return;
    
    try {
      const questionRef = doc(db, 'communityQuestions', selectedQuestion.id);
      await updateDoc(questionRef, {
        question: editedQuestion,
        timestamp: new Date(), // Update timestamp if needed
      });
      setEditModalVisible(false);
      setEditedQuestion('');
    } catch (error) {
      console.error("Error updating question: ", error);
    }
  };

  const confirmEdit = (question) => {
    setSelectedQuestion(question);
    setEditedQuestion(question.question); // Set current question text to edit state
    setEditModalVisible(true);
  };



  const filteredQuestions = questions.filter(q =>
    q.question.toLowerCase().includes(search.toLowerCase())
  );

  const openQuestion = (question) => {
    setSelectedQuestion(question);
    fetchReplies(question.id);
    setModalVisible(true);
  };

  return (
    <KeyboardAvoidingView style={styles.forumContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search questions..."
        placeholderTextColor="#B0B0C3"
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.questionsContainer}>
        <FlatList
          ref={flatListRef}
          data={filteredQuestions}
          inverted
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isCurrentUser = item.userId === auth.currentUser.uid;
            return (
              <TouchableOpacity onPress={() => openQuestion(item)}>
                <View style={isCurrentUser ? styles.userQuestionCard : styles.otherUserQuestionCard}>
                  <Text style={styles.questionText}>{item.question}</Text>
                  
                  {/* Check if imageUrl is available and display the image */}
                  {item.imageUrl ? (
                    <Image 
                      source={{ uri: item.imageUrl }} 
                      style={styles.questionImage} 
                      onError={(e) => console.log('Error loading image:', e.nativeEvent.error)} // Log if there's an error loading the image
                    />
                  ) : (
                    null // No need to log if it's expected for some questions not to have images
                  )}

                {/* Delete button */}
                {isCurrentUser && ( // Show delete button only for questions posted by the current user
                    <View style={styles.actionsContainer}>
                    <TouchableOpacity onPress={() => confirmEdit(item)} style={styles.editButton}>
                    <FontAwesome name="edit" size={24} color="#FF3D00" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteButton}>
                      <Ionicons name="trash-outline" size={24} color="#FF3D00" />
                    </TouchableOpacity>
                  </View>
                    
                  )}

                </View>
              </TouchableOpacity>
            );
            
            
          }}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>

      {image && (
        <Image source={{ uri: image }} style={styles.imagePreview} />
      )}

      <View style={[styles.inputContainer, { marginBottom: 20 }]}>
        <TextInput
          style={styles.input}
          placeholder="Ask a question..."
          placeholderTextColor="#B0B0C3"
          value={question}
          onChangeText={setQuestion}
        />
        <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
          <Ionicons name="image-outline" size={28} color="#3D5CFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePublish} style={styles.iconButton}>
          <Ionicons name="send-outline" size={28} color="#3D5CFF" />
        </TouchableOpacity>
      </View>

      {/* {image && (
        <Image source={{ uri: image }} style={styles.imagePreview} />
      )} */}

      {selectedQuestion && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <ScrollView>
                <Text style={styles.modalQuestionText}>{selectedQuestion.question}</Text>
                {selectedQuestion.imageUrl && <Image source={{ uri: selectedQuestion.imageUrl }} style={styles.modalImage} />}
                <Text style={styles.modalRepliesTitle}>Replies:</Text>
                {replies.map(reply => (
                  <View key={reply.id} style={styles.replyCard}>
                    <Text style={styles.replyText}>{reply.reply}</Text>
                  </View>
                ))}

                <View style={styles.replyInputContainer}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Write a reply..."
                    value={reply}
                    onChangeText={setReply}
                  />
                  <TouchableOpacity onPress={handleReply}>
                    <Ionicons name="send-outline" size={28} color="#3D5CFF" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeModal}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

<Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Edit Question</Text>
            <TextInput
              style={styles.editInput}
              value={editedQuestion}
              onChangeText={setEditedQuestion}
              placeholder="Edit your question..."
            />
            <TouchableOpacity onPress={handleEditQuestion} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

          {/* Delete confirmation modal */}
          {selectedQuestion && (
        <Modal
          visible={deleteModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.deleteConfirmationText}>Are you sure you want to delete this question?</Text>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity onPress={() => handleDeleteQuestion(selectedQuestion.id)} style={styles.confirmDeleteButton}>
                  <Text style={styles.confirmDeleteText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setDeleteModalVisible(false)} style={styles.cancelDeleteButton}>
                  <Text style={styles.cancelDeleteText}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  forumContainer: {
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
  questionsContainer: {
    flex: 1,
    paddingBottom: 70,  // Padding to avoid overlap with the input area
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3E3E55',
    padding: 10,
    borderRadius: 8,
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontFamily: 'Poppins_400Regular',
    marginRight: 10,
  },
  iconButton: {
    marginLeft: 10,
  },
  imagePreview: {
    width: 150,
    height: 100,
    marginBottom: 75,
    alignSelf: 'center',
    borderRadius: 10,
  },
  userQuestionCard: {
    alignSelf: 'flex-end',
    backgroundColor: '#3D5CFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  otherUserQuestionCard: {
    alignSelf: 'flex-start',
    backgroundColor: '#3E3E55',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  questionText: {
    color: '#fff',
    fontFamily: 'Poppins_400Regular',
  },
  questionImage: {
    width: '70%', // Take the full width of the parent container
    height: undefined, // Allows height to be set based on aspect ratio
    aspectRatio: 1, // Adjust this value based on your needs; 1 means square
    resizeMode: 'contain', // Ensures the image fits within the container
    borderRadius: 8, // Rounds the corners slightly
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: '#3E3E55',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalQuestionText: {
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    marginBottom: 10,
  },
  modalRepliesTitle: {
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
    marginTop: 10,
    marginBottom: 5,
  },
  replyCard: {
    backgroundColor: '#3D5CFF',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },
  replyText: {
    color: '#fff',
    fontFamily: 'Poppins_400Regular',
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3E3E55',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  replyInput: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Poppins_400Regular',
    marginRight: 10,
  },
  closeModal: {
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
    marginTop: 20,
    textAlign: 'center',
  },
  modalImage: {
    width: '100%',
    height: 150,
    marginTop: 10,
    borderRadius: 10,
  },
  deleteConfirmationText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFFFFF'
    
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmDeleteButton: {
    backgroundColor: '#FF3D00',
    borderRadius: 5,
    padding: 10,
    flex: 1,
    marginRight: 5,
  },
  confirmDeleteText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cancelDeleteButton: {
    backgroundColor: '#B0B0C3',
    borderRadius: 5,
    padding: 10,
    flex: 1,
    marginLeft: 5,
  },
  cancelDeleteText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  editButton: {
    marginRight: 10,
    
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  editInput: {
    backgroundColor: '#3E3E55',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#3D5CFF',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    borderColor: '#FF3D00',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FF3D00',
    fontWeight: 'bold',
  },
});

export default CommunityForumScreen;
