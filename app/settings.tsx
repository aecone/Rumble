import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Alert,
  Platform,
} from "react-native";
import { auth, storage } from "../FirebaseConfig";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { useFocusEffect } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { router } from 'expo-router';
import { getAuth, updateEmail, updatePassword } from 'firebase/auth';
import { API_BASE_URL } from "../FirebaseConfig";

export default function TabFourScreen() {
  // Check if user is authenticated
  getAuth().onAuthStateChanged((user) => {
    if (!user) router.replace('/');
  });

  // Define the settings type
  type Settings = {
    firstName: string;
    lastName: string;
    email: string;
    birthday: string;
    ethnicity: string;
    gender: string;
    pronouns: string;
  };
  type Profile = {
    bio: string;
    profilePictureUrl: string;
    major: string;
    gradYear: number | null;
    hobbies: string[];
    orgs: string[];
    careerPath: string;
    interestedIndustries: string[];
    userType: string;
    mentorshipAreas: string[];
  };

  // State variables
  
  const [settings, setSettings] = useState<Settings>({
        firstName: "",
        lastName: "",
        email: "",
        birthday: "",
        ethnicity: "",
        gender: "",
        pronouns: "",
    
  });
  const [userProfile, setUserProfile] = useState<Profile>({
    bio: "",
      profilePictureUrl: "",
      major: "",
      gradYear: null,
      hobbies: [],
      orgs: [],
      careerPath: "",
      interestedIndustries: [],
      userType: "TBD",
      mentorshipAreas: [],
    });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Navigation handlers
  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      // Update settings in the backend
      await updateSettings();
      
      // Provide feedback to the user
      Alert.alert("Success", "Your settings have been updated successfully!");
    } catch (error) {
      console.error("Error during save operation:", error);
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchProfile();
      } else {
        setUser(null);
        setSettings({
            firstName: '',
            lastName: '',
            email: '',
            birthday: '',
            ethnicity: '',
            gender: '',
            pronouns: '',
        });
      }
    });
  
    return unsubscribe;
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      if (user) fetchProfile();
    }, [user])
  );

    const fetchProfile = async () => {
    if (!user || !API_BASE_URL) return;
    setLoading(true);
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: { Authorization: token },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Profile fetched successfully:", data);
        setSettings({ 
           ...data.settings, email: auth.currentUser?.email || "" 
        });
      } else {
        const errorData = await response.json();
        console.error("Error fetching profile:", errorData);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(`${API_BASE_URL}/update_settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        console.log("Settings updated successfully");
      } else {
        console.error("Error updating settings:", await response.json());
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  const handleUpdateCredentials = async () => {
    const user = auth.currentUser;
    if (!user || !API_BASE_URL) return;
  
    try {
      // Validate Rutgers email
      if (newEmail !== '' && !newEmail.toLowerCase().endsWith('rutgers.edu')) {
        alert('Please enter a valid Rutgers email (must end with rutgers.edu)');
        return;
      }
  
      // Update email if provided
      if (newEmail !== '') {
        await updateEmail(user, newEmail);
        setUserProfile((prev) => ({ ...prev, email: newEmail }));  // <-- Update profile state
      }
  
      // Update password if provided
      if (newPassword !== '') {
        await updatePassword(user, newPassword);
      }
  
      alert('Credentials updated successfully');
  
      // **Force user refresh**
      await user.reload();  // <-- Ensures latest user data
      setUser(auth.currentUser); // <-- Update state with latest user info
  
      // Fetch latest profile details
      fetchProfile();
  
      // Reset inputs and close modal
      setNewEmail('');
      setNewPassword('');
      setModalVisible(false);
  
    } catch (error: any) {
      console.error('Error updating credentials: ', error);
      alert('Error updating credentials: ' + error.message);
    }
  };

  const deleteAccount = async () => {
    if (!user || !API_BASE_URL) return;
    setLoading(true);
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(`${API_BASE_URL}/delete_account`, {
        method: "DELETE",
        headers: {
          Authorization: `${token}`,
        },
      });
  
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        if (response.ok) {
          console.log("Account deleted, now signing out...");
          await auth.signOut();
          console.log("Successfully signed out, navigating...");
          
          router.dismissAll();
          router.replace("/");
        
          Alert.alert("Account Deleted", "Your account has been successfully deleted.");
        }
        
      } else {
        Alert.alert("Error", data.error || "Failed to delete account.");
      }
    } catch (error) {
      console.log("error");
      Alert.alert("Error", "Could not complete request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with Settings and Edit buttons */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={toggleEditing}
        >
          <Text style={styles.headerButtonText}>{isEditing ? "Done" : "Edit"}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.container}>
            {loading && <ActivityIndicator size="large" color="#534E5B" />}
            
            {/* Display settings */}
            {isEditing ? (
              <>
                <TextInput
                style={styles.input}
                value={settings.firstName || ''}
                onChangeText={(text) =>
                    setSettings({ ...settings, firstName: text })
                }
                />

                <TextInput
                style={styles.input}
                value={settings.lastName || ''}
                onChangeText={(text) =>
                    setSettings({ ...settings, lastName: text })
                }
                />

                <TextInput
                  style={styles.input}
                  value={settings.email || ''}
                  onChangeText={(text) => setSettings({ ...settings, email: text })}
                  placeholder="Email"
                  keyboardType="email-address"
                />
                <TextInput
                  style={styles.input}
                  value={settings.birthday || ''}
                  onChangeText={(text) => setSettings({ ...settings, birthday: text })}
                  placeholder="Birthday"
                />
                <TextInput
                  style={styles.input}
                  value={settings.ethnicity || ''}
                  onChangeText={(text) => setSettings({ ...settings, ethnicity: text })}
                  placeholder="Ethnicity"
                />
                <TextInput
                  style={styles.input}
                  value={settings.gender || ''}
                  onChangeText={(text) => setSettings({ ...settings, gender: text })}
                  placeholder="Gender"
                />
                <TextInput
                style={styles.input}
                value={settings.pronouns || ''}  // Display pronouns string (if any)
                onChangeText={(text) => setSettings({ ...settings, pronouns: text })}  // Update pronouns as a string
                />
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                  <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.settingLabel}>First Name: {settings.firstName}</Text>
                <Text style={styles.settingLabel}>Last Name: {settings.lastName}</Text>
                <Text style={styles.settingLabel}>Birthday: {settings.birthday}</Text>
                <Text style={styles.settingLabel}>Ethnicity: {settings.ethnicity}</Text>
                <Text style={styles.settingLabel}>Gender: {settings.gender}</Text>
                <Text style={styles.settingLabel}>Pronouns: {settings.pronouns}</Text>

              </>
            )}
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
            <TouchableOpacity style={[styles.button, { backgroundColor: "#D9534F" }]} onPress={deleteAccount}>
            <Text style={styles.buttonText}>Delete Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => auth.signOut()}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Update Email and Password</Text>
      </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",

  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    color: '#534E5B',
    fontSize: 16,
    fontWeight: '600',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    padding: 15,
    width: '100%',
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },

  saveButton: {
    backgroundColor: '#534E5B',
    paddingVertical: 15,
    marginTop: 20,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },

  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },

  settingLabel: {
    fontSize: 16,
    marginVertical: 5,
    color: '#534E5B',
  },
  button: {
    padding: 10,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5C6BC0",
    marginTop: 10,
    width: "60%",
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
  modalButton: {
    width: '100%',
    backgroundColor: '#5C6BC0',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5,
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },

});
