import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Modal, TextInput } from 'react-native';
import { auth } from '../../FirebaseConfig';
import { router } from 'expo-router';
import { getAuth, updateEmail, updatePassword } from 'firebase/auth';

export default function TabOneScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Redirect to login if user is not authenticated
  getAuth().onAuthStateChanged((user) => {
    if (!user) router.replace('/');
  });

  const handleUpdateCredentials = async () => {
    const user = auth.currentUser;
  
    if (user) {
      try {
        // Check if email is provided and validate domain
        if (newEmail !== '' && !newEmail.includes('rutgers.edu')) {
          alert('Please enter a valid Rutgers email (must contain rutgers.edu)');
          return; // Stop execution if email is invalid
        }
  
        // If the email is valid, update it
        if (newEmail !== '') {
          await updateEmail(user, newEmail);
        }
  
        // Only update password if email validation passed
        if (newPassword !== '') {
          await updatePassword(user, newPassword);
        }
  
        alert('Credentials updated successfully');
  
        // Reset input fields and close modal
        setNewEmail('');
        setNewPassword('');
        setModalVisible(false);
      } catch (error: any) {
        console.error('Error updating credentials: ', error);
        alert('Error updating credentials: ' + error.message);
      }
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Settings</Text>
      <TouchableOpacity style={styles.button} onPress={() => auth.signOut()}>
        <Text style={styles.text}>Sign Out</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.text}>Update Email & Password</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Credentials</Text>
            <TextInput 
              placeholder="New Email"
              value={newEmail}
              onChangeText={setNewEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput 
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.input}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleUpdateCredentials}>
              <Text style={styles.text}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#CCCCCC' }]} onPress={() => setModalVisible(false)}>
              <Text style={styles.text}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A237E',
    marginBottom: 40,
  },
  button: {
    width: '90%',
    backgroundColor: '#5C6BC0',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5C6BC0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
    marginTop: 15,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FAFAFA',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 15,
    color: '#1A237E',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#E8EAF6',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  modalButton: {
    width: '100%',
    backgroundColor: '#5C6BC0',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5,
  }
});
