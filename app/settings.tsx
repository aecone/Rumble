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
import { fetchSignInMethodsForEmail } from "firebase/auth";


const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      return signInMethods.length > 0; 
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
};

export default function Settings() {
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
    const checkEmail = async (email: string): Promise<boolean> => {
        try {
          const emailExists = await checkEmailExists(email); // Check if email exists
      
          if (emailExists) {
            alert("This email is already registered. Please sign in or use a different email.");
            return false; // Return false if the email already exists
          }
      
          if (!email.toLowerCase().endsWith("rutgers.edu")) {
            alert("Please use a valid Rutgers email address.");
            return false; // Return false if it's not a valid Rutgers email
          }
      
          return true; // Return true if the email is valid
        } catch (error) {
          console.error("Error checking email:", error);
          alert("An error occurred while checking the email. Please try again.");
          return false; // Return false in case of any error
        }
      };
      
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
  const [emailChanged, setEmailChanged] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [refresh, setRefresh] = useState(false);

  // Navigation handlers
  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      // Only validate email if it's actually changed
      if (emailChanged && newEmail !== settings.email) {
        const emailValid = await checkEmail(newEmail);
        if (!emailValid) {
          // If email is invalid, revert back to previous email
          setNewEmail(settings.email); // Revert to settings email
          setEmailChanged(false); // Reset email changed flag
          return;
        }
        // Update the email in Firebase Auth
        const user = auth.currentUser;
        if (user) {
          await updateEmail(user, newEmail);
          console.log("Email updated successfully");
        }
        // Update the email in settings state
        setSettings((prevSettings) => ({
          ...prevSettings,
          email: newEmail, // Update the email
        }));
      }
  
      // Update settings in the backend
      await updateSettings();
  
      // Provide feedback to the user
      Alert.alert("Success", "Your settings have been updated successfully!");
    } catch (error) {
      console.error("Error during save operation:", error);
    } finally {
      setLoading(false);
      setIsEditing(false); // Disable editing mode
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
        setRefresh((prev) => !prev);
        setIsEditing(false);
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
      // Update password if provided
      if (newPassword !== '' && newPassword.length >= 6) {
        await updatePassword(user, newPassword);
        alert('Credentials updated successfully');
        } else if(newPassword !== '') {
            alert('Password must be at least 6 characters long');
            return;
        }
        else if(newPassword.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }
  
      // **Force user refresh**
      await user.reload();  // <-- Ensures latest user data
      setUser(auth.currentUser); // <-- Update state with latest user info
  
      // Fetch latest profile details
      fetchProfile();

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
        <TouchableOpacity 
                  style={styles.headerButton} 
        ></TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={toggleEditing}
        >
        {!isEditing && (
        <Text style={styles.headerButtonText}>Edit</Text>
        )}
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
                <Text style={styles.settingLabel}> First Name: </Text>
                <TextInput
                style={styles.input}
                value={settings.firstName || ''}
                onChangeText={(text) =>
                    setSettings({ ...settings, firstName: text })
                }
                />
                <Text style={styles.settingLabel}> Last Name: </Text>
                <TextInput
                style={styles.input}
                value={settings.lastName || ''}
                onChangeText={(text) =>
                    setSettings({ ...settings, lastName: text })
                }
                />
                <Text style={styles.settingLabel}>Email:</Text>
                <TextInput
                style={styles.input}
                value={newEmail || settings.email} // Use newEmail for input value; fall back to settings.email if newEmail is empty
                onChangeText={(text) => {
                    setNewEmail(text); // Update newEmail to the entered text
                    if (text !== settings.email) {
                    setEmailChanged(true); // If email is modified, mark it as changed
                    } else {
                    setEmailChanged(false); // If email is the same as the settings, mark it as not changed
                    }
                }}
                placeholder="Email"
                keyboardType="email-address"
                />



                <Text style={styles.settingLabel}> Birthday: </Text>
                <TextInput
                  style={styles.input}
                  value={settings.birthday || ''}
                  onChangeText={(text) => setSettings({ ...settings, birthday: text })}
                  placeholder="Birthday"
                />
                <Text style={styles.settingLabel}> Ethnicity: </Text>
                <TextInput
                  style={styles.input}
                  value={settings.ethnicity || ''}
                  onChangeText={(text) => setSettings({ ...settings, ethnicity: text })}
                  placeholder="Ethnicity"
                />
                <Text style={styles.settingLabel}> Gender: </Text>
                <TextInput
                  style={styles.input}
                  value={settings.gender || ''}
                  onChangeText={(text) => setSettings({ ...settings, gender: text })}
                  placeholder="Gender"
                />
                <Text style={styles.settingLabel}> Pronouns: </Text>
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
            <Text style={styles.settingLabel}> First Name: </Text>
            <View style={styles.displayField}>
                <Text style={styles.settingContent}> {settings.firstName}</Text>
            </View>
            <Text style={styles.settingLabel}> Last Name: </Text>
            <View style={styles.displayField}>
                <Text style={styles.settingContent}> {settings.lastName}</Text>
            </View>
            <Text style={styles.settingLabel}> Email: </Text>
            <View style={styles.displayField}>
                <Text style={styles.settingContent}> {settings.email}</Text>
            </View>
            <Text style={styles.settingLabel}> Birthday: </Text>
            <View style={styles.displayField}>
                <Text style={styles.settingContent}>{settings.birthday}</Text>
            </View>
            <Text style={styles.settingLabel}> Ethnicity: </Text>
            <View style={styles.displayField}>
                <Text style={styles.settingContent}>{settings.ethnicity}</Text>
            </View>
            <Text style={styles.settingLabel}> Gender: </Text>
            <View style={styles.displayField}>
                <Text style={styles.settingContent}>{settings.gender}</Text>
            </View>
            <Text style={styles.settingLabel}> Pronouns: </Text>
            <View style={styles.displayField}>
                <Text style={styles.settingContent}>{settings.pronouns}</Text>
            </View>
                </>
            )}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Credentials</Text>
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
      
      {!isEditing && (
    <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => auth.signOut()}>
        <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Update Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteAccount} onPress={deleteAccount}>
        <Text style={styles.deleteAccountText}>Delete Account</Text>
        </TouchableOpacity>
    </View>
    )}

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
    
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },

  saveButton: {
    backgroundColor: '#534E5B',
    paddingVertical: 15,
    marginTop: 20,
    borderRadius: 30,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    width: "50%",
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '300',
    textAlign: 'center',
  },

  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'black',
    borderRadius: 30,
    backgroundColor: 'transparent',
    color: '#000', // ensures text is visible on transparent bg
    fontSize: 16,
  },

  settingContent: {
    fontSize: 16,
    marginVertical: 5,
    color: '#534E5B',
  },
  settingLabel: {
    fontSize: 16,
    marginVertical: 10,
    fontWeight: 'bold',
  },
  button: {
    padding: 10,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#534E5B",
    marginTop: 10,
    paddingHorizontal: 20,
    width: "100%",
  },
  buttonsContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center", // Optional, for aligning child content inside the container
    alignSelf: "center", // <-- This centers the container itself in its parent
    marginTop: 20,
    width: "50%",
  },
  deleteAccount: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingHorizontal: 20,
    width: "100%",
  },
  deleteAccountText: {
    color: "534E5B",
    fontWeight: "500",
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
    color: '#000',
  },
  modalButton: {
    backgroundColor: '#534E5B',
    padding: 10,
    borderRadius: 30,
    width: "75%",
    alignItems: 'center',
    marginVertical: 5,
  },
  text: {
    fontSize: 18,
    textAlign: "center",
  },
  displayField: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: 'black',
    borderRadius: 30,
    paddingVertical: 7,
    paddingHorizontal: 20,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
});
